import { api } from './api.service';

/**
 * AI BrandKit API Service
 */
export const brandKitApi = {
  /**
   * Fetch authenticated user's BrandKit
   */
  getBrandKit: async () => {
    return api.get('/brandkit');
  },

  /**
   * Create or update user's BrandKit
   * @param {Object} data
   */
  updateBrandKit: async (data) => {
    return api.put('/brandkit', data);
  },
};
