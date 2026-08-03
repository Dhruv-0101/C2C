import { z } from 'zod';

export const updateBrandKitSchema = z.object({
  body: z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    categoryId: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    base64Logo: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    instagramHandle: z.string().optional().nullable(),
    facebookHandle: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    websiteUrl: z.string().optional().nullable(),
    tagline: z.string().optional().nullable(),
  }),
});
