import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import {
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_DESCRIPTION_MAX_LENGTH,
} from './category.constants.js';

export const getCategoriesQuerySchema = z.object({
  query: paginationQuerySchema,
});

export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Category ID format'),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .trim()
      .min(CATEGORY_NAME_MIN_LENGTH, `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`)
      .max(CATEGORY_NAME_MAX_LENGTH, `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`),
    description: z
      .string()
      .trim()
      .max(CATEGORY_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`)
      .optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Category ID format'),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(CATEGORY_NAME_MIN_LENGTH, `Category name must be at least ${CATEGORY_NAME_MIN_LENGTH} characters`)
        .max(CATEGORY_NAME_MAX_LENGTH, `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`)
        .optional(),
      description: z
        .string()
        .trim()
        .max(CATEGORY_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX_LENGTH} characters`)
        .optional(),
    })
    .refine((data) => data.name !== undefined || data.description !== undefined, {
      message: 'At least one field (name or description) must be provided for update',
    }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Category ID format'),
  }),
});
