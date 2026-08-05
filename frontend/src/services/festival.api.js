import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Festival & Special Days API Service
 */
export const festivalApi = {
  /**
   * Fetch all festivals (optionally filtered by year)
   * @param {number|string} [year]
   */
  getFestivals: async (year) => {
    const url = year ? `${API_ENDPOINTS.FESTIVALS.BASE}?year=${year}` : API_ENDPOINTS.FESTIVALS.BASE;
    return await api.get(url);
  },

  /**
   * Create a new festival / special day
   * @param {{ name: string, date: string, description?: string, targetRegion?: string, bannerUrl?: string, isActive?: boolean }} data
   */
  createFestival: async (data) => {
    return await api.post(API_ENDPOINTS.FESTIVALS.BASE, data);
  },

  /**
   * Delete a festival by ID
   * @param {string} id
   */
  deleteFestival: async (id) => {
    return await api.delete(API_ENDPOINTS.FESTIVALS.BY_ID(id));
  },
};
