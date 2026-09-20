import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import {
  FESTIVAL_NAME_MIN_LENGTH,
  FESTIVAL_NAME_MAX_LENGTH,
  FESTIVAL_DESCRIPTION_MAX_LENGTH,
  FESTIVAL_TARGET_REGION_MAX_LENGTH,
  DEFAULT_TARGET_REGION,
} from './festival.constants.js';

export const getFestivalsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    year: z
      .string()
      .regex(/^\d{4}$/, 'Year must be a 4-digit number (e.g. 2026)')
      .optional(),
    includeInactive: z
      .enum(['true', 'false', '1', '0'])
      .optional()
      .transform((val) => val === 'true' || val === '1'),
  }),
});

export const getFestivalByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Festival ID format'),
  }),
});

export const createFestivalSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Festival name is required' })
      .trim()
      .min(FESTIVAL_NAME_MIN_LENGTH, `Name must be at least ${FESTIVAL_NAME_MIN_LENGTH} characters`)
      .max(FESTIVAL_NAME_MAX_LENGTH, `Name cannot exceed ${FESTIVAL_NAME_MAX_LENGTH} characters`),
    date: z
      .string({ required_error: 'Date is required' })
      .trim()
      .min(1, 'Date is required')
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Invalid date format. Expected ISO-8601 string (e.g. 2026-11-01)',
      }),
    description: z
      .string()
      .trim()
      .max(FESTIVAL_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${FESTIVAL_DESCRIPTION_MAX_LENGTH} characters`)
      .optional(),
    targetRegion: z
      .string()
      .trim()
      .max(FESTIVAL_TARGET_REGION_MAX_LENGTH, `Region cannot exceed ${FESTIVAL_TARGET_REGION_MAX_LENGTH} characters`)
      .optional()
      .default(DEFAULT_TARGET_REGION),
    bannerUrl: z.string().trim().optional(),
    base64Banner: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateFestivalSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Festival ID format'),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(FESTIVAL_NAME_MIN_LENGTH, `Name must be at least ${FESTIVAL_NAME_MIN_LENGTH} characters`)
        .max(FESTIVAL_NAME_MAX_LENGTH, `Name cannot exceed ${FESTIVAL_NAME_MAX_LENGTH} characters`)
        .optional(),
      date: z
        .string()
        .trim()
        .refine((val) => !isNaN(new Date(val).getTime()), {
          message: 'Invalid date format. Expected ISO-8601 string (e.g. 2026-11-01)',
        })
        .optional(),
      description: z
        .string()
        .trim()
        .max(FESTIVAL_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${FESTIVAL_DESCRIPTION_MAX_LENGTH} characters`)
        .optional(),
      targetRegion: z
        .string()
        .trim()
        .max(FESTIVAL_TARGET_REGION_MAX_LENGTH, `Region cannot exceed ${FESTIVAL_TARGET_REGION_MAX_LENGTH} characters`)
        .optional(),
      bannerUrl: z.string().trim().optional(),
      base64Banner: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.date !== undefined ||
        data.description !== undefined ||
        data.targetRegion !== undefined ||
        data.bannerUrl !== undefined ||
        data.base64Banner !== undefined ||
        data.isActive !== undefined,
      {
        message: 'At least one field must be provided for update',
      }
    ),
});

export const deleteFestivalSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Festival ID format'),
  }),
});
