import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/http-status.js';
import { sendErrorResponse } from '../utils/response.util.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * Higher-order middleware helper:
 * - Active by default in production (`NODE_ENV === 'production'`).
 * - In development/test, disabled by default for frictionless local building.
 * - Can be explicitly toggled on/off in any environment via ENABLE_RATE_LIMITER="true" | "false".
 */
const skipIfDisabled = (limiterInstance) => {
  return (req, res, next) => {
    // 1. Explicit environment toggle takes highest precedence
    if (env.ENABLE_RATE_LIMITER === 'false' || process.env.ENABLE_RATE_LIMITER === 'false') {
      return next();
    }

    if (env.ENABLE_RATE_LIMITER === 'true' || process.env.ENABLE_RATE_LIMITER === 'true') {
      return limiterInstance(req, res, next);
    }

    // 2. Default behavior: enabled in production, disabled in development/test
    const isProduction = env.NODE_ENV === 'production';
    if (!isProduction) {
      return next();
    }

    return limiterInstance(req, res, next);
  };
};

/**
 * Standard key generator: Uses trust-proxy resolved client IP with safe fallbacks
 */
const keyGenerator = (req) => {
  return req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
};

/**
 * 🛡️ 1. GLOBAL RATE LIMITER (GENERAL TRAFFIC GOVERNOR):
 * 
 * - Real World Analogy: Metro Station Turnstile Gate 🎫.
 * - USE CASE: Protects all general API endpoints (/categories, /posts, /templates) against DDoS & scraping bots.
 * - windowMs: 15 minutes (15 * 60 * 1000 ms) sliding time window per IP.
 * - max: Caps requests to 2000 per IP inside the 15-minute window for SPA applications.
 * - standardHeaders: Sends modern 'RateLimit-Limit', 'RateLimit-Remaining' headers.
 * - legacyHeaders: Disables old 'X-RateLimit-*' headers to keep response headers lightweight.
 */
const _globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes sliding window
  max: 2000, // High capacity limit of 2000 requests per IP per 15-min window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    const clientIp = keyGenerator(req);
    logger.warn(`⚠️ Global rate limit exceeded for IP: ${clientIp}`);
    res.setHeader('Retry-After', 900); // 15 minutes in seconds
    return sendErrorResponse(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'rate_limit', message: 'Rate limit exceeded (2000 requests / 15 mins)' }],
    });
  },
});

/**
 * 🔒 2. STRICT AUTH RATE LIMITER (BRUTE-FORCE & PASSWORD GUESSING SHIELD):
 * 
 * - Real World Analogy: Bank Vault Keypad Lockout 🏦.
 * - USE CASE: Protects sensitive Auth endpoints (/auth/login, /auth/signup, /auth/forgot-password, /2fa).
 * - max: 50 requests per 15-minute window per IP.
 * - IF EXCEEDED: Instantly locks out the offending IP with 429 Too Many Requests status for 15 minutes.
 */
const _authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes sliding window
  max: 50, // 50 auth attempts per IP per 15-min window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    const clientIp = keyGenerator(req);
    logger.warn(`⚠️ Auth rate limit exceeded for IP: ${clientIp}`);
    res.setHeader('Retry-After', 900);
    return sendErrorResponse(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: 'Too many login or authentication attempts from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'auth_rate_limit', message: 'Brute-force protection activated (50 attempts / 15 mins)' }],
    });
  },
});

/**
 * 🤖 3. AI GENERATION RATE LIMITER (EXPENSIVE API & GPU PROTECTION):
 * 
 * - Real World Analogy: Metered Electric Charging Station ⚡.
 * - USE CASE: Protects expensive Google Gemini AI API endpoints (/api/v1/ai/generate-caption, /api/v1/ai/suggest-hashtags).
 * - windowMs: 1 minute (60 * 1000 ms) sliding time window per IP.
 * - max: 30 generations per minute per IP.
 * - IF EXCEEDED: Returns 429 to prevent draining external AI token quotas or unexpected provider bills.
 */
const _aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute sliding window
  max: 30, // 30 AI generations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => {
    const clientIp = keyGenerator(req);
    logger.warn(`⚠️ AI generation rate limit exceeded for IP: ${clientIp}`);
    res.setHeader('Retry-After', 60);
    return sendErrorResponse(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: 'AI generation request rate exceeded. Please wait a moment before generating more captions.',
      errors: [{ field: 'ai_rate_limit', message: 'AI generation limit reached (30 requests / minute)' }],
    });
  },
});

export const globalLimiter = skipIfDisabled(_globalLimiter);
export const authLimiter = skipIfDisabled(_authLimiter);
export const aiLimiter = skipIfDisabled(_aiLimiter);

