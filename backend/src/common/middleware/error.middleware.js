import { HTTP_STATUS } from '../constants/http-status.js';
import { sendErrorResponse } from '../utils/response.util.js';
import { env } from '../../config/env.js';

/**
 * 🚨 GLOBAL EXPRESS ERROR HANDLING MIDDLEWARE:
 * 
 * A) Real World Analogy: Hospital Emergency Room Triage Doctor 🩺 / Car Airbag System 🛡️.
 *    Whenever ANY controller, database query, or validator crashes or calls next(err), Express 
 *    automatically bypasses normal routes and jumps straight into this 4-argument (err, req, res, next) handler.
 * 
 * B) Why it is Critical:
 *    1. Prevents Server Crash: Prevents unhandled exceptions from crashing the Node.js process.
 *    2. Prevents Info Leaks: Strips raw internal database error stacks before sending responses to the client.
 *    3. Standardized JSON Format: Guarantees every single error across all 10 modules returns the exact 
 *       same JSON format { success: false, statusCode, message, errors }.
 */
export function errorHandler(err, req, res, next) {
  // Default to 500 Internal Server Error if status is not explicitly set
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Print full stack trace in development console for fast debugging
  if (env.NODE_ENV === 'development') {
    console.error('💥 [Global Error Handler]:', err);
  }

  // 1. Handle Prisma Database Duplicate Key Violations (e.g. Email already registered)
  if (err.code === 'P2002') {
    statusCode = HTTP_STATUS.CONFLICT; // 409 Conflict
    const targetFields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    message = `Duplicate entry error. Unique constraint failed on: ${targetFields}`;
  }

  // 2. Handle Tampered / Invalid JWT Tokens
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED; // 401 Unauthorized
    message = 'Invalid authentication token';
  }

  // 3. Handle Expired JWT Tokens
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED; // 401 Unauthorized
    message = 'Authentication token expired';
  }

  // Send clean, standardized JSON error response to client
  return sendErrorResponse(res, {
    statusCode,
    message,
    errors,
  });
}
