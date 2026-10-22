import { z } from 'zod';
import { NOTIFICATION_TYPES } from './notification.constants.js';

export const subscribePushSchema = z.object({
  endpoint: z.string().url('Invalid push service endpoint URL'),
  keys: z.object({
    p256dh: z.string().min(1, 'Missing p256dh encryption key'),
    auth: z.string().min(1, 'Missing auth authentication key'),
  }),
  userAgent: z.string().optional().default(''),
  deviceType: z.enum(['MOBILE', 'DESKTOP', 'TABLET', 'UNKNOWN']).optional().default('MOBILE'),
});

export const unsubscribePushSchema = z.object({
  endpoint: z.string().url('Invalid push service endpoint URL'),
});

export const testPushSchema = z.object({
  title: z.string().min(1).max(100).optional().default('BrandFlow Test Alert 🔔'),
  body: z.string().min(1).max(500).optional().default('Mobile push notifications are working smoothly!'),
  linkUrl: z.string().optional().default('/studio'),
  imageUrl: z.string().url().optional(),
});

export const adminBroadcastSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title cannot exceed 100 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(500, 'Message cannot exceed 500 characters'),
  type: z.enum(['PROMOTION', 'SYSTEM', 'MAINTENANCE', 'ANNOUNCEMENT', 'FESTIVAL_ALERT']).default('PROMOTION'),
  targetAudience: z.enum(['ALL', 'FREE_USERS', 'PRO_USERS']).default('ALL'),
  linkUrl: z.string().optional().default('/plan'),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
});

export const broadcastQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

