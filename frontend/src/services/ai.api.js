import { api } from './api.service';

/**
 * Generate AI Caption & Hashtags
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function generateAiCaption(params) {
  const res = await api.post('/ai/generate-caption', params);
  return res.data;
}
