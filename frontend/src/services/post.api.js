import api from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export const postApi = {
  /**
   * Get user posts with optional pagination
   */
  getUserPosts: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.POSTS.BASE, { params });
    return response.data;
  },

  /**
   * Get user scheduled posts queue with optional pagination
   */
  getScheduledPosts: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.POSTS.SCHEDULED, { params });
    return response.data;
  },

  /**
   * Instant mock social media publishing
   */
  publishNow: async (payload) => {
    const response = await api.post(API_ENDPOINTS.POSTS.PUBLISH_NOW, payload);
    return response.data;
  },

  /**
   * Schedule post for future date/time
   */
  schedulePost: async (payload) => {
    const response = await api.post(API_ENDPOINTS.POSTS.SCHEDULE, payload);
    return response.data;
  },

  /**
   * Manual test trigger to force-process due scheduled posts immediately
   */
  triggerScheduledJobs: async () => {
    const response = await api.post(API_ENDPOINTS.POSTS.TRIGGER_SCHEDULED);
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
