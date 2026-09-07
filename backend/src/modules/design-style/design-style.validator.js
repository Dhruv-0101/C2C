import { z } from 'zod';

export const createDesignStyleSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Style name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters'),
    description: z.string().optional(),
    primaryColor: z.string().optional().default('#F59E0B'),
    secondaryColor: z.string().optional().default('#0D9488'),
    accentColor: z.string().optional().default('#EC4899'),
    backgroundColor: z.string().optional().default('#0B0F17'),
    gradient: z.string().optional(),
    fontHeader: z.string().optional().default('Space Grotesk'),
    fontBody: z.string().optional().default('Plus Jakarta Sans'),
    colors: z.array(z.string()).optional().default([]),
    rulesJson: z.any().optional(),
  }),
});
