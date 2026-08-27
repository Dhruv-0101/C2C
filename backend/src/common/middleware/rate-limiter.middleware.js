import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/http-status.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * Higher-order middleware to bypass rate limiting when ENABLE_RATE_LIMITER is "false"
 */
const skipIfDisabled = (limiterInstance) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS' || env.ENABLE_RATE_LIMITER === 'false') {
      return next();
    }
    return limiterInstance(req, res, next);
  };
};

/**
 * Global Rate Limiter: 1000 requests per 15-minute window per IP
 */
const _globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    if (req.headers.origin && !res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'rate_limit', message: 'Rate limit exceeded (1000 requests / 15 mins)' }],
    });
  },
});

/**
 * Strict Auth Rate Limiter: 30 requests per 15-minute window per IP (Brute-force protection)
 */
const _authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`⚠️ Auth rate limit exceeded for IP: ${req.ip}`);
    if (req.headers.origin && !res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many login or signup attempts from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'auth_rate_limit', message: 'Brute-force protection activated (30 attempts / 15 mins)' }],
    });
  },
});

export const globalLimiter = skipIfDisabled(_globalLimiter);
export const authLimiter = skipIfDisabled(_authLimiter);
