import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Festival & Special Days API Service
 */
export const festivalApi = {
  /**
   * Fetch all festivals (optionally filtered by year & active status)
   * @param {number|string|{ year?: number|string, includeInactive?: boolean }} [options]
   */
  getFestivals: async (options) => {
    let year = typeof options === 'object' ? options?.year : options;
    let includeInactive = typeof options === 'object' ? options?.includeInactive : false;

    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (includeInactive) params.append('includeInactive', 'true');

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.FESTIVALS.BASE}?${queryString}` : API_ENDPOINTS.FESTIVALS.BASE;
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
   * Update an existing festival by ID
   * @param {string} id
   * @param {{ name?: string, date?: string, description?: string, targetRegion?: string, bannerUrl?: string, isActive?: boolean }} data
   */
  updateFestival: async (id, data) => {
    return await api.put(API_ENDPOINTS.FESTIVALS.BY_ID(id), data);
  },

  /**
   * Delete a festival by ID
   * @param {string} id
   */
  deleteFestival: async (id) => {
    return await api.delete(API_ENDPOINTS.FESTIVALS.BY_ID(id));
  },
};
