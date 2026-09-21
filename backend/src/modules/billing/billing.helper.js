import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { BadRequestError } from '../../common/errors/custom-errors.js';
import {
  BASE_PRICES,
  PRO_SLIDER_LIMITS,
  BILLING_CURRENCIES,
  SUBSCRIPTION_STATUSES,
} from './billing.constants.js';

/**
 * Calculates volume discounted total price and per-post rate
 *
 * @param {number} postCount - Desired number of posts (10 to 100)
 * @param {string} [currency='INR'] - 'INR' or 'USD'
 * @returns {Object} Calculated pricing details
 */
export const calculatePlanPricing = (postCount, currency = BILLING_CURRENCIES.INR) => {
  const count = Math.max(
    PRO_SLIDER_LIMITS.MIN_POSTS,
    Math.min(PRO_SLIDER_LIMITS.MAX_POSTS, Number(postCount) || PRO_SLIDER_LIMITS.DEFAULT_POSTS)
  );

  const isUsd = currency.toUpperCase() === BILLING_CURRENCIES.USD;
  const basePricePerPost = isUsd ? BASE_PRICES.USD : BASE_PRICES.INR;

  let discountPercentage = 0;
  if (count >= 51) {
    discountPercentage = 0.3; // 30% discount for 51-100 posts
  } else if (count >= 21) {
    discountPercentage = 0.2; // 20% discount for 21-50 posts
  } else if (count >= 10) {
    discountPercentage = 0.1; // 10% discount for 10-20 posts
  }

  const rawTotal = count * basePricePerPost;
  const discountAmount = rawTotal * discountPercentage;
  const finalTotal = Math.round((rawTotal - discountAmount) * 100) / 100;
  const effectivePricePerPost = Math.round((finalTotal / count) * 100) / 100;

  return {
    postCount: count,
    currency: isUsd ? BILLING_CURRENCIES.USD : BILLING_CURRENCIES.INR,
    currencySymbol: isUsd ? '$' : '₹',
    basePricePerPost,
    discountPercentage: Math.round(discountPercentage * 100),
    rawTotal,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalTotal,
    effectivePricePerPost,
  };
};

/**
 * 🛡️ Sanitize a subscription record
 * Computes remaining post counts and strips unneeded database properties (OWASP Data Minimization).
 *
 * @param {Object|null} sub - Raw subscription from database
 * @returns {Object|null} Sanitized subscription object
 */
export const sanitizeSubscription = (sub) => {
  if (!sub) return null;

  const planRemaining = Math.max(0, (sub.totalPostsAllowed || 0) - (sub.postsUsed || 0));
  const bonusRemaining = Math.max(0, (sub.bonusPostsAllowed || 0) - (sub.bonusPostsUsed || 0));
  const postsRemaining = planRemaining + bonusRemaining;

  const hasPlan = (sub.totalPostsAllowed || 0) > 0 || (sub.plan === 'PRO' && (sub.pricePaid || 0) > 0);
  const isExpired = sub.status === SUBSCRIPTION_STATUSES.EXPIRED || postsRemaining <= 0;

  let computedStatus = sub.status;
  if (!hasPlan && bonusRemaining > 0) {
    computedStatus = SUBSCRIPTION_STATUSES.BONUS_ONLY;
  } else if (isExpired) {
    computedStatus = SUBSCRIPTION_STATUSES.EXPIRED;
  }

  return {
    id: sub.id,
    userId: sub.userId,
    plan: hasPlan ? sub.plan : null,
    status: computedStatus,
    totalPostsAllowed: sub.totalPostsAllowed || 0,
    postsUsed: sub.postsUsed || 0,
    planRemaining,
    bonusPostsAllowed: sub.bonusPostsAllowed || 0,
    bonusPostsUsed: sub.bonusPostsUsed || 0,
    bonusRemaining,
    postsRemaining,
    pricePaid: sub.pricePaid || 0,
    currency: sub.currency || BILLING_CURRENCIES.INR,
    paymentGateway: sub.paymentGateway || null,
    paymentId: sub.paymentId || null,
    orderId: sub.orderId || null,
    isExpired,
    hasPlan,
    canCreatePost: postsRemaining > 0,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
};

/**
 * 🛡️ Sanitize a billing transaction record
 *
 * @param {Object|null} tx - Raw transaction from database
 * @returns {Object|null} Sanitized transaction object
 */
export const sanitizeTransaction = (tx) => {
  if (!tx) return null;

  const sanitized = {
    id: tx.id,
    userId: tx.userId,
    plan: tx.plan,
    transactionType: tx.transactionType,
    paymentGateway: tx.paymentGateway,
    pricePaid: tx.pricePaid,
    currency: tx.currency,
    postCount: tx.postCount,
    paymentId: tx.paymentId,
    orderId: tx.orderId,
    status: tx.status,
    createdAt: tx.createdAt,
  };

  if (tx.user) {
    sanitized.user = {
      id: tx.user.id,
      email: tx.user.email,
      fullName: tx.user.fullName,
      avatarUrl: tx.user.avatarUrl || null,
      brandKit: tx.user.brandKit
        ? {
            businessName: tx.user.brandKit.businessName || '',
            phone: tx.user.brandKit.phone || '',
            city: tx.user.brandKit.city || '',
            country: tx.user.brandKit.country || '',
          }
        : null,
    };
  }

  return sanitized;
};

/**
 * 🛡️ Sanitize an array of billing transaction records
 *
 * @param {Array} transactions - Raw transactions from database
 * @returns {Array} Sanitized transactions
 */
export const sanitizeTransactions = (transactions = []) => {
  if (!Array.isArray(transactions)) return [];
  return transactions.map(sanitizeTransaction).filter(Boolean);
};

/**
 * Verify Razorpay HMAC-SHA256 Signature directly via crypto
 *
 * @param {string} orderId - Razorpay order_id
 * @param {string} paymentId - Razorpay payment_id
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    logger.error('❌ [BillingHelper] Razorpay key secret is not configured in environment.');
    throw new BadRequestError('Razorpay payment gateway secret is not configured.');
  }
  if (!signature || !orderId || !paymentId) return false;

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Create Razorpay Order via official Razorpay Orders API
 *
 * @param {Object} params
 * @param {number} params.amountInPaise - Amount in smallest currency unit (paise)
 * @param {string} [params.currency='INR'] - Currency code
 * @param {string} params.receipt - Internal receipt tracking ID
 * @returns {Promise<Object>} Order data
 */
export const createRazorpayOrderHelper = async ({ amountInPaise, currency = BILLING_CURRENCIES.INR, receipt }) => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    logger.error('❌ [BillingHelper] Razorpay credentials missing in environment.');
    throw new BadRequestError('Razorpay payment gateway credentials are not configured.');
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        payment_capture: 1,
      }),
    });

    const data = await response.json();
    if (data.id) {
      return { orderId: data.id, keyId, amount: amountInPaise, currency };
    }

    logger.error(`❌ [BillingHelper] Razorpay order creation failed: ${JSON.stringify(data)}`);
    throw new BadRequestError(data?.error?.description || 'Razorpay order creation failed.');
  } catch (err) {
    logger.error(`❌ [BillingHelper] Razorpay API error: ${err.message}`);
    if (err instanceof BadRequestError) throw err;
    throw new BadRequestError(err.message || 'Razorpay payment gateway is currently unavailable.');
  }
};

/**
 * Create Stripe PaymentIntent via official Stripe API
 *
 * @param {Object} params
 * @param {number} params.amountInCents - Amount in cents
 * @param {string} [params.currency='usd'] - Currency code
 * @param {Object} [params.metadata] - Optional metadata
 * @returns {Promise<Object>} Stripe Intent data
 */
export const createStripeIntentHelper = async ({ amountInCents, currency = 'usd', metadata }) => {
  const secretKey = env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    logger.error('❌ [BillingHelper] Stripe secret key missing in environment.');
    throw new BadRequestError('Stripe payment gateway credentials are not configured.');
  }

  try {
    const bodyParams = new URLSearchParams();
    bodyParams.append('amount', amountInCents.toString());
    bodyParams.append('currency', currency);
    bodyParams.append('description', 'BrandFlow Pro Subscription Export');
    bodyParams.append('shipping[name]', 'BrandFlow Member');
    bodyParams.append('shipping[address][line1]', '510 Townsend St');
    bodyParams.append('shipping[address][postal_code]', '98140');
    bodyParams.append('shipping[address][city]', 'San Francisco');
    bodyParams.append('shipping[address][state]', 'CA');
    bodyParams.append('shipping[address][country]', 'US');
    if (metadata) {
      Object.keys(metadata).forEach((k) => bodyParams.append(`metadata[${k}]`, metadata[k]));
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams,
    });

    const data = await response.json();
    if (data.id && data.client_secret) {
      return {
        intentId: data.id,
        clientSecret: data.client_secret,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY,
        amount: amountInCents,
        currency,
        status: data.status,
      };
    }

    logger.error(`❌ [BillingHelper] Stripe intent creation failed: ${JSON.stringify(data)}`);
    throw new BadRequestError(data?.error?.message || 'Stripe payment intent creation failed.');
  } catch (err) {
    logger.error(`❌ [BillingHelper] Stripe API error: ${err.message}`);
    if (err instanceof BadRequestError) throw err;
    throw new BadRequestError(err.message || 'Stripe payment gateway is currently unavailable.');
  }
};

/**
 * Retrieve & Verify Stripe PaymentIntent status directly from Stripe API
 *
 * @param {string} paymentId - Stripe payment intent ID
 * @returns {Promise<Object>} Intent response object
 */
export const retrieveStripeIntentHelper = async (paymentId) => {
  const secretKey = env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    logger.error('❌ [BillingHelper] Stripe secret key missing in environment.');
    throw new BadRequestError('Stripe payment gateway credentials are not configured.');
  }

  if (!paymentId) {
    throw new BadRequestError('Missing required Stripe payment intent ID.');
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    if (data.error) {
      logger.error(`❌ [BillingHelper] Stripe Retrieve API error: ${JSON.stringify(data.error)}`);
      throw new BadRequestError(data.error.message || 'Failed to verify payment with Stripe.');
    }
    return data;
  } catch (err) {
    logger.error(`❌ [BillingHelper] Stripe Retrieve API error: ${err.message}`);
    if (err instanceof BadRequestError) throw err;
    throw new BadRequestError(err.message || 'Failed to verify payment with Stripe.');
  }
};
