import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * AI BrandKit API Service
 */
export const brandKitApi = {
  /**
   * Fetch authenticated user's BrandKit
   */
  getBrandKit: async () => {
    return api.get(API_ENDPOINTS.BRANDKIT.BASE);
  },

  /**
   * Create or update user's BrandKit
   * @param {Object} data
   */
  updateBrandKit: async (data) => {
    return api.put(API_ENDPOINTS.BRANDKIT.BASE, data);
  },
};
