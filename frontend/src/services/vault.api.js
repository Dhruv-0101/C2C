import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * User Vault API Service
 */
export const vaultApi = {
  /**
   * Fetch all vault items with pagination & search
   * @param {{ page?: number, limit?: number, search?: string }} [params]
   */
  getVaultItems: async (params = {}) => {
    return api.get(API_ENDPOINTS.VAULT.BASE, { params });
  },

  /**
   * Fetch single vault item by ID
   * @param {string} id
   */
  getVaultItemById: async (id) => {
    return api.get(API_ENDPOINTS.VAULT.BY_ID(id));
  },

  /**
   * Update vault item details (occasion, category, graphic URL)
   * @param {string} id
   * @param {{ occasionName?: string, categoryName?: string, graphicUrl?: string }} data
   */
  updateVaultItem: async (id, data) => {
    return api.put(API_ENDPOINTS.VAULT.BY_ID(id), data);
  },

  /**
   * Delete item from Vault & Database
   * @param {string} id
   */
  deleteVaultItem: async (id) => {
    return api.delete(API_ENDPOINTS.VAULT.BY_ID(id));
  },
};
