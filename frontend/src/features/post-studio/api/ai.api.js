import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

/**
 * Generate AI Caption & Hashtags
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function generateAiCaption(params) {
  const res = await api.post(API_ENDPOINTS.AI.GENERATE_CAPTION, params);
  return res.data;
}

export default {
  generateAiCaption,
};
