import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Event & Festival Calendar API Service
 * Manages upcoming national, religious, regional festivals, and business special days in PostgreSQL database.
 */
export const festivalApi = {
  /**
   * GET /api/v1/festivals
   * Fetches upcoming festivals calendar list from database, with optional year and active filters.
   *
   * @param {number|string|Object} [options] - Target calendar year or options object
   * @param {number|string} [options.year] - Target calendar year (e.g. 2026)
   * @param {boolean} [options.includeInactive=false] - Whether to include inactive/hidden draft festivals
   * @returns {Promise<Object>} `{ festivals: Array<Object>, meta: Object }`
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
   * POST /api/v1/festivals
   * Admin / SubAdmin: Creates a new festival event or commercial special day in database.
   *
   * @param {Object} data - Festival creation payload
   * @param {string} data.name - Official festival name (e.g. "Diwali 2026", "Independence Day")
   * @param {string} data.date - Festival event date string (ISO date `YYYY-MM-DD`)
   * @param {string} [data.description] - Festival greeting message or historical background
   * @param {string} [data.targetRegion] - Target geographical region (e.g. "Pan India", "Gujarat")
   * @param {string} [data.bannerUrl] - Cloudinary CDN header image banner URL
   * @param {boolean} [data.isActive=true] - Active visibility toggle flag
   * @returns {Promise<Object>} Newly created festival database record
   */
  createFestival: async (data) => {
    return await api.post(API_ENDPOINTS.FESTIVALS.BASE, data);
  },

  /**
   * PUT /api/v1/festivals/:id
   * Admin / SubAdmin: Updates an existing festival record in database.
   *
   * @param {string} id - Festival UUID
   * @param {Object} data - Updated festival fields
   * @param {string} [data.name] - Updated festival title
   * @param {string} [data.date] - Updated festival event date
   * @param {string} [data.description] - Updated greeting description
   * @param {string} [data.targetRegion] - Updated target region
   * @param {string} [data.bannerUrl] - Updated Cloudinary banner image URL
   * @param {boolean} [data.isActive] - Updated active visibility status
   * @returns {Promise<Object>} Updated festival record from database
   */
  updateFestival: async (id, data) => {
    return await api.put(API_ENDPOINTS.FESTIVALS.BY_ID(id), data);
  },

  /**
   * DELETE /api/v1/festivals/:id
   * Admin / SubAdmin: Deletes a festival event record from database by ID.
   *
   * @param {string} id - Festival UUID
   * @returns {Promise<Object>} Deletion success confirmation message
   */
  deleteFestival: async (id) => {
    return await api.delete(API_ENDPOINTS.FESTIVALS.BY_ID(id));
  },
};
