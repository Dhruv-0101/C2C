import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/http-status.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * Higher-order middleware helper: Bypasses rate limiting during automated testing or local dev
 * whenever environment variable ENABLE_RATE_LIMITER="false".
 */
const skipIfDisabled = (limiterInstance) => {
  return (req, res, next) => {
    if (env.ENABLE_RATE_LIMITER === 'false') {
      return next();
    }
    return limiterInstance(req, res, next);
  };
};

/**
 * 🛡️ 1. GLOBAL RATE LIMITER (GENERAL TRAFFIC GOVERNOR):
 * 
 * - Real World Analogy: Metro Station Turnstile Gate 🎫.
 * - USE CASE: Protects all general API endpoints (/categories, /posts, /templates) against DDoS & scraping bots.
 * - windowMs: 15 minutes (15 * 60 * 1000 ms) sliding time window per IP.
 * - max: Caps requests to 100 per IP inside the 15-minute window.
 * - standardHeaders: Sends modern 'RateLimit-Limit', 'RateLimit-Remaining' headers so frontends know remaining quota.
 * - legacyHeaders: Disables old 'X-RateLimit-*' headers to keep response headers lightweight.
 */
const _globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes sliding window
  max: 100, // Max 100 requests per IP per 15-min window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'rate_limit', message: 'Rate limit exceeded (100 requests / 15 mins)' }],
    });
  },
});

/**
 * 🔒 2. STRICT AUTH RATE LIMITER (BRUTE-FORCE & PASSWORD GUESSING SHIELD):
 * 
 * - Real World Analogy: Bank Vault Keypad Lockout 🏦.
 * - USE CASE: Protects sensitive Auth endpoints (/auth/login, /auth/signup, /auth/forgot-password).
 * - WHY 10 REQUESTS: Prevents hackers from running automated dictionary scripts trying 10,000 password guesses/sec.
 * - IF EXCEEDED: Instantly locks out the offending IP with 429 Too Many Requests status for 15 minutes.
 */
const _authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes sliding window
  max: 10, // Strict limit of 10 auth attempts per IP per 15-min window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`⚠️ Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many login or signup attempts from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'auth_rate_limit', message: 'Brute-force protection activated (10 attempts / 15 mins)' }],
    });
  },
});

export const globalLimiter = skipIfDisabled(_globalLimiter);
export const authLimiter = skipIfDisabled(_authLimiter);
