import api from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Base Master Graphic Templates API Service
 * Handles base background graphic template uploads, festival assignment, and template library queries in PostgreSQL database & Cloudinary CDN.
 */
export const templateApi = {
  /**
   * GET /api/v1/templates
   * Fetches paginated master graphic templates from database with category and festival filters.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.festivalId] - Optional festival UUID filter
   * @param {string} [params.categoryId] - Optional business category UUID filter
   * @param {string} [params.search] - Search keyword filter
   * @returns {Promise<Object>} `{ templates: Array<Object>, meta: PaginationMeta }`
   */
  getTemplates: async (params = {}) => {
    return api.get(API_ENDPOINTS.TEMPLATES.BASE, { params });
  },

  /**
   * POST /api/v1/templates
   * Admin / SubAdmin: Creates a new master graphic template record in database.
   *
   * @param {Object} data - Template creation payload
   * @param {string} data.title - Template title (e.g. "Happy Diwali Special Offers Graphic")
   * @param {string} data.baseImageUrl - Cloudinary CDN URL of base background graphic image
   * @param {string} [data.festivalId] - Optional festival ID UUID link
   * @param {string} [data.categoryId] - Optional category ID UUID link
   * @param {string} [data.designStyleId] - Optional design style UUID link
   * @param {boolean} [data.isActive=true] - Active availability flag
   * @returns {Promise<Object>} Newly created Template record from database
   */
  createTemplate: async (data) => {
    return api.post(API_ENDPOINTS.TEMPLATES.BASE, data);
  },

  /**
   * POST /api/v1/templates/upload
   * Admin / SubAdmin: Directly uploads raw image file to Cloudinary CDN and registers template record in database.
   *
   * @param {FormData|Object} data - Multipart form data containing file upload and metadata
   * @returns {Promise<Object>} Created template record payload
   */
  uploadAdminTemplate: async (data) => {
    return api.post(API_ENDPOINTS.TEMPLATES.UPLOAD, data);
  },

  /**
   * DELETE /api/v1/templates/:id
   * Admin / SubAdmin: Deletes a base template record from database by ID.
   *
   * @param {string} id - Template UUID
   * @returns {Promise<Object>} Success deletion confirmation payload
   */
  deleteTemplate: async (id) => {
    return api.delete(API_ENDPOINTS.TEMPLATES.BY_ID(id));
  },

  /**
   * GET /api/v1/templates/categories
   * Fetches active template categories summary list from database.
   *
   * @returns {Promise<Object>} Category metadata array
   */
  getCategories: async () => {
    return api.get(API_ENDPOINTS.TEMPLATES.CATEGORIES);
  },
};
