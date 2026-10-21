import {
  ALLOWED_CAPTION_LANGUAGES,
  DEFAULT_CAPTION_LANGUAGE,
} from '../brandkit/brandkit.constants.js';

/**
 * 🤖 AI MODULE CONSTANTS
 * Central single source of truth for AI generation tones, supported languages, platforms, and sources.
 * Dynamically linked to central BrandKit and Social platform standards to eliminate drift.
 */

// Supported Marketing & Creative Tones
export const AI_TONES = Object.freeze([
  'FESTIVE',
  'PROMOTIONAL',
  'PROFESSIONAL',
  'WITTY',
  'FRIENDLY',
  'URGENT',
]);
export const DEFAULT_AI_TONE = 'PROMOTIONAL';

// Dynamically inherit central language choices from BrandKit (supports both TitleCase and UPPERCASE formats)
export const AI_LANGUAGES = ALLOWED_CAPTION_LANGUAGES;
export const DEFAULT_AI_LANGUAGE = 'ENGLISH';

export const AI_SUPPORTED_LANGUAGES = Object.freeze(
  Array.from(
    new Set([
      ...ALLOWED_CAPTION_LANGUAGES,
      ...ALLOWED_CAPTION_LANGUAGES.map((lang) => lang.toUpperCase()),
    ])
  )
);

// Supported Target Social Media Networks
export const AI_PLATFORMS = Object.freeze(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'ALL']);
export const DEFAULT_AI_PLATFORM = 'ALL';

// AI Execution Sources / Providers
export const AI_SOURCES = Object.freeze({
  GEMINI: 'GEMINI_AI',
  OPENAI: 'OPENAI',
  SMART_SYNTHESIZER: 'SMART_SYNTHESIZER',
});

// Fallback Hashtags when prompt generation yields empty sets
export const DEFAULT_FALLBACK_HASHTAGS = Object.freeze([
  '#BrandFlow',
  '#SocialMedia',
  '#DigitalMarketing',
]);

// 🎨 NANO BANANA AI IMAGE GENERATION CONSTANTS
export const AI_IMAGE_MODELS = Object.freeze({
  NANO_BANANA_2_1: 'gemini-nano-banana-2.1',
  NANO_BANANA_2: 'gemini-3.1-flash-image',
  NANO_BANANA_PRO: 'nano-banana-pro-preview',
});

export const AI_IMAGE_STYLES = Object.freeze([
  'Photorealistic',
  'Festive Luxury',
  'Modern Minimalist',
  'Studio Product',
  'Vibrant 3D Render',
  'Warm Indian Heritage',
]);

export const DEFAULT_AI_IMAGE_STYLE = 'Photorealistic';

export const AI_ASPECT_RATIOS = Object.freeze(['1:1', '4:5', '16:9']);
export const DEFAULT_AI_ASPECT_RATIO = '1:1';

// 🚦 BullMQ Asynchronous AI Job Lifecycle Statuses
export const AI_JOB_STATUS = Object.freeze({
  WAITING: 'WAITING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

// 📊 Step-by-Step UI Execution Trackers
export const AI_JOB_STEPS = Object.freeze({
  IN_QUEUE: 'IN_QUEUE',
  GENERATING_AI: 'GENERATING_AI',
  UPLOADING_CDN: 'UPLOADING_CDN',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});
