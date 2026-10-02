import { z } from 'zod';
import {
  SOCIAL_PLATFORM_LIST,
  SOCIAL_ALLOWED_SORT_FIELDS,
} from './social.constants.js';

export const disconnectAccountSchema = z.object({
  params: z.object({
    platform: z.enum(SOCIAL_PLATFORM_LIST, {
      required_error: 'Valid platform parameter is required',
    }),
  }),
});

export const oauthCallbackQuerySchema = z.object({
  query: z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
});

export const getAccountsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.enum(SOCIAL_ALLOWED_SORT_FIELDS).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const adminConnectUserTokenSchema = z.object({
  body: z.object({
    userId: z.string().uuid({ message: 'Valid target user ID is required' }),
    token: z.string().min(20, { message: 'Valid Meta System User or Page Token is required' }).trim(),
  }),
});

export const adminDisconnectUserAccountSchema = z.object({
  params: z.object({
    userId: z.string().uuid({ message: 'Valid target user ID is required' }),
    platform: z.enum(SOCIAL_PLATFORM_LIST, {
      required_error: 'Valid platform parameter is required',
    }),
  }),
});

