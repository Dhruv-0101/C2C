import crypto from 'crypto';
import { env } from '../../config/env.js';

/**
 * 🛡️ Sanitize a single social account object
 * Strictly strips sensitive tokens (accessToken, refreshToken) before returning to client (OWASP Data Minimization).
 *
 * @param {Object|null} account - Raw social account record from database
 * @returns {Object|null} Sanitized account object
 */
export const sanitizeSocialAccount = (account) => {
  if (!account) return null;

  return {
    id: account.id,
    platform: account.platform,
    accountName: account.accountName,
    platformUserId: account.platformUserId,
    isConnected: Boolean(account.isConnected),
    tokenExpiresAt: account.tokenExpiresAt || null,
    createdAt: account.createdAt,
  };
};

/**
 * 🛡️ Sanitize a list of social account objects
 *
 * @param {Array} accounts - Raw social account records
 * @returns {Array} List of sanitized account objects
 */
export const sanitizeSocialAccounts = (accounts = []) => {
  if (!Array.isArray(accounts)) return [];
  return accounts.map(sanitizeSocialAccount).filter(Boolean);
};

// Secret used for HMAC state signing
const STATE_SECRET = env.JWT_ACCESS_SECRET || 'brandflow-oauth-state-secret';

const ALLOWED_CLIENT_URLS = [
  env.CLIENT_URL,
  env.CLIENT_URL_PROD,
  env.CLIENT_URL_DEV,
  'https://65-0-208-238.sslip.io',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean).map((url) => url.replace(/\/$/, ''));

/**
 * Generate a cryptographically signed OAuth state string.
 * Format: base64url(payload).signature
 *
 * @param {Object} payload - { userId, clientUrl }
 * @returns {string} Signed state token
 */
export const createSignedOAuthState = (payload = {}) => {
  const data = {
    ...payload,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const jsonStr = JSON.stringify(data);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(base64Payload)
    .digest('hex');

  return `${base64Payload}.${signature}`;
};

/**
 * Verify and decode a cryptographically signed OAuth state string.
 * Enforces valid HMAC signature and 15-minute expiry window.
 *
 * @param {string} state - The signed state token
 * @returns {Object|null} Decoded payload or null if invalid/expired
 */
export const verifySignedOAuthState = (state) => {
  if (!state || typeof state !== 'string') return null;

  const parts = state.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(base64Payload)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!payload.timestamp || Date.now() - payload.timestamp > 15 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

/**
 * 🌐 Resolve target frontend client URL safely
 * Prevents open redirect attacks by validating against whitelisted domains.
 *
 * @param {import('express').Request} req - Express request
 * @param {string} [state] - Optional signed OAuth state
 * @returns {string} Fully qualified and validated client URL
 */
export const resolveClientUrl = (req, state) => {
  let candidateUrl = null;

  if (state) {
    const decoded = verifySignedOAuthState(state);
    if (decoded?.clientUrl && typeof decoded.clientUrl === 'string') {
      candidateUrl = decoded.clientUrl.replace(/\/$/, '');
    }
  }

  if (!candidateUrl) {
    const origin = req?.get('origin');
    if (origin && typeof origin === 'string') {
      candidateUrl = origin.replace(/\/$/, '');
    }
  }

  if (!candidateUrl) {
    const referer = req?.get('referer');
    if (referer && typeof referer === 'string') {
      try {
        candidateUrl = new URL(referer).origin.replace(/\/$/, '');
      } catch {
        // ignore URL parse error
      }
    }
  }

  if (candidateUrl && ALLOWED_CLIENT_URLS.includes(candidateUrl)) {
    return candidateUrl;
  }

  return (env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
};
