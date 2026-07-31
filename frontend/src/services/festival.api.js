import { api } from './api.service';

/**
 * Festival & Special Days API Service
 */
export const festivalApi = {
  /**
   * Fetch all festivals (optionally filtered by year)
   * @param {number|string} [year]
   */
  getFestivals: async (year) => {
    const url = year ? `/festivals?year=${year}` : '/festivals';
    return await api.get(url);
  },

  /**
   * Create a new festival / special day
   * @param {{ name: string, date: string, description?: string, targetRegion?: string, bannerUrl?: string, isActive?: boolean }} data
   */
  createFestival: async (data) => {
    return await api.post('/festivals', data);
  },

  /**
   * Delete a festival by ID
   * @param {string} id
   */
  deleteFestival: async (id) => {
    return await api.delete(`/festivals/${id}`);
  },
};
