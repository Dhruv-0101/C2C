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
