import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const getTemplatesQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    festivalId: z.string().optional(),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Template title must be at least 2 characters'),
    description: z.string().optional(),
    festivalId: z.string().optional().nullable(),
    baseImageUrl: z.string().min(1, 'Base image is required'),
  }),
});

export const compositePostSchema = z.object({
  body: z.object({
    templateId: z.string().min(1, 'Template ID is required'),
    customText: z.string().optional(),
    brandKit: z.object({
      businessName: z.string().optional(),
      logoUrl: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      websiteUrl: z.string().optional().nullable(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    }).optional(),
  }),
});
