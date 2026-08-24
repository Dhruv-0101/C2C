import { z } from 'zod';

export const festivalSchema = z.object({
  name: z
    .string()
    .min(1, 'Festival name is required')
    .max(100, 'Festival name must not exceed 100 characters'),
  date: z
    .string()
    .min(1, 'Festival date is required'),
  description: z.string().optional(),
  targetRegion: z.string().default('India'),
});
