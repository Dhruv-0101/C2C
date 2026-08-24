import { postLogic } from './post.logic.js';

export const postController = {
  /**
   * GET /api/v1/posts
   * Get all user generated posts
   */
  getUserPosts: async (req, res, next) => {
    try {
      const posts = await postLogic.getUserPosts(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'User posts retrieved successfully',
        data: { posts },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/posts/scheduled
   * Get user scheduled posts queue
   */
  getScheduledPosts: async (req, res, next) => {
    try {
      const scheduledPosts = await postLogic.getScheduledPosts(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Scheduled posts queue retrieved successfully',
        data: { scheduledPosts },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/posts/publish-now
   * Instant mock social media publishing
   */
  publishNow: async (req, res, next) => {
    try {
      const result = await postLogic.publishNow(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Post published successfully across platforms 🎉',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/posts/schedule
   * Schedule post for future date & time
   */
  schedulePost: async (req, res, next) => {
    try {
      const result = await postLogic.schedulePost(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Post scheduled successfully ⏰',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/posts/trigger-scheduled-jobs
   * Manual Test Trigger Endpoint to force-run cron dispatcher
   */
  triggerScheduledJobs: async (req, res, next) => {
    try {
      const result = await postLogic.triggerScheduledJobs();
      return res.status(200).json({
        success: true,
        message: 'Scheduled job dispatcher cycle executed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/posts
   * Save newly generated composited post
   */
  createPost: async (req, res, next) => {
    try {
      const post = await postLogic.createPost(req.user.id, req.body, req.fileBuffer);
      return res.status(201).json({
        success: true,
        message: 'Post generated and saved successfully',
        data: { post },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/posts/:id
   * Delete post
   */
  deletePost: async (req, res, next) => {
    try {
      const { id } = req.params;
      await postLogic.deletePost(id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  },
};
