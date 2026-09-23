import { z } from 'zod';
import {
  PRO_SLIDER_LIMITS,
  BILLING_PLAN_LIST,
  BILLING_CURRENCY_LIST,
  BILLING_ALLOWED_SORT_FIELDS,
} from './billing.constants.js';

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    postCount: z
      .number()
      .min(PRO_SLIDER_LIMITS.MIN_POSTS)
      .max(PRO_SLIDER_LIMITS.MAX_POSTS)
      .default(PRO_SLIDER_LIMITS.DEFAULT_POSTS),
  }),
});

export const verifyRazorpaySchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'orderId is required'),
    paymentId: z.string().min(1, 'paymentId is required'),
    signature: z.string().min(1, 'signature is required'),
    postCount: z
      .number()
      .min(PRO_SLIDER_LIMITS.MIN_POSTS)
      .max(PRO_SLIDER_LIMITS.MAX_POSTS)
      .default(PRO_SLIDER_LIMITS.DEFAULT_POSTS),
  }),
});

export const createStripeIntentSchema = z.object({
  body: z.object({
    postCount: z
      .number()
      .min(PRO_SLIDER_LIMITS.MIN_POSTS)
      .max(PRO_SLIDER_LIMITS.MAX_POSTS)
      .default(PRO_SLIDER_LIMITS.DEFAULT_POSTS),
  }),
});

export const verifyStripeSchema = z.object({
  body: z.object({
    intentId: z.string().min(1, 'intentId is required'),
    postCount: z
      .number()
      .min(PRO_SLIDER_LIMITS.MIN_POSTS)
      .max(PRO_SLIDER_LIMITS.MAX_POSTS)
      .default(PRO_SLIDER_LIMITS.DEFAULT_POSTS),
  }),
});

export const adminTopUpParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid({ message: 'Invalid target user ID' }),
  }),
});

export const adminTopUpSchema = z.object({
  params: z.object({
    userId: z.string().uuid({ message: 'Invalid target user ID' }),
  }),
  body: z.object({
    bonusPosts: z.number().int().min(1).max(1000).optional().default(10),
  }),
});

export const recordManualTransactionSchema = z.object({
  body: z.object({
    userId: z.string().uuid({ message: 'Valid user ID is required' }),
    plan: z.enum(BILLING_PLAN_LIST).optional().default('PRO'),
    transactionType: z.string().optional().default('PLAN_PURCHASE'),
    paymentGateway: z.string().optional().default('ADMIN_MANUAL'),
    pricePaid: z.number().nonnegative().optional().default(0),
    currency: z.enum(BILLING_CURRENCY_LIST).optional().default('INR'),
    postCount: z.number().int().positive().optional().default(100),
    paymentId: z.string().optional().nullable(),
    orderId: z.string().optional().nullable(),
    status: z.string().optional().default('COMPLETED'),
  }),
});

export const downloadInvoiceParamSchema = z.object({
  params: z.object({
    transactionId: z.string().min(1, 'Transaction ID is required'),
  }),
});

const emptyToUndefined = (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val);

export const getBillingHistoryQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(100).optional()),
    sortBy: z.preprocess(emptyToUndefined, z.enum(BILLING_ALLOWED_SORT_FIELDS).optional()),
    sortOrder: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).optional()),
  }),
});

export const getAdminTransactionsQuerySchema = z.object({
  query: z.object({
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(100).optional()),
    search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    status: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    paymentGateway: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    currency: z.preprocess(emptyToUndefined, z.enum(BILLING_CURRENCY_LIST).optional()),
    plan: z.preprocess(emptyToUndefined, z.enum(BILLING_PLAN_LIST).optional()),
    startDate: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    endDate: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    sortBy: z.preprocess(emptyToUndefined, z.enum(BILLING_ALLOWED_SORT_FIELDS).optional()),
    sortOrder: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).optional()),
  }),
});
