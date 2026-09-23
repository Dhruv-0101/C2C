import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import {
  TEMPLATE_LIMITS,
  TEMPLATE_ALLOWED_SORT_FIELDS,
} from './template.constants.js';

export const getTemplatesQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    festivalId: z.string().trim().optional(),
    category: z.string().trim().optional(),
    categoryId: z.string().trim().optional(),
    templateCategoryId: z.string().trim().optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(TEMPLATE_ALLOWED_SORT_FIELDS).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid template ID format'),
  }),
});

export const deleteTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid template ID format'),
  }),
});

export const createTemplateSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(
          TEMPLATE_LIMITS.TITLE_MIN_LENGTH,
          `Template title must be at least ${TEMPLATE_LIMITS.TITLE_MIN_LENGTH} characters`
        )
        .max(
          TEMPLATE_LIMITS.TITLE_MAX_LENGTH,
          `Template title must not exceed ${TEMPLATE_LIMITS.TITLE_MAX_LENGTH} characters`
        ),
      description: z
        .string()
        .trim()
        .max(
          TEMPLATE_LIMITS.DESCRIPTION_MAX_LENGTH,
          `Description must not exceed ${TEMPLATE_LIMITS.DESCRIPTION_MAX_LENGTH} characters`
        )
        .optional()
        .nullable(),
      category: z.string().trim().optional(),
      categoryId: z.string().trim().optional(),
      templateCategoryId: z.string().trim().optional().nullable(),
      newCategoryName: z
        .string()
        .trim()
        .max(
          TEMPLATE_LIMITS.CATEGORY_NAME_MAX_LENGTH,
          `Category name must not exceed ${TEMPLATE_LIMITS.CATEGORY_NAME_MAX_LENGTH} characters`
        )
        .optional(),
      festivalId: z.string().trim().optional().nullable(),
    }),
});
