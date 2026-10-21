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
 * Adaptive Caption Generation: instantaneous (<1.5s) when traffic is low; queued with position when under load.
 */
export async function generateCaption(req, res, next) {
  try {
    const result = await aiLogic.generateCaptionSmart(req.user.id, req.body);

    const message = result.isQueued
      ? 'Caption generation enqueued with live position tracking ⏳'
      : 'AI Caption generated successfully ✨';

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/generate-image
 * Enqueue high-res commercial post image generation with Nano Banana 2.1 via BullMQ
 */
export async function generatePostImage(req, res, next) {
  try {
    const result = await aiLogic.enqueuePostImage(req.user.id, req.body);

    const message = result.isQueued
      ? 'AI Post Image enqueued with live queue tracking & countdown 🍌'
      : 'AI Post Image generated successfully with Nano Banana 2.1 🍌';

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/ai/jobs/:jobId/status
 * Poll real-time progress, position in line, estimated countdown, and final generated visual/copy
 */
export async function getJobStatus(req, res, next) {
  try {
    const { jobId } = req.params;
    const type = req.query.type || 'image';
    const result = await aiLogic.getAiJobStatus(jobId, type);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'AI Job status retrieved successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/ai/generate-carousel
 * Generate comprehensive multi-slide social media carousel deck (Hook, Content slides, CTA, Caption & Tags)
 */
export async function generateCarousel(req, res, next) {
  try {
    const result = await aiLogic.generateCarousel(req.user.id, req.body);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'AI Carousel deck generated successfully 🎠✨',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// Backwards-compatible object export
export const aiController = {
  generateCaption,
  generatePostImage,
  getJobStatus,
  generateCarousel,
};

