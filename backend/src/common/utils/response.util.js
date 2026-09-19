import { HTTP_STATUS } from '../constants/http-status.js';

/**
 * Standardized API Success Response Formatter
 */
export function sendSuccessResponse(res, { statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = undefined }) {
  const responseBody = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
}

/**
 * Standardized API Error Response Formatter
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

