import { z } from 'zod';

export const frameMetaSchema = z.object({
  title: z
    .string()
    .min(1, 'Frame title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string().optional(),
});

export const frameUploadSchema = z.object({
  title: z
    .string()
    .min(1, 'Frame title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string().optional(),
  base64Overlay: z.string().min(1, 'Overlay PNG image is required'),
});
