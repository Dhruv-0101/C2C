import { api } from './api.service';

/**
 * Master Design Styles API Service
 */
export const designStyleApi = {
  /**
   * Fetch all master design styles & color palettes
   */
  getDesignStyles: async () => {
    return await api.get('/design-styles');
  },

  /**
   * Create a new master design style / color palette
   * @param {{ name: string, description?: string, primaryColor?: string, secondaryColor?: string, accentColor?: string, backgroundColor?: string, gradient?: string, fontHeader?: string, fontBody?: string, colors?: string[] }} data
   */
  createDesignStyle: async (data) => {
    return await api.post('/design-styles', data);
  },

  /**
   * Delete a master design style by ID
   * @param {string} id
   */
  deleteDesignStyle: async (id) => {
    return await api.delete(`/design-styles/${id}`);
  },
};
