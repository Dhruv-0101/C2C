import { HTTP_STATUS } from '../constants/http-status.js';
import { sendErrorResponse } from '../utils/response.util.js';
import { env } from '../../config/env.js';

/**
 * Global Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  const origin = req.headers?.origin;
  if (origin && !res.headersSent) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (env.NODE_ENV === 'development') {
    console.error('💥 Error Stack:', err);
  }

  // Handle Prisma Known Request Errors (e.g. Unique constraint violations)
  if (err.code === 'P2002') {
    statusCode = HTTP_STATUS.CONFLICT;
    const targetFields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    message = `Duplicate entry error. Unique constraint failed on: ${targetFields}`;
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token expired';
  }

  return sendErrorResponse(res, {
    statusCode,
    message,
    errors,
  });
}
