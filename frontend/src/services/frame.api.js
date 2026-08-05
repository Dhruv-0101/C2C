import { api } from './api.service';

/**
 * AI Frames API Service
 */
export const frameApi = {
  /**
   * Fetch active frames with pagination parameters
   * @param {{ page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: string }} [params]
   */
  getFrames: async (params = {}) => {
    return api.get('/frames', { params });
  },

  /**
   * Create dynamic frame preset or upload PNG frame overlay
   */
  createFrame: async (data) => {
    return api.post('/frames', data);
  },

  /**
   * Delete frame
   */
  deleteFrame: async (id) => {
    return api.delete(`/frames/${id}`);
  },
};
