import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import {
  POST_STATUSES,
  POST_TARGET_PLATFORMS,
} from './post.constants.js';

/**
 * 📝 POST VALIDATION SCHEMAS (ZOD)
 * Strictly validates incoming request params, query filters, and request payloads for Post endpoints.
 */

export const postIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid post ID format. Must be a valid UUID.'),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    templateId: z.string().uuid().optional().nullable(),
    festivalId: z.string().uuid().optional().nullable(),
    frameId: z.string().uuid().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    occasionName: z.string().trim().max(200).optional().nullable(),
    caption: z.string().trim().optional().nullable(),
    hashtags: z.array(z.string().trim()).optional().nullable(),
    customImageUrl: z.string().optional().nullable(),
    finalGraphicUrl: z.string().optional().nullable(),
    base64Graphic: z.string().optional().nullable(),
    base64Image: z.string().optional().nullable(),
    userConfigJson: z.any().optional().nullable(),
    status: z.enum(POST_STATUSES).default('DRAFT'),
  }),
});

export const getAdminPostsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    categoryId: z.string().uuid().optional(),
    frameId: z.string().uuid().optional(),
    templateId: z.string().uuid().optional(),
    templateCategoryId: z.string().uuid().optional(),
    festivalId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    status: z.enum(POST_STATUSES).optional(),
    startDate: z.string().datetime().optional().or(z.string()),
    endDate: z.string().datetime().optional().or(z.string()),
  }),
});

export const publishNowSchema = z.object({
  body: createPostSchema.shape.body.extend({
    targetPlatforms: z.array(z.enum(POST_TARGET_PLATFORMS)).optional(),
  }),
});

export const schedulePostSchema = z.object({
  body: createPostSchema.shape.body.extend({
    targetPlatforms: z.array(z.enum(POST_TARGET_PLATFORMS)).optional(),
    scheduledAt: z
      .string({ required_error: 'Scheduled date/time is required' })
      .min(1, 'Scheduled date/time cannot be empty'),
  }),
});

export const updatePostGraphicSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid post ID format. Must be a valid UUID.'),
  }),
  body: z.object({
    finalGraphicUrl: z.string().optional().nullable(),
    base64Graphic: z.string().optional().nullable(),
    base64Image: z.string().optional().nullable(),
    userConfigJson: z.any().optional().nullable(),
  }),
});
