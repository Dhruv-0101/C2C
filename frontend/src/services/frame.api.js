import { api } from './api.service';
import { API_ENDPOINTS } from '../constants/api.constants';

/**
 * AI Frames API Service
 */
export const frameApi = {
  /**
   * Fetch active frames with pagination parameters
   * @param {{ page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: string }} [params]
   */
  getFrames: async (params = {}) => {
    return api.get(API_ENDPOINTS.FRAMES.BASE, { params });
  },

  /**
   * Create dynamic frame preset or upload PNG frame overlay
   */
  createFrame: async (data) => {
    return api.post(API_ENDPOINTS.FRAMES.BASE, data);
  },

  /**
   * Delete frame
   */
  deleteFrame: async (id) => {
    return api.delete(API_ENDPOINTS.FRAMES.BY_ID(id));
  },
};
