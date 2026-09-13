import { z } from 'zod';

export const generateCaptionSchema = z.object({
  topic: z.string().optional().default('General Business Update'),
  occasionName: z.string().optional(),
  festivalName: z.string().optional(),
  customText: z.string().optional(),
  offerText: z.string().optional(),
  tone: z
    .enum(['FESTIVE', 'PROMOTIONAL', 'PROFESSIONAL', 'WITTY', 'FRIENDLY', 'URGENT'])
    .optional()
    .default('PROMOTIONAL'),
  language: z.enum(['ENGLISH', 'HINGLISH', 'HINDI']).optional().default('ENGLISH'),
  platform: z
    .enum(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'ALL'])
    .optional()
    .default('ALL'),
});

export const suggestHashtagsSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  category: z.string().optional(),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER', 'ALL']).optional().default('INSTAGRAM'),
});
