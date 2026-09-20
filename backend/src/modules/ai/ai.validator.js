import { z } from 'zod';
import {
  AI_TONES,
  DEFAULT_AI_TONE,
  AI_SUPPORTED_LANGUAGES,
  DEFAULT_AI_LANGUAGE,
  AI_PLATFORMS,
  DEFAULT_AI_PLATFORM,
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
