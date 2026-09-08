import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Master Design Styles API Service
 */
export const designStyleApi = {
  /**
   * Fetch master design styles & color palettes with optional pagination & search params
   */
  getDesignStyles: async (params = {}) => {
    return await api.get(API_ENDPOINTS.DESIGN_STYLES.BASE, { params });
  },

  /**
   * Create a new master design style / color palette
   */
  createDesignStyle: async (data) => {
    return await api.post(API_ENDPOINTS.DESIGN_STYLES.BASE, data);
  },

  /**
   * Delete a master design style by ID
   */
  deleteDesignStyle: async (id) => {
    return await api.delete(API_ENDPOINTS.DESIGN_STYLES.BY_ID(id));
  },
};
