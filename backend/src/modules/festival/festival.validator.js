import { z } from 'zod';

export const createFestivalSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Festival name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    date: z
      .string({ required_error: 'Date is required' })
      .min(1, 'Date string is required'),
    description: z.string().optional(),
    targetRegion: z.string().optional().default('India'),
    bannerUrl: z.string().optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateFestivalSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Festival ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    date: z.string().optional(),
    description: z.string().optional(),
    targetRegion: z.string().optional(),
    bannerUrl: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
