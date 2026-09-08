import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Master Design Styles API Service
 * Handles CRUD operations for master aesthetic design themes, font pairs, and curated color palettes in PostgreSQL database.
 */
export const designStyleApi = {
  /**
   * GET /api/v1/design-styles
   * Fetches paginated master design styles and color palettes from database.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Search query filter
   * @returns {Promise<Object>} `{ designStyles: Array<Object>, meta: PaginationMeta }`
   */
  getDesignStyles: async (params = {}) => {
    return await api.get(API_ENDPOINTS.DESIGN_STYLES.BASE, { params });
  },

  /**
   * POST /api/v1/design-styles
   * Admin / SuperAdmin: Creates a new master aesthetic design style and color palette configuration.
   *
   * @param {Object} data - Design style creation payload
   * @param {string} data.name - Style name (e.g. "Modern Glassmorphism", "Festive Gold Luxury")
   * @param {string} [data.description] - Description of aesthetic usage
   * @param {Array<string>} [data.colorPalette] - Hex color code array (e.g. `['#131B2A', '#F59E0B']`)
   * @param {string} [data.fontFamily] - Recommended Google Font name
   * @returns {Promise<Object>} Created design style record from database
   */
  createDesignStyle: async (data) => {
    return await api.post(API_ENDPOINTS.DESIGN_STYLES.BASE, data);
  },

  /**
   * DELETE /api/v1/design-styles/:id
   * Admin / SuperAdmin: Removes a design style theme record from PostgreSQL database by ID.
   *
   * @param {string} id - Design style UUID
   * @returns {Promise<Object>} Success deletion confirmation payload
   */
  deleteDesignStyle: async (id) => {
    return await api.delete(API_ENDPOINTS.DESIGN_STYLES.BY_ID(id));
  },
};
