/**
 * 🍌 Puter Service Constants & Model Definitions
 * Configured with calibrated credit costs (~20-25 credits) for Puter.js free tiers.
 */

export const PUTER_EXHAUSTED_STORAGE_KEY = 'brandflow_puter_quota_exhausted';

export const PUTER_CDN_SCRIPT_URL = 'https://js.puter.com/v2/';

export const PUTER_IMAGE_TIMEOUT_MS = 60000; // 60 seconds for diffusion txt2img

export const PUTER_CHAT_TIMEOUT_MS = 30000; // 30 seconds for chat completion

/**
 * Available Puter Image Models matching BrandFlow specs with calibrated credit burn
 */
export const PUTER_IMAGE_MODELS = {
  NATIVE: {
    key: 'NATIVE',
    id: null,
    name: 'Puter Native Flare',
    provider: 'OpenAI GPT 2.5 Flare',
    badge: 'Fast & Economic ⚡',
    cost: 20,
    description: 'Lowest credit burn (~20 cr), high-speed generation',
  },
  NANO_BANANA_2_1: {
    key: 'NANO_BANANA_2_1',
    id: 'openrouter:google/gemini-nano-banana-2.1',
    name: 'Gemini Nano Banana 2.1',
    provider: 'Google Gemini',
    badge: 'Indian Festival & Rich Colors 🍌',
    cost: 25,
    description: 'Deep Indian cultural nuance & rich festive lighting (~25 cr)',
  },
  FLUX_1_SCHNELL: {
    key: 'FLUX_1_SCHNELL',
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'FLUX.1 Schnell',
    provider: 'Black Forest Labs',
    badge: 'Ultra Photorealistic 🚀',
    cost: 25,
    description: 'High-definition commercial graphics & studio lighting (~25 cr)',
  },
};
