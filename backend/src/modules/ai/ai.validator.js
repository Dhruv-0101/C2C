import { z } from 'zod';
import {
  AI_TONES,
  DEFAULT_AI_TONE,
  AI_SUPPORTED_LANGUAGES,
  DEFAULT_AI_LANGUAGE,
  AI_PLATFORMS,
  DEFAULT_AI_PLATFORM,
  AI_IMAGE_STYLES,
  DEFAULT_AI_IMAGE_STYLE,
  AI_ASPECT_RATIOS,
  DEFAULT_AI_ASPECT_RATIO,
  MIN_CAROUSEL_SLIDES,
  MAX_CAROUSEL_SLIDES,
  DEFAULT_CAROUSEL_SLIDES,
} from './ai.constants.js';

/**
 * 🤖 AI VALIDATION SCHEMAS (ZOD)
 * Strictly validates incoming request payloads for AI generation endpoints.
 */

export const generateCaptionSchema = z.object({
  body: z.object({
    topic: z.string().trim().optional().default('General Business Update'),
    occasionName: z.string().trim().optional(),
    festivalName: z.string().trim().optional(),
    customText: z.string().trim().optional(),
    offerText: z.string().trim().optional(),
    tone: z.enum(AI_TONES).optional().default(DEFAULT_AI_TONE),
    language: z.enum(AI_SUPPORTED_LANGUAGES).optional().default(DEFAULT_AI_LANGUAGE),
    platform: z.enum(AI_PLATFORMS).optional().default(DEFAULT_AI_PLATFORM),
  }),
});

export const generateImageSchema = z.object({
  body: z.object({
    prompt: z
      .string({ required_error: 'Prompt is required' })
      .trim()
      .min(3, 'Prompt must be at least 3 characters')
      .max(1000, 'Prompt must be under 1000 characters'),
    style: z.enum(AI_IMAGE_STYLES).optional().default(DEFAULT_AI_IMAGE_STYLE),
    aspectRatio: z.enum(AI_ASPECT_RATIOS).optional().default(DEFAULT_AI_ASPECT_RATIO),
    negativePrompt: z.string().trim().optional(),
    occasionName: z.string().trim().optional(),
  }),
});

export const getAiJobStatusSchema = z.object({
  params: z.object({
    jobId: z.string({ required_error: 'Job ID is required' }).min(1, 'Job ID is required'),
  }),
  query: z
    .object({
      type: z.enum(['image', 'caption']).optional().default('image'),
    })
    .optional(),
});

export const generateCarouselSchema = z.object({
  body: z.object({
    topic: z
      .string({ required_error: 'Topic is required' })
      .trim()
      .min(3, 'Topic must be at least 3 characters')
      .max(500, 'Topic must be under 500 characters'),
    numberOfSlides: z
      .number({ invalid_type_error: 'numberOfSlides must be a number' })
      .int()
      .min(MIN_CAROUSEL_SLIDES, `Minimum ${MIN_CAROUSEL_SLIDES} slides required`)
      .max(MAX_CAROUSEL_SLIDES, `Maximum ${MAX_CAROUSEL_SLIDES} slides allowed`)
      .optional()
      .default(DEFAULT_CAROUSEL_SLIDES),
    tone: z.enum(AI_TONES).optional().default(DEFAULT_AI_TONE),
    language: z.enum(AI_SUPPORTED_LANGUAGES).optional().default(DEFAULT_AI_LANGUAGE),
    industry: z.string().trim().optional(),
    targetAudience: z.string().trim().optional(),
  }),
});

