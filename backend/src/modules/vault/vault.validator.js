import { z } from 'zod';

export const updateVaultItemSchema = z.object({
  body: z.object({
    occasionName: z.string().trim().optional(),
    categoryName: z.string().trim().optional(),
    graphicUrl: z.string().url('Invalid graphic URL format').optional(),
  }),
});

export const bulkDeleteVaultItemsSchema = z.object({
  body: z.object({
    ids: z.array(z.string().min(1, 'Item ID required')).min(1, 'At least 1 item ID must be provided'),
  }),
});
