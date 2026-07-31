import { z } from 'zod';

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Template title must be at least 2 characters'),
    description: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    festivalId: z.string().optional().nullable(),
    styleId: z.string().optional().nullable(),
    baseImageUrl: z.string().min(1, 'Base image is required'),
    coordinatesJson: z.object({
      logoZone: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
      headlineZone: z.object({
        x: z.number(),
        y: z.number(),
        fontSize: z.number(),
        color: z.string(),
      }),
      contactBarZone: z.object({
        x: z.number(),
        y: z.number(),
        height: z.number(),
      }),
    }).optional(),
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
