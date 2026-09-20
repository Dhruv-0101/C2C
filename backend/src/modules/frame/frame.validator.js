import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import {
  FRAME_ALLOWED_SORT_FIELDS,
  FRAME_TITLE_MIN_LENGTH,
  FRAME_TITLE_MAX_LENGTH,
  FRAME_DESCRIPTION_MAX_LENGTH,
} from './frame.constants.js';

/**
 * 🖼️ FRAME VALIDATION SCHEMAS (ZOD)
 * Strictly validates Request params, queries, and request bodies before reaching controller/logic.
 */

export const frameIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid frame ID format. Must be a valid UUID.'),
  }),
});

export const getFramesQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    search: z.string().trim().optional(),
    sortBy: z.enum(FRAME_ALLOWED_SORT_FIELDS).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const createFrameSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(FRAME_TITLE_MIN_LENGTH, `Title must be at least ${FRAME_TITLE_MIN_LENGTH} characters`)
      .max(FRAME_TITLE_MAX_LENGTH, `Title cannot exceed ${FRAME_TITLE_MAX_LENGTH} characters`),
    description: z
      .string()
      .trim()
      .max(FRAME_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${FRAME_DESCRIPTION_MAX_LENGTH} characters`)
      .optional()
      .nullable(),
    overlayPngUrl: z.string().optional().nullable(),
    previewUrl: z.string().optional().nullable(),
    base64Overlay: z.string().optional().nullable(),
    base64Image: z.string().optional().nullable(),
    blueprint: z.any().optional().nullable(),
    configJson: z.any().optional().nullable(),
  }),
});
