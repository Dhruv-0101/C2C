import { api } from '../../../shared/http/api.client';
import { API_ENDPOINTS } from '../../../shared/http/api.endpoints';

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
   * DELETE /api/v1/social/accounts/:platform
   * Disconnects and removes a social account platform integration from PostgreSQL database.
   *
   * @param {string} platform - Target platform to disconnect (`'INSTAGRAM'` | `'FACEBOOK'` | `'LINKEDIN'`)
   * @returns {Promise<Object>} Disconnect success confirmation payload
   */
  disconnectAccount: async (platform) => {
    return api.delete(API_ENDPOINTS.SOCIAL.DISCONNECT(platform));
  },

  /**
   * POST /api/v1/social/submit-page-link
   * Submits client Facebook Page link/name for managed agency onboarding.
   *
   * @param {string} pageUrl - Facebook Page URL or Name
   * @returns {Promise<Object>}
   */
  submitPageLink: async (pageUrl) => {
    return api.post(API_ENDPOINTS.SOCIAL.SUBMIT_PAGE_LINK, { pageUrl });
  },

  /**
   * GET /api/v1/social/onboarding-status
   * Fetches client social onboarding status and submitted page link.
   *
   * @returns {Promise<Object>}
   */
  getOnboardingStatus: async () => {
    return api.get(API_ENDPOINTS.SOCIAL.ONBOARDING_STATUS);
  },

  /**
   * PATCH /api/v1/social/admin/update-status
   * Admin updates client's onboarding status (e.g. REQUEST_SENT).
   *
   * @param {string} userId - Target User ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  adminUpdateOnboardingStatus: async (userId, status) => {
    return api.patch(API_ENDPOINTS.SOCIAL.ADMIN_UPDATE_STATUS, { userId, status });
  },
};
