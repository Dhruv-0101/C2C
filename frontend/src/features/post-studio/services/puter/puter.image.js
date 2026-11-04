/**
 * 🍌 Puter.js Image Generation Engine
 * Handles prompt enrichment, diffusion txt2img invocation, timeout aborts, and model routing.
 */

import { PUTER_IMAGE_TIMEOUT_MS } from './puter.constants';
import { getPuter, setupPuterModalSuppressor } from './puter.client';
import {
  isPuterConnected,
  isPuterExhausted,
  clearPuterExhausted,
  markPuterExhausted,
} from './puter.usage';

/**
 * Generate AI Visual Image via Puter.js (Client-side, Zero Server Cost)
 *
 * @param {Object} options
 * @param {string} options.prompt - Prompt text describing the image
 * @param {string} [options.style] - Aesthetic style (e.g., Photorealistic, 3D Render)
 * @param {string|Object} [options.model] - Optional specific model identifier or model object
 * @returns {Promise<{ success: boolean, imageUrl: string, model: string, source: string }>}
 */
export async function generatePuterImage({
  prompt,
  style = 'Photorealistic',
  model = null,
}) {
  // If Puter quota is confirmed exhausted, reject to fast-track
  if (isPuterExhausted()) {
    throw new Error('Puter AI quota exhausted. Fast-tracking to Google Gemini.');
  }

  setupPuterModalSuppressor();

  const instance = await getPuter();
  if (!instance || !instance.ai || !instance.ai.txt2img) {
    throw new Error('Puter AI Engine is not available in this browser environment.');
  }

  // Ensure user has connected Puter session
  if (!isPuterConnected()) {
    throw new Error('Puter account is not connected. Fast-tracking to Google Gemini.');
  }

  // Engineer commercial social media prompt
  const styleFragment = (style && style !== 'None') ? `${style} style, ` : '';
  const styledPrompt = `${prompt}, ${styleFragment}professional commercial lighting, vibrant colors, 8k resolution, trending on instagram, high quality marketing visual`;

  // Realistic timeout for AI diffusion image generation (60s)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Puter AI image generation timed out (exceeded 60s).'));
    }, PUTER_IMAGE_TIMEOUT_MS);
  });

  try {
    // Execute txt2img: use model if valid, otherwise native Puter image engine
    const modelId = typeof model === 'object' && model !== null ? model.id : model;
    const modelName = typeof model === 'object' && model !== null ? model.name : (modelId || 'Puter Native Flare');

    const txt2imgCall = async () => {
      if (modelId && typeof modelId === 'string') {
        try {
          return await instance.ai.txt2img(styledPrompt, { model: modelId });
        } catch (modelErr) {
          console.warn(`Puter model ${modelId} failed, seamlessly falling back to native engine:`, modelErr);
          return await instance.ai.txt2img(styledPrompt);
        }
      }
      return await instance.ai.txt2img(styledPrompt);
    };

    const imgResult = await Promise.race([
      txt2imgCall(),
      timeoutPromise,
    ]);

    let imageUrl = '';
    if (imgResult) {
      if (typeof imgResult === 'string') {
        imageUrl = imgResult;
      } else if (imgResult.src) {
        imageUrl = imgResult.src;
      } else if (typeof Blob !== 'undefined' && imgResult instanceof Blob) {
        imageUrl = URL.createObjectURL(imgResult);
      }
    }

    if (!imageUrl) {
      throw new Error('Puter did not return a valid image URL.');
    }

    // Success confirms active balance
    clearPuterExhausted();

    return {
      success: true,
      imageUrl,
      model: modelName,
      source: 'PUTER_AI',
    };
  } catch (err) {
    const errMsg = (err?.message || err?.error?.message || String(err)).toLowerCase();
    const isQuotaError =
      errMsg.includes('funding') ||
      errMsg.includes('balance') ||
      errMsg.includes('quota') ||
      errMsg.includes('credit') ||
      errMsg.includes('limit') ||
      errMsg.includes('subscription') ||
      err?.code === 'insufficient_funds' ||
      err?.code === 'usage_limit_exceeded';

    // Only flag exhausted if it is explicitly an account credit/quota issue
    if (isQuotaError) {
      markPuterExhausted();
    }
    throw err;
  }
}
