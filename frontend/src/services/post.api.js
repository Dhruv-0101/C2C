import api from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export const postApi = {
  /**
   * Get all user posts
   */
  getUserPosts: async () => {
    const response = await api.get(API_ENDPOINTS.POSTS.BASE);
    return response.data;
  },

  /**
   * Create & save composited post
   */
  createPost: async (postData) => {
    const response = await api.post(API_ENDPOINTS.POSTS.BASE, postData);
    return response.data;
  },

  /**
   * Delete post
   */
  deletePost: async (id) => {
    const response = await api.delete(API_ENDPOINTS.POSTS.BY_ID(id));
    return response.data;
  },
};
