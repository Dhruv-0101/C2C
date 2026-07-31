import { api } from './api.service';

/**
 * Category API Layer
 */
export const categoryApi = {
  /**
   * Fetch all business categories
   */
  getCategories: async () => {
    return await api.get('/categories');
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
