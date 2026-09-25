import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

/**
 * Business Category API Service
 * Handles CRUD operations for master business industry categories in PostgreSQL database.
 */
export const categoryApi = {
  /**
   * GET /api/v1/categories
   * Fetches paginated business categories from database with search and sorting support.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page limit
   * @param {string} [params.search] - Optional keyword filter for category name/description
   * @param {string} [params.sortBy='createdAt'] - Field to sort by
   * @param {string} [params.sortOrder='desc'] - Sort order (`'asc'` | `'desc'`)
   * @returns {Promise<Object>} `{ categories: Array<Object>, meta: PaginationMeta }`
   */
  getCategories: async (params = {}) => {
    return await api.get(API_ENDPOINTS.CATEGORIES.BASE, { params });
  },

  /**
   * POST /api/v1/categories
   * Admin / SuperAdmin: Creates a new master business industry category in database.
   *
   * @param {Object} data - Category creation payload
   * @param {string} data.name - Category display name (e.g. "Jewelry & Gold", "Real Estate")
   * @param {string} [data.description] - Description of target industry
   * @param {string} [data.icon] - Icon name string identifier
   * @returns {Promise<Object>} Response containing newly created category record in DB
   */
  createCategory: async (data) => {
    return await api.post(API_ENDPOINTS.CATEGORIES.BASE, data);
  },

  /**
   * GET /api/v1/categories/:id
   * Fetches a single business category by UUID.
   *
   * @param {string} id - Category UUID
   * @returns {Promise<Object>} Response containing category details
   */
  getCategoryById: async (id) => {
    return await api.get(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },

  /**
   * PUT /api/v1/categories/:id
   * Admin / SuperAdmin: Updates an existing business category in database.
   *
   * @param {string} id - Category UUID
   * @param {Object} data - Update fields ({ name, description })
   * @returns {Promise<Object>} Response containing updated category
   */
  updateCategory: async (id, data) => {
    return await api.put(API_ENDPOINTS.CATEGORIES.BY_ID(id), data);
  },

  /**
   * DELETE /api/v1/categories/:id
   * Admin / SuperAdmin: Deletes a business category record from PostgreSQL database by ID.
   *
   * @param {string} id - Category UUID
   * @returns {Promise<Object>} Confirmation payload of category deletion
   */
  deleteCategory: async (id) => {
    return await api.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },
};
