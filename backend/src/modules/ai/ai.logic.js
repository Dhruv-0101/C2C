import * as aiRepository from './ai.repository.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AI_SOURCES } from './ai.constants.js';
import {
  buildAiPrompt,
  extractHashtags,
  synthesizeSmartCaption,
  sanitizeCaptionResponse,
} from './ai.helper.js';

/**
 * 🤖 AI BUSINESS LOGIC LAYER
 * Orchestrates multi-provider AI caption generation (Gemini -> OpenAI -> Smart Synthesizer fallback).
 * Follows clean architecture: zero Prisma queries and zero HTTP response formatting.
 */

/**
 * Generate AI Caption & Hashtags using BrandKit context + External LLM API / Built-in Smart Synthesizer
 *
 * @param {string} userId - Authenticated user UUID
 * @param {Object} params - Caption generation parameters
 * @returns {Promise<{ source: string, captionText: string, hashtags: Array<string> }>}
 */
export async function generateCaption(userId, params = {}) {
  // 1. Fetch live BrandKit context from database via repository (Guarantees zero central drift)
  const brandKit = await aiRepository.findBrandKitByUserId(userId);

  const context = {
    businessName: brandKit?.businessName || 'Our Business',
    tagline: brandKit?.tagline || '',
    categoryName: brandKit?.category?.name || '',
    address: brandKit?.address || '',
    city: brandKit?.city || '',
    state: brandKit?.state || '',
    country: brandKit?.country || 'India',
    phone: brandKit?.phone || '',
    whatsapp: brandKit?.whatsapp || '',
    email: brandKit?.email || '',
    instagramHandle: brandKit?.instagramHandle || '',
    facebookHandle: brandKit?.facebookHandle || '',
    linkedinHandle: brandKit?.linkedinHandle || '',
    targetAudience: brandKit?.targetAudience || 'General Audience',
    captionLanguage: params.language || brandKit?.captionLanguage || 'English',
    businessUsps: brandKit?.businessUsps || '',
    workingHours: brandKit?.workingHours || '',
    gmbReviewUrl: brandKit?.gmbReviewUrl || '',
    upiVpa: brandKit?.upiVpa || '',
    ...params,
  };

  const geminiKey = env.GEMINI_API_KEY;
  const openAiKey = env.OPENAI_API_KEY;
  const promptText = buildAiPrompt(context, params);

  // 2. Primary Provider: Google Gemini (High Speed & Natural Indian Context)
  if (geminiKey && !geminiKey.includes('dummy')) {
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        logger.warn(`Gemini API HTTP Error (${geminiRes.status}): ${JSON.stringify(geminiData)}`);
      } else {
        const rawContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawContent) {
          const hashtags = extractHashtags(rawContent);
          const cleanCaption = rawContent.replace(/#[a-zA-Z0-9_\u0900-\u097F]+/g, '').trim();

          return sanitizeCaptionResponse({
            source: AI_SOURCES.GEMINI,
            captionText: cleanCaption || rawContent,
            hashtags,
          });
        }
      }
    } catch (err) {
      logger.warn(`Gemini API call exception, falling back to next provider: ${err.message}`);
    }
  }

  // 3. Secondary Provider: OpenAI GPT-4o-mini
  if (openAiKey && !openAiKey.includes('dummy')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert social media copywriter creating high-converting captions with emojis, call-to-actions, and targeted hashtags based on brand identity.',
            },
            {
              role: 'user',
              content: promptText,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        const rawContent = data.choices[0].message.content;
        const hashtags = extractHashtags(rawContent);
        const cleanCaption = rawContent.replace(/#[a-zA-Z0-9_\u0900-\u097F]+/g, '').trim();

        return sanitizeCaptionResponse({
          source: AI_SOURCES.OPENAI,
          captionText: cleanCaption || rawContent,
          hashtags,
        });
      }
    } catch (err) {
      logger.warn(`OpenAI API call failed, falling back to Smart AI Engine: ${err.message}`);
    }
  }

  // 4. Built-in Smart AI Engine (Zero-Config Enterprise High-Performance Fallback)
  const result = synthesizeSmartCaption(context);
  return sanitizeCaptionResponse({
    source: AI_SOURCES.SMART_SYNTHESIZER,
    captionText: result.captionText,
    hashtags: result.hashtags,
  });
}

// Backwards-compatible object export
export const aiLogic = {
  generateCaption,
};

