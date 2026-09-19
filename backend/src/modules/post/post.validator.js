import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const createPostSchema = z.object({
  body: z.object({
    templateId: z.string().optional().nullable(),
    festivalId: z.string().optional().nullable(),
    frameId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    occasionName: z.string().optional().nullable(),
    caption: z.string().optional().nullable(),
    customImageUrl: z.string().optional().nullable(),
    finalGraphicUrl: z.string().optional().nullable(),
    base64Graphic: z.string().optional().nullable(),
    base64Image: z.string().optional().nullable(),
    userConfigJson: z.any().optional().nullable(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('DRAFT'),
  }),
});

export const getAdminPostsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    categoryId: z.string().optional(),
    frameId: z.string().optional(),
    templateId: z.string().optional(),
    templateCategoryId: z.string().optional(),
    festivalId: z.string().optional(),
    userId: z.string().optional(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
