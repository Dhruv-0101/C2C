import { z } from 'zod';
import {
  ANALYTICS_RANGE_LIST,
  DEFAULT_ANALYTICS_RANGE,
  ANALYTICS_PLATFORM_LIST,
  DEFAULT_ANALYTICS_PLATFORM,
  ANALYTICS_TOP_TEMPLATES_LIMITS,
} from './analytics.constants.js';

/**
 * Validates query parameters for overview, trends, and platform breakdown
 */
export const getAnalyticsQuerySchema = z.object({
  range: z.enum(ANALYTICS_RANGE_LIST).optional().default(DEFAULT_ANALYTICS_RANGE),
  platform: z.enum(ANALYTICS_PLATFORM_LIST).optional().default(DEFAULT_ANALYTICS_PLATFORM),
});

/**
 * Validates query parameters for top templates
 */
export const getTopTemplatesQuerySchema = z.object({
  limit: z
    .coerce
    .number()
    .int()
    .min(ANALYTICS_TOP_TEMPLATES_LIMITS.MIN)
    .max(ANALYTICS_TOP_TEMPLATES_LIMITS.MAX)
    .optional()
    .default(ANALYTICS_TOP_TEMPLATES_LIMITS.DEFAULT),
});
