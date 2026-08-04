import api from './api.service';

export const postApi = {
  /**
   * Get all user posts
   */
  getUserPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },

  /**
   * Create & save composited post
   */
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  /**
   * Delete post
   */
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};
