import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as systemLogic from './system.logic.js';

/**
 * 🎮 System Controller
 * Handles incoming status requests and dispatches structured JSON responses.
 */

/**
 * GET /api/v1/system/status
 * Fetches real-time status of all BrandFlow micro-components, latencies, and uptime.
 */
export async function getSystemStatus(req, res, next) {
  try {
    const statusData = await systemLogic.getSystemStatus();
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'System status retrieved successfully',
      data: statusData,
    });
  } catch (error) {
    next(error);
  }
}
