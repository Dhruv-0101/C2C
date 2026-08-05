import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const getFramesQuerySchema = z.object({
  query: paginationQuerySchema,
});

export const createFrameSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional().nullable(),
    overlayPngUrl: z.string().optional().nullable(),
    base64Overlay: z.string().optional().nullable(),
    base64Image: z.string().optional().nullable(),
    configJson: z.any().optional().nullable(),
  }),
});
