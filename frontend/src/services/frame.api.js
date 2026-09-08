import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * Branded Canvas Vector Frames API Service
 * Manages transparent 1080x1080 PNG frame overlays and visual layout slots in PostgreSQL database & Cloudinary CDN.
 */
export const frameApi = {
  /**
   * GET /api/v1/frames
   * Fetches paginated list of active Canva-style PNG frame overlays from database.
   *
   * @param {Object} [params={}]
   * @param {number} [params.page=1] - Target page index
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.search] - Filter search query keyword
   * @param {string} [params.sortBy='createdAt'] - Sort field
   * @param {string} [params.sortOrder='desc'] - Sort direction (`'asc'` | `'desc'`)
   * @returns {Promise<Object>} `{ frames: Array<Object>, meta: PaginationMeta }`
   */
  getFrames: async (params = {}) => {
    return api.get(API_ENDPOINTS.FRAMES.BASE, { params });
  },

  /**
   * POST /api/v1/frames
   * Admin / SubAdmin: Uploads a transparent 1080x1080 PNG frame overlay to Cloudinary CDN and saves slot layout config to database.
   *
   * @param {Object} data - Frame creation payload
   * @param {string} data.name - Frame title (e.g. "Minimalist Gold Header & Footer Frame")
   * @param {string} data.frameImageUrl - Cloudinary CDN URL for transparent PNG frame overlay
   * @param {Object} [data.configJson] - JSON layout configuration for dynamic text, logo, and avatar position bounding boxes
   * @param {boolean} [data.isActive=true] - Active availability status flag
   * @returns {Promise<Object>} Created frame record from database
   */
  createFrame: async (data) => {
    return api.post(API_ENDPOINTS.FRAMES.BASE, data);
  },

  /**
   * DELETE /api/v1/frames/:id
   * Admin / SubAdmin: Deletes a frame overlay record from database by ID.
   *
   * @param {string} id - Frame UUID
   * @returns {Promise<Object>} Deletion success confirmation message
   */
  deleteFrame: async (id) => {
    return api.delete(API_ENDPOINTS.FRAMES.BY_ID(id));
  },
};
