import { api } from './api.service.js';

/**
 * Category API Layer
 */
export const categoryApi = {
  /**
   * Fetch business categories with pagination parameters
   * @param {{ page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: string }} [params]
   */
  getCategories: async (params = {}) => {
    return await api.get('/categories', { params });
  },

  /**
   * Create a new master business category (SuperAdmin only)
   * @param {{ name: string, description?: string, icon?: string }} data
   */
  createCategory: async (data) => {
    return await api.post('/categories', data);
  },

  /**
   * Delete a business category (SuperAdmin only)
   * @param {string} id
   */
  deleteCategory: async (id) => {
    return await api.delete(`/categories/${id}`);
  },
};
