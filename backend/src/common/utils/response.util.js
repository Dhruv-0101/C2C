import { HTTP_STATUS } from '../constants/http-status.js';

/**
 * ==================================================================================================
 * 🌐 STANDARDIZED API RESPONSE UTILITY (Single Source of Truth)
 * ==================================================================================================
 * 
 * Real World Analogy: Universal Currency & Standard Passport Control 🛂
 * In an enterprise distributed system, if every micro-module formats its JSON responses 
 * differently (e.g. one returning { result: ... }, another { payload: ... }, another { err: ... }), 
 * the Frontend (TanStack Query, Axios, Redux) breaks or requires messy custom parsing per route!
 * 
 * This utility guarantees that 100% of API endpoints across BrandFlow return a strictly 
 * standardized JSON envelope complying with the system architecture:
 * 
 * ✅ Success Contract:
 * {
 *   "success": true,
 *   "message": "Success",
 *   "data": { ... },
 *   "meta": { ... } // (Optional: pagination metadata)
 * }
 * 
 * ❌ Error Contract:
 * {
 *   "success": false,
 *   "message": "Error description",
 *   "errors": [ { "field": "email", "message": "..." } ],
 *   "code": "ERROR_CODE" // (Optional: domain error code)
 * }
 * ==================================================================================================
 */

/**
 * Standardized API Success Response Formatter
 * 
 * @param {import('express').Response} res - Express HTTP response object
 * @param {Object} options
 * @param {number} [options.statusCode=200] - HTTP Status Code (from HTTP_STATUS enum)
 * @param {string} [options.message='Success'] - Human-readable success message
 * @param {*} [options.data=null] - Primary payload object, array, or boolean
 * @param {Object} [options.meta=undefined] - Optional pagination or cursor metadata
 * @returns {import('express').Response}
 */
export function sendSuccessResponse(res, {
  statusCode = HTTP_STATUS.OK,
  message = 'Success',
  data = null,
  meta = undefined,
}) {
  const responseBody = {
    success: true,
    message,
    data,
  };

  // Attach pagination / metadata only when provided
  if (meta !== undefined) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
}

/**
 * Standardized API Error Response Formatter
 * 
 * @param {import('express').Response} res - Express HTTP response object
 * @param {Object} options
 * @param {number} [options.statusCode=500] - HTTP Status Code (from HTTP_STATUS enum)
 * @param {string} [options.message='Internal Server Error'] - User-safe error description
 * @param {Array<Object>} [options.errors=[]] - Array of specific validation or field errors
 * @param {string} [options.code=undefined] - Optional machine-readable error identifier (e.g. 'LIMIT_EXCEEDED')
 * @param {*} [options.data=undefined] - Optional contextual debug or recovery metadata
 * @returns {import('express').Response}
 */
export function sendErrorResponse(res, {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message = 'Internal Server Error',
  errors = [],
  code = undefined,
  data = undefined,
}) {
  const responseBody = {
    success: false,
    message,
    errors,
  };

  if (code !== undefined) {
    responseBody.code = code;
  }

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
}
