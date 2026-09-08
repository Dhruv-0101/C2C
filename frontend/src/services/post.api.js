import api from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Social Post Compositing & Multi-Platform Scheduling API Service
 * Handles graphic post saving, Cloudinary base64 rendering, instant publishing, precise minute scheduling, and cron triggers in PostgreSQL database.
 */
export const postApi = {
  /**
   * GET /api/v1/posts
   * Fetches the user's generated posts history with pagination parameters.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} `{ posts: Array<Object>, meta: PaginationMeta }`
   */
  getUserPosts: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.POSTS.BASE, { params });
    return response.data;
  },

  /**
   * GET /api/v1/posts/scheduled
   * Fetches active queue of scheduled posts pending automated social publishing from database.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} `{ scheduledPosts: Array<Object>, meta: PaginationMeta }`
   */
  getScheduledPosts: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.POSTS.SCHEDULED, { params });
    return response.data;
  },

  /**
   * POST /api/v1/posts/publish-now
   * Publishes a composited graphic post immediately across selected connected social channels (Instagram Graph API, Facebook Pages, LinkedIn UGC Posts).
   *
   * @param {Object} payload
   * @param {string} [payload.templateId] - Base template UUID
   * @param {string} [payload.festivalId] - Festival UUID if linked to an event
   * @param {string} [payload.frameId] - Frame UUID used for overlay
   * @param {string} payload.base64Graphic - High-definition HTML5 canvas composited base64 image data string
   * @param {Array<string>} payload.targetPlatforms - Target social platforms (e.g. `['INSTAGRAM', 'FACEBOOK', 'LINKEDIN']`)
   * @param {Object} [payload.userConfigJson] - Custom details override configuration JSON
   * @returns {Promise<Object>} `{ publishResult: { platformResults: Object, postUrl: string } }`
   */
  publishNow: async (payload) => {
    const response = await api.post(API_ENDPOINTS.POSTS.PUBLISH_NOW, payload);
    return response.data;
  },

  /**
   * POST /api/v1/posts/schedule
   * Schedules a post for automated publishing down to exact minute precision via BullMQ / Redis background worker queue.
   *
   * @param {Object} payload
   * @param {string} [payload.templateId] - Base template UUID
   * @param {string} [payload.festivalId] - Festival UUID
   * @param {string} [payload.frameId] - Frame UUID
   * @param {string} payload.base64Graphic - Base64 graphic string uploaded to Cloudinary CDN
   * @param {Array<string>} payload.targetPlatforms - Selected social platforms array
   * @param {string} payload.scheduledAt - Target future date ISO string (e.g. `2026-09-09T09:00:00.000Z`)
   * @returns {Promise<Object>} Scheduled job confirmation and queue payload from DB
   */
  schedulePost: async (payload) => {
    const response = await api.post(API_ENDPOINTS.POSTS.SCHEDULE, payload);
    return response.data;
  },

  /**
   * POST /api/v1/posts/trigger-scheduled-jobs
   * Admin / Test Trigger: Immediately forces processing of due scheduled jobs in background queue.
   *
   * @returns {Promise<Object>} `{ message: string, data: { count: number } }`
   */
  triggerScheduledJobs: async () => {
    const response = await api.post(API_ENDPOINTS.POSTS.TRIGGER_SCHEDULED);
    return response.data;
  },

  /**
   * POST /api/v1/posts
   * Saves a composited 1080x1080 graphic post to Cloudinary CDN, User Vault, and PostgreSQL database.
   *
   * @param {Object} postData
   * @param {string} [postData.templateId] - Template UUID
   * @param {string} [postData.festivalId] - Festival UUID
   * @param {string} [postData.frameId] - Frame UUID
   * @param {string} postData.base64Graphic - Canvas base64 graphic image data
   * @param {Object} [postData.userConfigJson] - Custom layout details
   * @param {string} [postData.status='DRAFT'] - Initial post status (`'DRAFT'` | `'SCHEDULED'` | `'PUBLISHED'`)
   * @returns {Promise<Object>} Newly created Post database record
   */
  createPost: async (postData) => {
    const response = await api.post(API_ENDPOINTS.POSTS.BASE, postData);
    return response.data;
  },

  /**
   * DELETE /api/v1/posts/:id
   * Deletes a saved post record from PostgreSQL database and Vault.
   *
   * @param {string} id - Post UUID
   * @returns {Promise<Object>} Deletion success confirmation message
   */
  deletePost: async (id) => {
    const response = await api.delete(API_ENDPOINTS.POSTS.BY_ID(id));
    return response.data;
  },
};
