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
   * Get user scheduled posts queue
   */
  getScheduledPosts: async () => {
    const response = await api.get(`${API_ENDPOINTS.POSTS.BASE}/scheduled`);
    return response.data;
  },

  /**
   * Instant mock social media publishing
   */
  publishNow: async (payload) => {
    const response = await api.post(`${API_ENDPOINTS.POSTS.BASE}/publish-now`, payload);
    return response.data;
  },

  /**
   * Schedule post for future date/time
   */
  schedulePost: async (payload) => {
    const response = await api.post(`${API_ENDPOINTS.POSTS.BASE}/schedule`, payload);
    return response.data;
  },

  /**
   * Manual test trigger to force-process due scheduled posts immediately
   */
  triggerScheduledJobs: async () => {
    const response = await api.post(`${API_ENDPOINTS.POSTS.BASE}/trigger-scheduled-jobs`);
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
