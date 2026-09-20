import { z } from 'zod';
import {
  BRANDKIT_LIMITS,
  ALLOWED_CAPTION_LANGUAGES,
} from './brandkit.constants.js';

export const updateBrandKitSchema = z.object({
  body: z.object({
    businessName: z
      .string({ required_error: 'Business name is required' })
      .trim()
      .min(
        BRANDKIT_LIMITS.BUSINESS_NAME_MIN_LENGTH,
        `Business name must be at least ${BRANDKIT_LIMITS.BUSINESS_NAME_MIN_LENGTH} characters`
      )
      .max(
        BRANDKIT_LIMITS.BUSINESS_NAME_MAX_LENGTH,
        `Business name cannot exceed ${BRANDKIT_LIMITS.BUSINESS_NAME_MAX_LENGTH} characters`
      ),
    categoryId: z.string().trim().optional().nullable().or(z.literal('')),
    logoUrl: z.string().trim().optional().nullable().or(z.literal('')),
    base64Logo: z.string().optional().nullable(),
    avatarUrl: z.string().trim().optional().nullable().or(z.literal('')),
    base64Avatar: z.string().optional().nullable(),
    phone: z
      .string()
      .trim()
      .max(
        BRANDKIT_LIMITS.PHONE_MAX_LENGTH,
        `Phone cannot exceed ${BRANDKIT_LIMITS.PHONE_MAX_LENGTH} characters`
      )
      .optional()
      .nullable(),
    whatsapp: z
      .string()
      .trim()
      .max(
        BRANDKIT_LIMITS.WHATSAPP_MAX_LENGTH,
        `WhatsApp cannot exceed ${BRANDKIT_LIMITS.WHATSAPP_MAX_LENGTH} characters`
      )
      .optional()
      .nullable(),
    email: z
      .string()
      .trim()
      .email('Invalid email address format')
      .max(
        BRANDKIT_LIMITS.EMAIL_MAX_LENGTH,
        `Email cannot exceed ${BRANDKIT_LIMITS.EMAIL_MAX_LENGTH} characters`
      )
      .optional()
      .nullable()
      .or(z.literal('')),
    instagramHandle: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.INSTAGRAM_HANDLE_MAX_LENGTH)
      .optional()
      .nullable(),
    facebookHandle: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.FACEBOOK_HANDLE_MAX_LENGTH)
      .optional()
      .nullable(),
    address: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.ADDRESS_MAX_LENGTH)
      .optional()
      .nullable(),
    city: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.CITY_MAX_LENGTH)
      .optional()
      .nullable(),
    state: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.STATE_MAX_LENGTH)
      .optional()
      .nullable(),
    country: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.COUNTRY_MAX_LENGTH)
      .optional()
      .nullable(),
    tagline: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.TAGLINE_MAX_LENGTH)
      .optional()
      .nullable(),
    targetAudience: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.TARGET_AUDIENCE_MAX_LENGTH)
      .optional()
      .nullable(),
    captionLanguage: z
      .string()
      .trim()
      .refine((lang) => !lang || ALLOWED_CAPTION_LANGUAGES.includes(lang), {
        message: 'Unsupported caption language',
      })
      .optional()
      .nullable(),
    businessUsps: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.BUSINESS_USPS_MAX_LENGTH)
      .optional()
      .nullable(),
    linkedinHandle: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.LINKEDIN_HANDLE_MAX_LENGTH)
      .optional()
      .nullable(),
    gmbReviewUrl: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.GMB_REVIEW_URL_MAX_LENGTH)
      .optional()
      .nullable(),
    upiVpa: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.UPI_VPA_MAX_LENGTH)
      .optional()
      .nullable(),
    upiQrUrl: z.string().trim().optional().nullable().or(z.literal('')),
    base64UpiQr: z.string().optional().nullable(),
    workingHours: z
      .string()
      .trim()
      .max(BRANDKIT_LIMITS.WORKING_HOURS_MAX_LENGTH)
      .optional()
      .nullable(),
  }),
});
