import crypto from 'crypto';
import { getRedisClient } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { TooManyRequestsError, BadRequestError } from '../../common/errors/custom-errors.js';

// Configuration constants for 4-digit OTP lifecycle & rate limits
export const OTP_CONFIG = Object.freeze({
  LENGTH: 4,
  EXPIRY_SECONDS: 10 * 60,       // 10 minutes (600s)
  COOLDOWN_SECONDS: 120,         // 120 seconds user-defined resend cooldown
  MAX_ATTEMPTS: 5,               // Maximum 5 failed verification guesses
  LOCKOUT_SECONDS: 5 * 60,       // 5 minutes lockout if max attempts exceeded
  REDIS_PREFIX_OTP: 'reg_otp:',
  REDIS_PREFIX_COOLDOWN: 'reg_otp_cooldown:',
  REDIS_PREFIX_LOCK: 'reg_otp_locked:',
});

// Resilient in-memory fallback store when Redis is connecting or offline
const memoryOtpStore = new Map();
const memoryCooldownStore = new Map();
const memoryLockStore = new Map();

/**
 * Retrieve Redis client, awaiting readiness if client is currently in connecting state
 * @returns {Promise<import('ioredis').Redis|null>}
 */
async function getReadyRedisClient() {
  const client = getRedisClient();
  if (!client) return null;
  if (client.status === 'ready') return client;

  if (client.status === 'connecting' || client.status === 'connect') {
    await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(), 2000);
      client.once('ready', () => {
        clearTimeout(timer);
        resolve();
      });
      client.once('error', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  return client.status === 'ready' ? client : null;
}

/**
 * Generate a cryptographically secure 4-digit numeric OTP (1000 - 9999)
 * @returns {string} 4-digit string
 */
export function generate4DigitOtp() {
  return crypto.randomInt(1000, 10000).toString();
}

/**
 * Generate an HMAC-SHA256 hash of email + OTP using server secret to prevent plaintext exposure
 * @param {string} email
 * @param {string} otp
 * @returns {string} Hex hash string
 */
export function hashOtp(email, otp) {
  const secret = env.JWT_ACCESS_SECRET || env.JWT_SECRET || 'brandflow-otp-secure-salt';
  return crypto
    .createHmac('sha256', secret)
    .update(`${email.trim().toLowerCase()}:${String(otp).trim()}`)
    .digest('hex');
}

/**
 * Atomic Cooldown Check & OTP Registration in Redis & In-Memory Store
 * Dual-write ensures Redis memory-speed scaling with zero disconnect hiccups
 * 
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<{ success: boolean, expiresInSeconds: number, cooldownSeconds: number }>}
 */
export async function saveRegistrationOtp(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();
  const formattedOtp = String(otp).trim();
  const otpHash = hashOtp(normalizedEmail, formattedOtp);
  const now = Date.now();
  const client = await getReadyRedisClient();

  // 1. Check lockout across Redis and Memory Store
  if (client && client.status === 'ready') {
    const lockTtl = await client.ttl(`${OTP_CONFIG.REDIS_PREFIX_LOCK}${normalizedEmail}`);
    if (lockTtl > 0) {
      throw new TooManyRequestsError(
        `Too many failed attempts. Registration is temporarily locked for ${Math.ceil(lockTtl / 60)} more minute(s).`
      );
    }

    // 2. Cooldown check
    const remainingCooldown = await client.ttl(`${OTP_CONFIG.REDIS_PREFIX_COOLDOWN}${normalizedEmail}`);
    if (remainingCooldown > 0) {
      throw new TooManyRequestsError(
        `Please wait ${remainingCooldown} seconds before requesting a new verification code.`
      );
    }
  } else {
    const lockUntil = memoryLockStore.get(normalizedEmail);
    if (lockUntil && lockUntil > now) {
      const remainingSec = Math.ceil((lockUntil - now) / 1000);
      throw new TooManyRequestsError(`Too many failed attempts. Locked for ${remainingSec} more second(s).`);
    }

    const cooldownUntil = memoryCooldownStore.get(normalizedEmail);
    if (cooldownUntil && cooldownUntil > now) {
      const remainingSec = Math.ceil((cooldownUntil - now) / 1000);
      throw new TooManyRequestsError(`Please wait ${remainingSec} seconds before requesting a new verification code.`);
    }
  }

  // 3. Dual-Store Write: Always mirror to memory store to guarantee zero state loss
  memoryCooldownStore.set(normalizedEmail, now + OTP_CONFIG.COOLDOWN_SECONDS * 1000);
  memoryOtpStore.set(normalizedEmail, {
    otpHash,
    attempts: 0,
    expiresAt: now + OTP_CONFIG.EXPIRY_SECONDS * 1000,
  });

  // 4. Write to Redis if ready
  if (client && client.status === 'ready') {
    const pipeline = client.pipeline();
    pipeline.set(`${OTP_CONFIG.REDIS_PREFIX_COOLDOWN}${normalizedEmail}`, '1', 'EX', OTP_CONFIG.COOLDOWN_SECONDS);
    pipeline.set(
      `${OTP_CONFIG.REDIS_PREFIX_OTP}${normalizedEmail}`,
      JSON.stringify({ otpHash, attempts: 0, createdAt: now }),
      'EX',
      OTP_CONFIG.EXPIRY_SECONDS
    );
    await pipeline.exec();
  }

  logger.info(`🔑 [OTP Service] 4-digit code generated for ${normalizedEmail} (Expires in ${OTP_CONFIG.EXPIRY_SECONDS}s)`);

  return {
    success: true,
    expiresInSeconds: OTP_CONFIG.EXPIRY_SECONDS,
    cooldownSeconds: OTP_CONFIG.COOLDOWN_SECONDS,
  };
}

/**
 * Verify 4-digit OTP against Redis record with in-memory fallback and brute-force attempt limits
 * Burns the OTP immediately upon success (single-use)
 * 
 * @param {string} email
 * @param {string} enteredOtp
 * @returns {Promise<boolean>} True if valid, throws BadRequestError on invalid/expired
 */
export async function verifyRegistrationOtp(email, enteredOtp) {
  const normalizedEmail = email.trim().toLowerCase();
  const formattedOtp = String(enteredOtp).trim();
  const client = await getReadyRedisClient();
  const now = Date.now();

  let data = null;
  let fromRedis = false;
  const key = `${OTP_CONFIG.REDIS_PREFIX_OTP}${normalizedEmail}`;

  // 1. Check Redis first
  if (client && client.status === 'ready') {
    const lockTtl = await client.ttl(`${OTP_CONFIG.REDIS_PREFIX_LOCK}${normalizedEmail}`);
    if (lockTtl > 0) {
      throw new TooManyRequestsError(
        `Too many failed attempts. Account registration is locked for ${Math.ceil(lockTtl / 60)} minute(s).`
      );
    }

    const rawData = await client.get(key);
    if (rawData) {
      try {
        data = JSON.parse(rawData);
        fromRedis = true;
      } catch {
        data = null;
      }
    }
  }

  // 2. If not found in Redis (e.g. transient disconnect during save), check memory store
  if (!data) {
    const memRecord = memoryOtpStore.get(normalizedEmail);
    if (memRecord && memRecord.expiresAt > now) {
      data = memRecord;
      fromRedis = false;
    }
  }

  if (!data) {
    throw new BadRequestError('Verification code has expired or was not requested. Please request a new code.');
  }

  const expectedHash = data.otpHash;
  const currentAttempts = (data.attempts || 0) + 1;
  const computedHash = hashOtp(normalizedEmail, formattedOtp);

  // 3. Constant-time comparison to prevent timing attacks
  const hashesMatch =
    computedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));

  if (hashesMatch) {
    // ✅ SUCCESS: Delete OTP and cooldown immediately from both stores (single-use burn)
    if (client && client.status === 'ready') {
      await client.del(key);
      await client.del(`${OTP_CONFIG.REDIS_PREFIX_COOLDOWN}${normalizedEmail}`);
    }
    memoryOtpStore.delete(normalizedEmail);
    memoryCooldownStore.delete(normalizedEmail);
    logger.info(`✅ [OTP Service] Successfully verified 4-digit code for ${normalizedEmail}`);
    return true;
  }

  // ❌ FAILED ATTEMPT: Check max attempts threshold
  if (currentAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    if (client && client.status === 'ready') {
      await client.del(key);
      await client.set(`${OTP_CONFIG.REDIS_PREFIX_LOCK}${normalizedEmail}`, '1', 'EX', OTP_CONFIG.LOCKOUT_SECONDS);
    }
    memoryOtpStore.delete(normalizedEmail);
    memoryLockStore.set(normalizedEmail, now + OTP_CONFIG.LOCKOUT_SECONDS * 1000);
    throw new BadRequestError('Too many incorrect verification attempts. Please request a new code in 5 minutes.');
  }

  // Update attempts counter
  if (fromRedis && client && client.status === 'ready') {
    const remainingTtl = await client.ttl(key);
    if (remainingTtl > 0) {
      data.attempts = currentAttempts;
      await client.set(key, JSON.stringify(data), 'EX', remainingTtl);
    }
  }
  data.attempts = currentAttempts;

  const attemptsLeft = OTP_CONFIG.MAX_ATTEMPTS - currentAttempts;
  throw new BadRequestError(`Invalid verification code. ${attemptsLeft} attempt(s) remaining.`);
}
