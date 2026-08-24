import { z } from 'zod';

export const brandKitSchema = z.object({
  businessName: z
    .string()
    .min(1, 'Business or Brand Name is required')
    .max(100, 'Business name must not exceed 100 characters'),
  categoryId: z.string().optional(),
  tagline: z.string().max(200, 'Tagline must not exceed 200 characters').optional(),
  phone: z.string().max(30, 'Phone number must not exceed 30 characters').optional(),
  whatsapp: z.string().max(30, 'WhatsApp number must not exceed 30 characters').optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .or(z.literal(''))
    .optional(),
  websiteUrl: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  logoUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
});
