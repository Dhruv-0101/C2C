import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as aiLogic from './ai.logic.js';

/**
 * 🤖 AI CONTROLLER (HTTP Presentation Layer)
 * Orchestrates incoming HTTP requests, validates authorization, and dispatches to AI logic.
 * Zero business logic or database queries exist in this layer.
 */

/**
 * POST /api/v1/ai/generate-caption
 * Generate AI caption & hashtags tailored to platform, tone, and brand kit
 */
export async function generateCaption(req, res, next) {
  try {
    const result = await aiLogic.generateCaption(req.user.id, req.body);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'AI Caption generated successfully ✨',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// Backwards-compatible object export
export const aiController = {
  generateCaption,
};
