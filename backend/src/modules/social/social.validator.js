import { z } from 'zod';

export const connectManualSchema = z.object({
  body: z.object({
    handle: z
      .string({ required_error: 'Social handle is required' })
      .min(1, 'Handle cannot be empty')
      .max(100, 'Handle cannot exceed 100 characters'),
    platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER'], {
      required_error: 'Valid social platform is required',
    }),
  }),
});

export const disconnectAccountSchema = z.object({
  params: z.object({
    platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'LINKEDIN', 'TWITTER'], {
      required_error: 'Valid platform parameter is required',
    }),
  }),
});
