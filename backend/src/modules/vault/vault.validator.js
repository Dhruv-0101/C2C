import { z } from 'zod';

export const updateVaultItemSchema = z.object({
  body: z.object({
    occasionName: z.string().trim().optional(),
    categoryName: z.string().trim().optional(),
    graphicUrl: z.string().url('Invalid graphic URL format').optional(),
  }),
});
