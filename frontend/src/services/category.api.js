import { api } from './api.service.js';
import { API_ENDPOINTS } from '../constants/api.constants.js';

/**
 * Category API Layer
 */
export const categoryApi = {
  /**
   * Fetch business categories with pagination parameters
   * @param {{ page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: string }} [params]
   */
  getCategories: async (params = {}) => {
    return await api.get(API_ENDPOINTS.CATEGORIES.BASE, { params });
  },

  /**
   * Create a new master business category (SuperAdmin only)
   * @param {{ name: string, description?: string, icon?: string }} data
   */
  createCategory: async (data) => {
    return await api.post(API_ENDPOINTS.CATEGORIES.BASE, data);
  },

  /**
   * Delete a business category (SuperAdmin only)
   * @param {string} id
   */
  deleteCategory: async (id) => {
    return await api.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },
};
