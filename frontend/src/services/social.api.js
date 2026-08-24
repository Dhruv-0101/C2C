import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export const socialApi = {
  /**
   * Fetch connected social accounts for logged-in user
   */
  getAccounts: async () => {
    return api.get(API_ENDPOINTS.SOCIAL.ACCOUNTS);
  },

  /**
   * Get Meta OAuth Authorization URL for Instagram Business
   */
  getInstagramAuthUrl: async () => {
    return api.get(API_ENDPOINTS.SOCIAL.AUTH_URL_INSTAGRAM);
  },

  /**
   * Disconnect social account platform
   */
  disconnectAccount: async (platform) => {
    return api.delete(API_ENDPOINTS.SOCIAL.DISCONNECT(platform));
  },
};
