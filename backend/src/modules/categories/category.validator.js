import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const getCategoriesQuerySchema = z.object({
  query: paginationQuerySchema,
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(2, 'Category name must be at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters'),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

