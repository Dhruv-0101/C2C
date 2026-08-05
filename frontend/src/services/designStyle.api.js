import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Master Design Styles API Service
 */
export const designStyleApi = {
  /**
   * Fetch all master design styles & color palettes
   */
  getDesignStyles: async () => {
    return await api.get(API_ENDPOINTS.DESIGN_STYLES.BASE);
  },

  /**
   * Create a new master design style / color palette
   * @param {{ name: string, description?: string, primaryColor?: string, secondaryColor?: string, accentColor?: string, backgroundColor?: string, gradient?: string, fontHeader?: string, fontBody?: string, colors?: string[] }} data
   */
  createDesignStyle: async (data) => {
    return await api.post(API_ENDPOINTS.DESIGN_STYLES.BASE, data);
  },

  /**
   * Delete a master design style by ID
   * @param {string} id
   */
  deleteDesignStyle: async (id) => {
    return await api.delete(API_ENDPOINTS.DESIGN_STYLES.BY_ID(id));
  },
};
