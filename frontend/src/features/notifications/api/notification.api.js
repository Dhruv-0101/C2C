import api from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

/**
 * Enterprise Web Push & Notifications API Service
 * Encapsulates all notification-related HTTP operations.
 */
export const notificationApi = {
  /**
   * Fetch server VAPID public key for Web Push subscription handshake
   * @returns {Promise<{ publicKey: string }>}
   */
  getVapidPublicKey: async () => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.VAPID_KEY);
    return response.data?.data || response.data;
  },

  /**
   * Register or update a browser push subscription on the backend
   * @param {Object} payload { endpoint, keys: { p256dh, auth }, deviceType }
   * @returns {Promise<Object>}
   */
  subscribeDevice: async (payload) => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE, payload);
    return response.data?.data || response.data;
  },

  /**
   * Deactivate a push subscription
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  unsubscribeDevice: async (endpoint) => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE, { endpoint });
    return response.data?.data || response.data;
  },

  /**
   * Fetch user notifications feed (with pagination & unread count)
   * @param {Object} params { page, limit, unreadOnly }
   * @returns {Promise<{ notifications: Array, pagination: Object, unreadCount: number }>}
   */
  getFeed: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.FEED, { params });
    return response.data?.data || response.data;
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   * @returns {Promise<Object>}
   */
  markRead: async (id) => {
    const response = await api.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return response.data?.data || response.data;
  },

  /**
   * Mark all unread notifications as read
   * @returns {Promise<Object>}
   */
  markAllRead: async () => {
    const response = await api.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return response.data?.data || response.data;
  },

  /**
   * Trigger an immediate test push notification to current user's registered devices
   * @param {Object} [payload]
   * @returns {Promise<Object>}
   */
  sendTestPush: async (payload = {}) => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.TEST_SEND, payload);
    return response.data?.data || response.data;
  },

  /**
   * Broadcast a manual announcement or promotional campaign to user audience segment
   * @param {Object} payload { title, message, type, targetAudience, linkUrl, imageUrl }
   * @returns {Promise<Object>}
   */
  sendBroadcast: async (payload) => {
    const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.ADMIN_BROADCAST, payload);
    return response.data?.data || response.data;
  },

  /**
   * Fetch live audience recipient and push device count estimate
   * @param {string} targetAudience
   * @returns {Promise<{ userCount: number, deviceCount: number }>}
   */
  getAudienceEstimate: async (targetAudience = 'ALL') => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.ADMIN_ESTIMATE, {
      params: { targetAudience },
    });
    return response.data?.data || response.data;
  },

  /**
   * Fetch paginated broadcast history
   * @param {Object} params { page, limit }
   * @returns {Promise<{ broadcasts: Array, pagination: Object }>}
   */
  getBroadcasts: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.ADMIN_BROADCASTS, { params });
    return response.data?.data || response.data;
  },
};

export default notificationApi;
