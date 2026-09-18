import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const getTemplatesQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    festivalId: z.string().optional(),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    templateCategoryId: z.string().optional(),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Template title must be at least 2 characters'),
    description: z.string().optional(),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    templateCategoryId: z.string().optional(),
    newCategoryName: z.string().optional(),
    festivalId: z.string().optional().nullable(),
    baseImageUrl: z.string().min(1, 'Base image is required').optional(),
    base64Image: z.string().optional(),
  }).refine((data) => data.baseImageUrl || data.base64Image, {
    message: 'Base image URL or base64 image string is required',
    path: ['baseImageUrl'],
  }),
});

