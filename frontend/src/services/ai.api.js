import { api } from './api.service';

/**
 * Generate AI Caption & Hashtags
 */
export async function generateAiCaption(params) {
  const res = await api.post('/ai/generate-caption', params);
  return res.data;
}

/**
 * Suggest Trending Hashtags
 */
export async function getSuggestedHashtags(params) {
  const res = await api.post('/ai/suggest-hashtags', params);
  return res.data;
}
