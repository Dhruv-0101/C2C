import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const getTemplatesQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    festivalId: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Template title must be at least 2 characters'),
    description: z.string().optional(),
    category: z.string().optional(),
    festivalId: z.string().optional().nullable(),
    baseImageUrl: z.string().min(1, 'Base image is required'),
  }),
});

