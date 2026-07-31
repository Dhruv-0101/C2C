import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../../config/env.js';

/**
 * Generate Short-Lived Access Token (JWT)
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

/**
 * Generate Short-Lived 2FA Pending Token (5 min expiry)
 */
export function generate2FAToken(payload) {
  return jwt.sign({ ...payload, isPending2FA: true }, env.JWT_ACCESS_SECRET, {
    expiresIn: '5m',
  });
}

/**
 * Verify 2FA Pending Token
 */
export function verify2FAToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Generate Long-Lived Refresh Token (JWT)
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Hash Refresh Token for Secure Storage in Database
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
