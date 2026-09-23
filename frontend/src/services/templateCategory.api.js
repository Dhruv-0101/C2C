import { api } from './api.service.js';
import { API_ENDPOINTS } from '../constants/api.constants.js';

/**
 * Master Template Category API Service
 * Handles CRUD operations for visual theme categories in PostgreSQL database.
 */
export const templateCategoryApi = {
  /**
   * GET /api/v1/template-categories
   * Fetches paginated template categories from database with search and sorting support.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page limit
   * @param {string} [params.search] - Optional keyword filter for name/description
   * @param {string} [params.sortBy='name'] - Field to sort by
   * @param {string} [params.sortOrder='asc'] - Sort order (`'asc'` | `'desc'`)
   * @returns {Promise<Object>} `{ categories: Array<Object>, meta: PaginationMeta }`
   */
  getTemplateCategories: async (params = {}) => {
    return await api.get(API_ENDPOINTS.TEMPLATE_CATEGORIES.BASE, { params });
  },

  /**
   * POST /api/v1/template-categories
   * Admin / SuperAdmin / SubAdmin with permission: Creates a new master template category.
   *
   * @param {Object} data - Category creation payload
   * @param {string} data.name - Category display name (e.g. "Festival & Celebrations", "Daily Quotes")
   * @param {string} [data.description] - Description of theme
   * @returns {Promise<Object>} Newly created template category record
   */
  createTemplateCategory: async (data) => {
    return await api.post(API_ENDPOINTS.TEMPLATE_CATEGORIES.BASE, data);
  },

  /**
   * GET /api/v1/template-categories/:id
   * Fetches a single template category by UUID.
   *
   * @param {string} id - Category UUID
   * @returns {Promise<Object>} Response containing template category details
   */
  getTemplateCategoryById: async (id) => {
    return await api.get(API_ENDPOINTS.TEMPLATE_CATEGORIES.BY_ID(id));
  },

  /**
   * PUT /api/v1/template-categories/:id
   * Admin / SuperAdmin / SubAdmin with permission: Updates an existing template category.
   *
   * @param {string} id - Category UUID
   * @param {Object} data - Update fields ({ name, description })
   * @returns {Promise<Object>} Response containing updated template category
   */
  updateTemplateCategory: async (id, data) => {
    return await api.put(API_ENDPOINTS.TEMPLATE_CATEGORIES.BY_ID(id), data);
  },

  /**
   * DELETE /api/v1/template-categories/:id
   * Admin / SuperAdmin / SubAdmin with permission: Deletes a template category record.
   *
   * @param {string} id - Category UUID
   * @returns {Promise<Object>} Confirmation payload
   */
  deleteTemplateCategory: async (id) => {
    return await api.delete(API_ENDPOINTS.TEMPLATE_CATEGORIES.BY_ID(id));
  },
};
