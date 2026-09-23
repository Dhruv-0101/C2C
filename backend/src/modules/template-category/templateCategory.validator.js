import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import {
  TEMPLATE_CATEGORY_NAME_MIN_LENGTH,
  TEMPLATE_CATEGORY_NAME_MAX_LENGTH,
  TEMPLATE_CATEGORY_DESCRIPTION_MAX_LENGTH,
  TEMPLATE_CATEGORY_ALLOWED_SORT_FIELDS,
} from './templateCategory.constants.js';

export const getTemplateCategoriesQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(TEMPLATE_CATEGORY_ALLOWED_SORT_FIELDS).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getTemplateCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Template Category ID format'),
  }),
});

export const createTemplateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Template category name is required' })
      .trim()
      .min(
        TEMPLATE_CATEGORY_NAME_MIN_LENGTH,
        `Template category name must be at least ${TEMPLATE_CATEGORY_NAME_MIN_LENGTH} characters`
      )
      .max(
        TEMPLATE_CATEGORY_NAME_MAX_LENGTH,
        `Template category name cannot exceed ${TEMPLATE_CATEGORY_NAME_MAX_LENGTH} characters`
      ),
    description: z
      .string()
      .trim()
      .max(
        TEMPLATE_CATEGORY_DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${TEMPLATE_CATEGORY_DESCRIPTION_MAX_LENGTH} characters`
      )
      .optional()
      .nullable(),
  }),
});

export const updateTemplateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Template Category ID format'),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(
          TEMPLATE_CATEGORY_NAME_MIN_LENGTH,
          `Template category name must be at least ${TEMPLATE_CATEGORY_NAME_MIN_LENGTH} characters`
        )
        .max(
          TEMPLATE_CATEGORY_NAME_MAX_LENGTH,
          `Template category name cannot exceed ${TEMPLATE_CATEGORY_NAME_MAX_LENGTH} characters`
        )
        .optional(),
      description: z
        .string()
        .trim()
        .max(
          TEMPLATE_CATEGORY_DESCRIPTION_MAX_LENGTH,
          `Description cannot exceed ${TEMPLATE_CATEGORY_DESCRIPTION_MAX_LENGTH} characters`
        )
        .optional()
        .nullable(),
    })
    .refine((data) => data.name !== undefined || data.description !== undefined, {
      message: 'At least one field (name or description) must be provided for update',
    }),
});

export const deleteTemplateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Template Category ID format'),
  }),
});
