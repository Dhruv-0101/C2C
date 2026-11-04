/**
 * 🍌 Puter.js Copywriting & Caption Engine
 * Generates viral, high-converting social captions and relevant hashtags via browser chat AI.
 */

import { PUTER_CHAT_TIMEOUT_MS } from './puter.constants';
import { getPuter, setupPuterModalSuppressor } from './puter.client';
import {
  isPuterConnected,
  isPuterExhausted,
  clearPuterExhausted,
  markPuterExhausted,
} from './puter.usage';

/**
 * Generate AI Caption & Hashtags via Puter.js (Client-side Chat AI)
 *
 * @param {Object} params
 * @param {string} params.topic - Post topic or business offer
 * @param {string} [params.offerText] - Discount/offer details
 * @param {string} [params.tone] - Tone of voice
 * @param {string} [params.language] - Language
 * @param {string} [params.platform] - Target social platform
 * @param {string} [params.targetAudience] - Target demographic
 * @param {string} [params.businessUsps] - Key selling points
 * @returns {Promise<{ captionText: string, hashtags: string[], source: string }>}
 */
export async function generatePuterCaption({
  topic,
  offerText = '',
  tone = 'PROMOTIONAL',
  language = 'ENGLISH',
  platform = 'INSTAGRAM',
  targetAudience = '',
  businessUsps = '',
}) {
  if (isPuterExhausted()) {
    throw new Error('Puter AI quota exhausted. Fast-tracking to Google Gemini.');
  }

  setupPuterModalSuppressor();

  const instance = await getPuter();
  if (!instance || !instance.ai || !instance.ai.chat) {
    throw new Error('Puter AI Chat is not available in this browser environment.');
  }

  // Ensure user has connected Puter session
  if (!isPuterConnected()) {
    throw new Error('Puter account is not connected. Fast-tracking to Google Gemini.');
  }

  const prompt = `You are a world-class social media copywriter for small businesses.
Create a high-converting, viral ${platform} caption and hashtags based on this input:
- Topic: ${topic}
${offerText ? `- Special Offer: ${offerText}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${businessUsps ? `- Business USPs: ${businessUsps}` : ''}
- Tone: ${tone}
- Language: ${language}

Strict Output Format:
Output ONLY valid JSON with no markdown backticks, no code blocks:
{
  "captionText": "Full engaging caption with hooks, emojis, value proposition, and strong call to action.",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

  // 30-second timeout for chat completion
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Puter AI caption generation timed out (exceeded 30s).'));
    }, PUTER_CHAT_TIMEOUT_MS);
  });

  let response;
  try {
    const chatCall = async () => {
      try {
        return await instance.ai.chat(prompt, { model: 'gpt-4o-mini' });
      } catch (err) {
        return await instance.ai.chat(prompt);
      }
    };

    response = await Promise.race([
      chatCall(),
      timeoutPromise,
    ]);
  } catch (err) {
    const errMsg = (err?.message || err?.error?.message || String(err)).toLowerCase();
    const isQuotaError =
      errMsg.includes('funding') ||
      errMsg.includes('balance') ||
      errMsg.includes('quota') ||
      errMsg.includes('credit') ||
      errMsg.includes('limit') ||
      errMsg.includes('subscription');

    if (isQuotaError) {
      markPuterExhausted();
    }
    throw err;
  }

  const rawText = response?.message?.content || String(response || '');

  // Extract JSON payload
  let parsed = null;
  try {
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Fallback parser if LLM wrapped in conversational text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) { }
    }
  }

  if (parsed && parsed.captionText) {
    const hashtags = Array.isArray(parsed.hashtags)
      ? parsed.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`))
      : ['#business', '#marketing', '#viral'];

    clearPuterExhausted();

    return {
      captionText: parsed.captionText,
      hashtags,
      source: 'PUTER_AI',
    };
  }

  // Graceful fallback if unstructured
  return {
    captionText: rawText.replace(/#\w+/g, '').trim(),
    hashtags: rawText.match(/#\w+/g) || ['#business', '#viral', '#growth'],
    source: 'PUTER_AI',
  };
}
