/**
 * 💳 BILLING & SUBSCRIPTION CONSTANTS
 * Single source of truth for plans, pricing, currencies, gateways, and statuses.
 */

export const BILLING_PLANS = Object.freeze({
  FREE: 'FREE',
  PRO: 'PRO',
});

export const BILLING_PLAN_LIST = Object.freeze(Object.values(BILLING_PLANS));

export const BILLING_CURRENCIES = Object.freeze({
  INR: 'INR',
  USD: 'USD',
});

export const BILLING_CURRENCY_LIST = Object.freeze(Object.values(BILLING_CURRENCIES));

export const SUBSCRIPTION_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  NO_PLAN: 'NO_PLAN',
  BONUS_ONLY: 'BONUS_ONLY',
});

export const TRANSACTION_STATUSES = Object.freeze({
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

export const TRANSACTION_TYPES = Object.freeze({
  PLAN_ACTIVATION: 'PLAN_ACTIVATION',
  PLAN_PURCHASE: 'PLAN_PURCHASE',
  ADMIN_BONUS: 'ADMIN_BONUS',
});

export const PAYMENT_GATEWAYS = Object.freeze({
  FREE: 'FREE',
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
  ADMIN_MANUAL: 'ADMIN_MANUAL',
  ADMIN_BONUS: 'ADMIN_BONUS',
});

export const FREE_PLAN_LIMITS = Object.freeze({
  POST_LIMIT: 5,
  PLAN_NAME: 'FREE',
});

export const PRO_SLIDER_LIMITS = Object.freeze({
  MIN_POSTS: 10,
  MAX_POSTS: 100,
  DEFAULT_POSTS: 15,
});

export const BASE_PRICES = Object.freeze({
  INR: 15, // Base ₹15 per post
  USD: 0.17, // Base $0.17 per post (direct exchange equivalent of ₹15)
});

export const BILLING_ALLOWED_SORT_FIELDS = Object.freeze([
  'createdAt',
  'pricePaid',
  'postCount',
  'status',
]);

export const DEFAULT_BILLING_SORT_BY = 'createdAt';

export const DEFAULT_BILLING_SORT_ORDER = 'desc';
