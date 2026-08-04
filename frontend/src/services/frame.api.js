import { api } from './api.service';

/**
 * AI Frames API Service
 */
export const frameApi = {
  /**
   * Fetch all active frames (Dynamic & PNG Overlays)
   */
  getFrames: async () => {
    return api.get('/frames');
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
