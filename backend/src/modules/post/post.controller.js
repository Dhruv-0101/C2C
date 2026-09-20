import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import * as postLogic from './post.logic.js';

/**
 * 📝 POST CONTROLLER (HTTP Presentation Layer)
 * Strictly orchestrates incoming HTTP requests, validates authorization, and dispatches to post business logic.
 * Zero business logic or database queries exist in this layer.
 */

/**
 * GET /api/v1/posts
 * Get all user generated posts
 */
export async function getUserPosts(req, res, next) {
  try {
    const result = await postLogic.getUserPosts(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'User posts retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/posts/scheduled
 * Get user scheduled posts queue
 */
export async function getScheduledPosts(req, res, next) {
  try {
    const result = await postLogic.getScheduledPosts(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Scheduled posts queue retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/posts/publish-now
 * Instant mock social media publishing
 */
export async function publishNow(req, res, next) {
  try {
    const result = await postLogic.publishNow(req.user.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Post published successfully across platforms 🎉',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/posts/schedule
 * Schedule post for future date & time
 */
export async function schedulePost(req, res, next) {
  try {
    const result = await postLogic.schedulePost(req.user.id, req.body);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Post scheduled successfully ⏰',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/posts
 * Save newly generated composited post
 */
export async function createPost(req, res, next) {
  try {
    const fileBuffer = req.fileBuffer || req.file?.buffer;
    const post = await postLogic.createPost(req.user.id, req.body, fileBuffer);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Post generated and saved successfully',
      data: { post },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/posts/:id/graphic
 * Update composited graphic for an existing post (e.g. sync with latest BrandKit)
 */
export async function updatePostGraphic(req, res, next) {
  try {
    const fileBuffer = req.fileBuffer || req.file?.buffer;
    const updatedPost = await postLogic.updatePostGraphic(
      req.user.id,
      req.params.id,
      req.body,
      fileBuffer
    );
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Post graphic updated successfully',
      data: { post: updatedPost },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/posts/:id
 * Delete post
 */
export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    await postLogic.deletePost(id, req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Post deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/posts/admin/all
 * Enterprise Admin: Query all generated posts across platform with multi-filters
 */
export async function getAdminPosts(req, res, next) {
  try {
    const result = await postLogic.getAdminPosts(req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Admin posts retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/posts/admin/analytics
 * Enterprise Admin: Get aggregated volume analytics and breakdowns
 */
export async function getAdminPostAnalytics(req, res, next) {
  try {
    const result = await postLogic.getAdminPostAnalytics();
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Admin post analytics retrieved successfully',
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
}

// Backwards-compatible object export
export const postController = {
  getUserPosts,
  getScheduledPosts,
  publishNow,
  schedulePost,
  createPost,
  updatePostGraphic,
  deletePost,
  getAdminPosts,
  getAdminPostAnalytics,
};
