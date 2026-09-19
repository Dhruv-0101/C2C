import { HTTP_STATUS } from '../constants/http-status.js';
import { sendErrorResponse } from '../utils/response.util.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * 🚨 GLOBAL EXPRESS ERROR HANDLING MIDDLEWARE:
 * 
 * Central triage for all uncaught exceptions, operational errors, Prisma database codes,
 * JWT authentication failures, Multer file upload limits, and malformed JSON payloads.
 * 
 * Enterprise Standards Enforced:
 * 1. Central Logging: Uses logger utility for structured logs across dev & prod.
 * 2. Info Leak Prevention: Masks internal unexpected 500 error messages in production.
 * 3. Specialized Handlers: Prisma (P2002, P2025), JWT (invalid, expired), Multer (size limit), SyntaxError (bad JSON).
 * 4. Standardized Output: Always returns { success: false, message, errors }.
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];
  let isOperational = err.isOperational || false;

  // 1. Centralized Error Logging (Structured JSON in Prod, Colorized in Dev)
  logger.error(
    `[${req.method}] ${req.originalUrl} - ${err.message || 'Unhandled Error'}`,
    {
      statusCode,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
      ip: req.ip,
      userId: req.user?.id,
    }
  );

  // 2. Handle Prisma Database Duplicate Key Violations (P2002)
  if (err.code === 'P2002') {
    statusCode = HTTP_STATUS.CONFLICT; // 409 Conflict
    const targetFields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    message = `Duplicate entry error. Unique constraint failed on: ${targetFields}`;
    isOperational = true;
  }

  // 3. Handle Prisma Record Not Found on update/delete (P2025)
  if (err.code === 'P2025') {
    statusCode = HTTP_STATUS.NOT_FOUND; // 404 Not Found
    message = err.meta?.cause || 'Requested database record not found.';
    isOperational = true;
  }

  // 4. Handle Tampered / Invalid JWT Tokens
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED; // 401 Unauthorized
    message = 'Invalid authentication token';
    isOperational = true;
  }

  // 5. Handle Expired JWT Tokens
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED; // 401 Unauthorized
    message = 'Authentication token expired';
    isOperational = true;
  }

  // 6. Handle Multer File Upload Errors (e.g. file size exceeded)
  if (err.name === 'MulterError') {
    statusCode = HTTP_STATUS.BAD_REQUEST; // 400 Bad Request
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds maximum allowed size limit.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected upload field: ${err.field || 'file'}`;
    } else {
      message = `File upload error: ${err.message}`;
    }
    isOperational = true;
  }

  // 7. Handle Malformed JSON body sent by client (SyntaxError from express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid JSON syntax in request body.';
    isOperational = true;
  }

  // 8. Handle Fallback Zod Validation Errors
  if (err.name === 'ZodError' && Array.isArray(err.errors)) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.').replace(/^(body|query|params)\./, ''),
      message: e.message,
    }));
    isOperational = true;
  }

  // 9. SECURITY: In Production, never expose raw internal server error details to clients
  if (!isOperational && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR && env.NODE_ENV === 'production') {
    message = 'An unexpected internal server error occurred. Please try again later.';
  }

  // Send clean, standardized JSON error response to client
  return sendErrorResponse(res, {
    statusCode,
    message,
    errors,
  });
}

