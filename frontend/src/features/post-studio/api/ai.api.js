import { api } from '@/shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

/**
 * Generate AI Caption & Hashtags (Adaptive smart execution)
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function generateAiCaption(params) {
  const res = await api.post(API_ENDPOINTS.AI.GENERATE_CAPTION, params);
  return res.data;
}

/**
 * Generate AI Post Image via Nano Banana 2.1 (Enqueues into BullMQ queue)
 * @param {Object} params
 * @param {string} params.prompt
 * @param {string} [params.style]
 * @param {string} [params.aspectRatio]
 * @param {string} [params.occasionName]
 * @returns {Promise<Object>}
 */
export async function generateAiPostImage(params) {
  const res = await api.post(API_ENDPOINTS.AI.GENERATE_IMAGE, params);
  return res.data;
}

/**
 * Poll AI Generation Job Status (Queue Position, Timer Countdown, & Result)
 * @param {string} jobId
 * @param {'image' | 'caption'} [type='image']
 * @returns {Promise<Object>}
 */
export async function getAiJobStatus(jobId, type = 'image') {
  const res = await api.get(API_ENDPOINTS.AI.JOB_STATUS(jobId), {
    params: { type },
  });
  return res.data;
}

/**
 * Generate Structured Multi-Slide Carousel Deck with AI
 * @param {Object} params
 * @param {string} params.topic
 * @param {number} [params.numberOfSlides]
 * @param {string} [params.tone]
 * @param {string} [params.language]
 * @param {string} [params.industry]
 * @param {string} [params.targetAudience]
 * @returns {Promise<Object>}
 */
export async function generateAiCarousel(params) {
  const res = await api.post(API_ENDPOINTS.AI.GENERATE_CAROUSEL, params);
  return res.data;
}

export default {
  generateAiCaption,
  generateAiPostImage,
  getAiJobStatus,
  generateAiCarousel,
};

