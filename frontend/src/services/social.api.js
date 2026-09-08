import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Social Integrations & OAuth API Service
 * Handles social channel connections (Instagram Business, Facebook Pages, LinkedIn, Twitter/X), OAuth 2.0 URLs, and encrypted access tokens in database.
 */
export const socialApi = {
  /**
   * GET /api/v1/social/accounts
   * Fetches all connected social media accounts for the logged-in user from database.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} `{ accounts: Array<Object>, meta: PaginationMeta }`
   */
  getAccounts: async (params = {}) => {
    return api.get(API_ENDPOINTS.SOCIAL.ACCOUNTS, { params });
  },

  /**
   * GET /api/v1/social/auth-url/instagram
   * Generates Meta OAuth 2.0 Authorization URL for linking Instagram Business / Facebook Page publishing rights.
   *
   * @returns {Promise<Object>} `{ configured: boolean, authUrl: string }`
   */
  getInstagramAuthUrl: async () => {
    return api.get(API_ENDPOINTS.SOCIAL.AUTH_URL_INSTAGRAM);
  },

  /**
   * GET /api/v1/social/auth-url/linkedin
   * Generates LinkedIn OAuth 2.0 Authorization URL for linking personal profile or company page publishing access.
   *
   * @returns {Promise<Object>} `{ configured: boolean, authUrl: string }`
   */
  getLinkedinAuthUrl: async () => {
    return api.get(API_ENDPOINTS.SOCIAL.AUTH_URL_LINKEDIN);
  },

  /**
   * POST /api/v1/social/connect-manual
   * Connects a social media channel by username handle when OAuth is in sandbox or manual mode.
   *
   * @param {string} handle - Social media username handle (e.g. `"@brandflow_official"`)
   * @param {string} [platform='INSTAGRAM'] - Platform identifier (`'INSTAGRAM'` | `'FACEBOOK'` | `'LINKEDIN'` | `'TWITTER'`)
   * @returns {Promise<Object>} Created SocialAccount database record payload
   */
  connectManualHandle: async (handle, platform = 'INSTAGRAM') => {
    return api.post(API_ENDPOINTS.SOCIAL.CONNECT_MANUAL, { handle, platform });
  },

  /**
   * DELETE /api/v1/social/accounts/:platform
   * Disconnects and removes a social account platform integration from PostgreSQL database.
   *
   * @param {string} platform - Target platform to disconnect (`'INSTAGRAM'` | `'FACEBOOK'` | `'LINKEDIN'` | `'TWITTER'`)
   * @returns {Promise<Object>} Disconnect success confirmation payload
   */
  disconnectAccount: async (platform) => {
    return api.delete(API_ENDPOINTS.SOCIAL.DISCONNECT(platform));
  },
};
