import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    templateId: z.string().optional().nullable(),
    festivalId: z.string().optional().nullable(),
    frameId: z.string().optional().nullable(),
    customText: z.string().optional().nullable(),
    offerText: z.string().optional().nullable(),
    finalGraphicUrl: z.string().optional().nullable(),
    base64Graphic: z.string().optional().nullable(),
    base64Image: z.string().optional().nullable(),
    userConfigJson: z.any().optional().nullable(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('DRAFT'),
  }),
});
