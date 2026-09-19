import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  body: z.object({
    postCount: z.number().min(10).max(100).default(15),
  }),
});

export const verifyRazorpaySchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'orderId is required'),
    paymentId: z.string().min(1, 'paymentId is required'),
    signature: z.string().optional(),
    postCount: z.number().min(10).max(100).default(15),
  }),
});

export const createStripeIntentSchema = z.object({
  body: z.object({
    postCount: z.number().min(10).max(100).default(15),
  }),
});

export const verifyStripeSchema = z.object({
  body: z.object({
    intentId: z.string().min(1, 'intentId is required'),
    postCount: z.number().min(10).max(100).default(15),
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
    plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional().default('PRO'),
    transactionType: z.string().optional().default('PLAN_PURCHASE'),
    paymentGateway: z.string().optional().default('ADMIN_MANUAL'),
    pricePaid: z.number().nonnegative().optional().default(0),
    currency: z.string().optional().default('INR'),
    postCount: z.number().int().positive().optional().default(100),
    paymentId: z.string().optional().nullable(),
    orderId: z.string().optional().nullable(),
    status: z.string().optional().default('COMPLETED'),
  }),
});


