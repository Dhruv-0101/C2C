import { createRequire } from 'node:module';
import QRCode from 'qrcode';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const speakeasy = require('speakeasy');

/**
 * Generate 2FA Secret and QR Code Data URL for Authenticator App scanning
 */
export async function generateTwoFactorSetup(email, existingSecret = null) {
  let secret = existingSecret;

  if (!secret) {
    const generated = speakeasy.generateSecret({
      length: 20,
      name: `BrandFlow (${email})`,
      issuer: 'BrandFlow',
    });
    secret = generated.base32;
  }

  // Standard Google Authenticator / Authy TOTP URI
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: `BrandFlow (${email})`,
    issuer: 'BrandFlow',
    encoding: 'base32',
  });

  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret,
    qrCodeUrl,
    otpauthUrl,
  };
}

/**
 * Verify 6-digit TOTP token strictly against user's 2FA secret
 */
export function verifyTwoFactorToken(token, secret) {
  try {
    if (!token || !secret) return false;

    const cleanToken = String(token).trim().replace(/\s+/g, '');
    const cleanSecret = String(secret).trim().replace(/\s+/g, '');

    // Speakeasy Google Authenticator TOTP verification (window: 2 allows 60s clock drift)
    const isValid = speakeasy.totp.verify({
      secret: cleanSecret,
      encoding: 'base32',
      token: cleanToken,
      window: 2,
    });

    return Boolean(isValid);
  } catch (error) {
    return false;
  }
}

/**
 * Generate 8 single-use 8-character backup recovery codes
 */
export function generateBackupCodes() {
  const rawCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < 8; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 char hex e.g. "A1B2C3D4"
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    rawCodes.push(code);
    hashedCodes.push(hash);
  }

  return { rawCodes, hashedCodes };
}

/**
 * Verify if a backup code matches one of stored hashed backup codes
 */
export function verifyBackupCode(inputCode, storedHashedCodes = []) {
  if (!inputCode) return { isValid: false, matchingIndex: -1 };

  const hash = crypto.createHash('sha256').update(String(inputCode).trim().toUpperCase()).digest('hex');
  const index = storedHashedCodes.indexOf(hash);
  return {
    isValid: index !== -1,
    matchingIndex: index,
  };
}
