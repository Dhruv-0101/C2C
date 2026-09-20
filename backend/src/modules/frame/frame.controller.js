import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as frameLogic from './frame.logic.js';

/**
 * 🖼️ FRAME CONTROLLER (HTTP Presentation Layer)
 * Strictly orchestrates HTTP requests and responses.
 * Zero business logic or database queries exist in this layer.
 */

/**
 * GET /api/v1/frames
 * Retrieve paginated active Canva frames
 */
export async function getFrames(req, res, next) {
  try {
    const result = await frameLogic.getFrames(req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Frames retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/frames/:id
 * Retrieve single frame by ID
 */
export async function getFrameById(req, res, next) {
  try {
    const frame = await frameLogic.getFrameById(req.params.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Frame retrieved successfully',
      data: { frame },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/frames
 * Create a new transparent PNG frame overlay
 */
export async function createFrame(req, res, next) {
  try {
    const payload = req.body;
    const fileBuffer = req.fileBuffer || req.file?.buffer;

    const frame = await frameLogic.createFrame(payload, fileBuffer, req.user?.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Frame created successfully',
      data: { frame },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/frames/:id
 * Soft delete / deactivate frame and cleanup Cloudinary storage
 */
export async function deleteFrame(req, res, next) {
  try {
    await frameLogic.deleteFrame(req.params.id);

    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Frame deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// Backwards-compatible object export
export const frameController = {
  getFrames,
  getFrameById,
  createFrame,
  deleteFrame,
};
