import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../constants/http-status.js';

/**
 * Global Rate Limiter: 100 requests per 15-minute window per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'rate_limit', message: 'Rate limit exceeded (100 requests / 15 mins)' }],
    });
  },
});

/**
 * Strict Auth Rate Limiter: 10 requests per 15-minute window per IP (Brute-force protection)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many login or signup attempts from this IP address. Please try again after 15 minutes.',
      errors: [{ field: 'auth_rate_limit', message: 'Brute-force protection activated (10 attempts / 15 mins)' }],
    });
  },
});
