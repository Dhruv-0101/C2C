import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * User Media Vault Directory API Service
 * Manages the user's stored post graphics, Cloudinary media assets, and historical branding records in PostgreSQL database.
 */
export const vaultApi = {
  /**
   * GET /api/v1/vault
   * Fetches paginated list of saved graphic post assets in the user's personal Vault directory from database.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search keyword filter for occasion name or category
   * @returns {Promise<Object>} `{ vaultItems: Array<Object>, meta: PaginationMeta }`
   */
  getVaultItems: async (params = {}) => {
    return api.get(API_ENDPOINTS.VAULT.BASE, { params });
  },

  /**
   * GET /api/v1/vault/:id
   * Fetches full details for a specific Vault media item record from database by ID.
   *
   * @param {string} id - Vault item UUID
   * @returns {Promise<Object>} Vault item data object
   */
  getVaultItemById: async (id) => {
    return api.get(API_ENDPOINTS.VAULT.BY_ID(id));
  },

  /**
   * PUT /api/v1/vault/:id
   * Updates metadata details for a Vault post item in database.
   *
   * @param {string} id - Vault item UUID
   * @param {Object} data - Update payload
   * @param {string} [data.occasionName] - Updated occasion or event title
   * @param {string} [data.categoryName] - Updated business category
   * @param {string} [data.graphicUrl] - Updated Cloudinary image CDN URL
   * @returns {Promise<Object>} Updated Vault item database record
   */
  updateVaultItem: async (id, data) => {
    return api.put(API_ENDPOINTS.VAULT.BY_ID(id), data);
  },

  /**
   * DELETE /api/v1/vault/:id
   * Deletes a graphic media asset record from the user's Vault directory in database.
   *
   * @param {string} id - Vault item UUID
   * @returns {Promise<Object>} Success deletion confirmation payload
   */
  deleteVaultItem: async (id) => {
    return api.delete(API_ENDPOINTS.VAULT.BY_ID(id));
  },
};
