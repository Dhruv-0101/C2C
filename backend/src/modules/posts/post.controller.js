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
