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

/**
 * 🌐 Resolve target frontend client URL from request headers or encoded OAuth state
 *
 * @param {import('express').Request} req - Express request
 * @param {string} [state] - Optional base64 encoded OAuth state
 * @returns {string} Fully qualified client URL
 */
export const resolveClientUrl = (req, state) => {
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      if (decoded.clientUrl && typeof decoded.clientUrl === 'string' && decoded.clientUrl.startsWith('http')) {
        return decoded.clientUrl.replace(/\/$/, '');
      }
    } catch {
      // ignore state JSON parse error
    }
  }

  const origin = req?.get('origin');
  if (origin && typeof origin === 'string' && origin.startsWith('http')) {
    return origin.replace(/\/$/, '');
  }

  const referer = req?.get('referer');
  if (referer && typeof referer === 'string' && referer.startsWith('http')) {
    try {
      return new URL(referer).origin.replace(/\/$/, '');
    } catch {
      // ignore URL parse error
    }
  }

  return (env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
};
