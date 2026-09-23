import { BadRequestError, NotFoundError, UnauthorizedError } from '../../common/errors/custom-errors.js';
import { env } from '../../config/env.js';
import {
  FREE_PLAN_LIMITS,
  PRO_SLIDER_LIMITS,
  BILLING_PLANS,
  BILLING_CURRENCIES,
  PAYMENT_GATEWAYS,
  SUBSCRIPTION_STATUSES,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from './billing.constants.js';
import {
  calculatePlanPricing,
  createRazorpayOrderHelper,
  createStripeIntentHelper,
  retrieveStripeIntentHelper,
  verifyRazorpaySignature,
  sanitizeSubscription,
  sanitizeTransaction,
  sanitizeTransactions,
} from './billing.helper.js';
import {
  findByUserId,
  upsertSubscription,
  createTransaction,
  findPaginatedUserTransactions,
  findTransactionById,
} from './billing.repository.js';
import { buildInvoicePdfBuffer } from './billing.pdf.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { addInvoiceEmailJob } from '../../queues/email.queue.js';
import { logger } from '../../config/logger.js';

/**
 * Get real-time subscription status, active plan & post quota
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Sanitized subscription status
 */
export const getSubscriptionStatus = async (userId) => {
  const sub = await findByUserId(userId);

  if (!sub) {
    return {
      id: null,
      userId,
      plan: null,
      status: SUBSCRIPTION_STATUSES.NO_PLAN,
      totalPostsAllowed: 0,
      postsUsed: 0,
      planRemaining: 0,
      bonusPostsAllowed: 0,
      bonusPostsUsed: 0,
      bonusRemaining: 0,
      postsRemaining: 0,
      pricePaid: 0,
      currency: BILLING_CURRENCIES.INR,
      paymentGateway: null,
      isExpired: true,
      hasPlan: false,
      canCreatePost: false,
    };
  }

  return sanitizeSubscription(sub);
};

/**
 * Activate / Select Free Plan (5 Posts Quota)
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Activation outcome
 */
export const activateFreePlan = async (userId) => {
  const existing = await findByUserId(userId);

  // If user already activated Free plan and used all 5 posts from plan quota
  if (
    existing &&
    existing.plan === BILLING_PLANS.FREE &&
    existing.totalPostsAllowed >= FREE_PLAN_LIMITS.POST_LIMIT &&
    existing.postsUsed >= FREE_PLAN_LIMITS.POST_LIMIT
  ) {
    throw new BadRequestError(
      'Free plan quota of 5 posts has been exhausted. Please purchase a Paid Pro Plan to continue.'
    );
  }

  const sub = await upsertSubscription(userId, {
    plan: BILLING_PLANS.FREE,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    totalPostsAllowed: FREE_PLAN_LIMITS.POST_LIMIT,
    postsUsed: 0, // Reset plan posts used for Free Plan
    bonusPostsAllowed: existing?.bonusPostsAllowed || 0,
    bonusPostsUsed: existing?.bonusPostsUsed || 0,
    pricePaid: 0,
    currency: BILLING_CURRENCIES.INR,
    paymentGateway: PAYMENT_GATEWAYS.FREE,
  });

  // Log transaction and dispatch BullMQ Invoice Email job
  const timestamp = Date.now();
  const freeTx = await createTransaction({
    userId,
    plan: BILLING_PLANS.FREE,
    transactionType: TRANSACTION_TYPES.PLAN_ACTIVATION,
    paymentGateway: PAYMENT_GATEWAYS.FREE,
    pricePaid: 0,
    currency: BILLING_CURRENCIES.INR,
    postCount: FREE_PLAN_LIMITS.POST_LIMIT,
    orderId: `FREE_ORD_${timestamp}`,
    paymentId: `FREE_ACT_${timestamp}`,
    status: TRANSACTION_STATUSES.COMPLETED,
  }).catch(() => null);

  if (freeTx?.id) {
    addInvoiceEmailJob({ userId, transactionId: freeTx.id }).catch(() => {});
  }

  const sanitizedSub = sanitizeSubscription(sub);

  return {
    message: 'Free Plan activated successfully! You have 5 plan posts allowed.',
    subscription: sanitizedSub,
    postsRemaining: sanitizedSub.postsRemaining,
    planRemaining: sanitizedSub.planRemaining,
    bonusRemaining: sanitizedSub.bonusRemaining,
  };
};

/**
 * Create Razorpay Order for Pro Plan (INR Currency)
 *
 * @param {string} userId - User ID
 * @param {number} postCount - Requested post quota
 * @returns {Promise<Object>} Order configuration
 */
export const createRazorpayOrder = async (userId, postCount) => {
  const pricing = calculatePlanPricing(postCount, BILLING_CURRENCIES.INR);
  const amountInPaise = Math.round(pricing.finalTotal * 100);

  const orderData = await createRazorpayOrderHelper({
    amountInPaise,
    currency: BILLING_CURRENCIES.INR,
    receipt: `rcpt_${userId.substring(0, 8)}_${Date.now()}`,
  });

  return {
    ...pricing,
    orderId: orderData.orderId,
    keyId: orderData.keyId,
  };
};

/**
 * Verify Razorpay Payment API & Activate Pro Plan
 *
 * @param {string} userId - User ID
 * @param {Object} payload - Payment payload
 * @returns {Promise<Object>} Verification outcome
 */
export const verifyRazorpayPayment = async (
  userId,
  { orderId, paymentId, signature, postCount }
) => {
  if (!orderId || !paymentId || !signature) {
    throw new BadRequestError('Missing required payment parameters (orderId, paymentId, signature).');
  }

  const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
  if (!isValid) {
    logger.error(
      `❌ [BillingLogic] Razorpay HMAC signature verification failed for order ${orderId}. Untrusted payment attempt.`
    );
    throw new BadRequestError('Payment signature verification failed. Untrusted payment attempt.');
  }

  const existing = await findByUserId(userId);
  const count = Math.max(
    PRO_SLIDER_LIMITS.MIN_POSTS,
    Math.min(PRO_SLIDER_LIMITS.MAX_POSTS, Number(postCount) || PRO_SLIDER_LIMITS.DEFAULT_POSTS)
  );
  const pricing = calculatePlanPricing(count, BILLING_CURRENCIES.INR);

  // Carry over unspent post credits into newly purchased pack
  const unusedPosts = Math.max(0, (existing?.totalPostsAllowed || 0) - (existing?.postsUsed || 0));
  const newTotalAllowed = unusedPosts + count;

  // Upgrade user subscription to PRO with newly purchased post quota
  const updatedSub = await upsertSubscription(userId, {
    plan: BILLING_PLANS.PRO,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    totalPostsAllowed: newTotalAllowed,
    postsUsed: 0,
    bonusPostsAllowed: existing?.bonusPostsAllowed || 0,
    bonusPostsUsed: existing?.bonusPostsUsed || 0,
    pricePaid: pricing.finalTotal,
    currency: BILLING_CURRENCIES.INR,
    paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
    orderId,
    paymentId,
  });

  // Log transaction and dispatch BullMQ Invoice Email job
  const rzpTx = await createTransaction({
    userId,
    plan: BILLING_PLANS.PRO,
    transactionType: TRANSACTION_TYPES.PLAN_PURCHASE,
    paymentGateway: PAYMENT_GATEWAYS.RAZORPAY,
    pricePaid: pricing.finalTotal,
    currency: BILLING_CURRENCIES.INR,
    postCount: count,
    orderId,
    paymentId,
    status: TRANSACTION_STATUSES.COMPLETED,
  }).catch(() => null);

  if (rzpTx?.id) {
    addInvoiceEmailJob({ userId, transactionId: rzpTx.id }).catch(() => {});
  }

  const sanitizedSub = sanitizeSubscription(updatedSub);

  return {
    success: true,
    message: `🎉 Payment Verified! Pro Plan activated with ${count} post creations allowed.`,
    pricing,
    subscription: sanitizedSub,
  };
};

/**
 * Create Stripe PaymentIntent for Pro Plan (USD Currency)
 *
 * @param {string} userId - User ID
 * @param {number} postCount - Requested post quota
 * @returns {Promise<Object>} Intent details
 */
export const createStripeIntent = async (userId, postCount) => {
  const pricing = calculatePlanPricing(postCount, BILLING_CURRENCIES.USD);
  const amountInCents = Math.round(pricing.finalTotal * 100);

  const intentData = await createStripeIntentHelper({
    amountInCents,
    currency: 'usd',
    metadata: { userId, postCount: postCount.toString() },
  });

  return {
    ...pricing,
    intentId: intentData.intentId,
    clientSecret: intentData.clientSecret,
    publishableKey: intentData.publishableKey,
  };
};

/**
 * Verify Stripe Payment API & Activate Pro Plan
 *
 * @param {string} userId - User ID
 * @param {Object} payload - Payment details
 * @returns {Promise<Object>} Verification outcome
 */
export const verifyStripePayment = async (userId, { intentId, postCount }) => {
  if (!intentId) {
    throw new BadRequestError('Missing required Stripe payment intent ID.');
  }

  const verifiedIntent = await retrieveStripeIntentHelper(intentId);
  if (verifiedIntent?.status !== 'succeeded') {
    logger.error(
      `❌ [BillingLogic] Stripe intent ${intentId} status is '${verifiedIntent?.status}', expected 'succeeded'.`
    );
    throw new BadRequestError('Stripe payment has not succeeded. Pro plan activation halted.');
  }

  const existing = await findByUserId(userId);
  const count = Math.max(
    PRO_SLIDER_LIMITS.MIN_POSTS,
    Math.min(PRO_SLIDER_LIMITS.MAX_POSTS, Number(postCount) || PRO_SLIDER_LIMITS.DEFAULT_POSTS)
  );
  const pricing = calculatePlanPricing(count, BILLING_CURRENCIES.USD);

  // Carry over unspent post credits into newly purchased pack
  const unusedPosts = Math.max(0, (existing?.totalPostsAllowed || 0) - (existing?.postsUsed || 0));
  const newTotalAllowed = unusedPosts + count;

  // Upgrade user subscription to PRO with newly purchased post quota
  const updatedSub = await upsertSubscription(userId, {
    plan: BILLING_PLANS.PRO,
    status: SUBSCRIPTION_STATUSES.ACTIVE,
    totalPostsAllowed: newTotalAllowed,
    postsUsed: 0,
    bonusPostsAllowed: existing?.bonusPostsAllowed || 0,
    bonusPostsUsed: existing?.bonusPostsUsed || 0,
    pricePaid: pricing.finalTotal,
    currency: BILLING_CURRENCIES.USD,
    paymentGateway: PAYMENT_GATEWAYS.STRIPE,
    paymentId: intentId,
  });

  // Log transaction and dispatch BullMQ Invoice Email job
  const stripeTx = await createTransaction({
    userId,
    plan: BILLING_PLANS.PRO,
    transactionType: TRANSACTION_TYPES.PLAN_PURCHASE,
    paymentGateway: PAYMENT_GATEWAYS.STRIPE,
    pricePaid: pricing.finalTotal,
    currency: BILLING_CURRENCIES.USD,
    postCount: count,
    paymentId: intentId,
    status: TRANSACTION_STATUSES.COMPLETED,
  }).catch(() => null);

  if (stripeTx?.id) {
    addInvoiceEmailJob({ userId, transactionId: stripeTx.id }).catch(() => {});
  }

  const sanitizedSub = sanitizeSubscription(updatedSub);

  return {
    success: true,
    message: `🎉 Payment Verified! Pro Plan activated with ${count} post creations allowed.`,
    pricing,
    subscription: sanitizedSub,
  };
};

/**
 * Admin Top-Up: Grant bonus post quota to a business user
 *
 * @param {string} targetUserId - Target User ID
 * @param {number} [bonusPosts=10] - Number of bonus credits
 * @returns {Promise<Object>} Sanitized updated subscription
 */
export const topUpUserQuota = async (targetUserId, bonusPosts = 10) => {
  const existing = await findByUserId(targetUserId);
  const currentBonusAllowed = existing?.bonusPostsAllowed || 0;
  const bonusPostsUsed = existing?.bonusPostsUsed || 0;
  const newBonusAllowed = currentBonusAllowed + bonusPosts;

  const totalPostsAllowed = existing?.totalPostsAllowed || 0;
  const postsUsed = existing?.postsUsed || 0;

  const planRemaining = Math.max(0, totalPostsAllowed - postsUsed);
  const bonusRemaining = Math.max(0, newBonusAllowed - bonusPostsUsed);
  const postsRemaining = planRemaining + bonusRemaining;

  const updatedSub = await upsertSubscription(targetUserId, {
    plan: existing?.plan || BILLING_PLANS.FREE,
    paymentGateway: existing?.paymentGateway || PAYMENT_GATEWAYS.ADMIN_BONUS,
    status: postsRemaining > 0 ? SUBSCRIPTION_STATUSES.ACTIVE : (existing?.status || SUBSCRIPTION_STATUSES.ACTIVE),
    totalPostsAllowed,
    postsUsed,
    bonusPostsAllowed: newBonusAllowed,
    bonusPostsUsed,
  });

  // Log transaction and dispatch BullMQ Invoice Email job
  const bonusTx = await createTransaction({
    userId: targetUserId,
    plan: existing?.plan || BILLING_PLANS.FREE,
    transactionType: TRANSACTION_TYPES.ADMIN_BONUS,
    paymentGateway: PAYMENT_GATEWAYS.ADMIN_BONUS,
    pricePaid: 0,
    currency: BILLING_CURRENCIES.INR,
    postCount: bonusPosts,
    paymentId: `admin_grant_${Date.now()}`,
    status: TRANSACTION_STATUSES.COMPLETED,
  }).catch(() => null);

  if (bonusTx?.id) {
    addInvoiceEmailJob({ userId: targetUserId, transactionId: bonusTx.id }).catch(() => {});
  }

  return sanitizeSubscription(updatedSub);
};

/**
 * Get paginated user billing & subscription transaction history
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query pagination & sorting parameters
 * @returns {Promise<Object>} Paginated transaction history
 */
export const getBillingHistory = async (userId, queryParams = {}) => {
  const pagination = parsePaginationParams(queryParams);
  let { items, totalCount } = await findPaginatedUserTransactions(userId, pagination);

  // Auto-backfill initial transaction log for pre-existing active users
  if (totalCount === 0) {
    const sub = await findByUserId(userId);
    if (sub && (sub.totalPostsAllowed > 0 || sub.bonusPostsAllowed > 0 || sub.paymentGateway)) {
      const initTx = await createTransaction({
        userId,
        plan: sub.plan || BILLING_PLANS.FREE,
        transactionType:
          sub.paymentGateway === PAYMENT_GATEWAYS.ADMIN_BONUS
            ? TRANSACTION_TYPES.ADMIN_BONUS
            : sub.plan === BILLING_PLANS.PRO
            ? TRANSACTION_TYPES.PLAN_PURCHASE
            : TRANSACTION_TYPES.PLAN_ACTIVATION,
        paymentGateway: sub.paymentGateway || PAYMENT_GATEWAYS.FREE,
        pricePaid: sub.pricePaid || 0,
        currency: sub.currency || BILLING_CURRENCIES.INR,
        postCount: sub.totalPostsAllowed > 0 ? sub.totalPostsAllowed : (sub.bonusPostsAllowed || 5),
        paymentId: sub.paymentId || null,
        orderId: sub.orderId || null,
        status: TRANSACTION_STATUSES.COMPLETED,
        createdAt: sub.createdAt || new Date(),
      });
      items = [initTx];
      totalCount = 1;
    }
  }

  const sanitizedItems = sanitizeTransactions(items);

  const paginatedResponse = buildPaginatedResponse({
    items: sanitizedItems,
    totalCount,
    page: pagination.page,
    limit: pagination.limit,
  });

  return paginatedResponse;
};

/**
 * Generate PDF Invoice Buffer for a billing transaction
 *
 * @param {string} userId - Requesting user ID
 * @param {string} transactionId - Transaction ID
 * @param {string} [requesterRole='END_USER'] - Requesting role
 * @returns {Promise<Object>} Invoice PDF buffer and filename
 */
export const generateInvoicePdf = async (userId, transactionId, requesterRole = 'END_USER') => {
  const tx = await findTransactionById(transactionId);
  if (!tx) {
    throw new NotFoundError('Billing transaction record not found.');
  }

  // Access control: User can only download their own invoice unless Admin
  if (
    tx.userId !== userId &&
    requesterRole !== 'ADMIN' &&
    requesterRole !== 'SUPER_ADMIN' &&
    requesterRole !== 'SUB_ADMIN'
  ) {
    throw new UnauthorizedError('Unauthorized access to invoice document.');
  }

  const pdfBuffer = await buildInvoicePdfBuffer(tx, tx.user, tx.user?.brandKit || {});
  return {
    pdfBuffer,
    fileName: `BrandFlow_Invoice_${tx.id.substring(0, 8)}.pdf`,
    transaction: sanitizeTransaction(tx),
  };
};

/**
 * Billing Logic singleton for backward-compatible consumption
 */
export const billingLogic = {
  getSubscriptionStatus,
  activateFreePlan,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  verifyStripePayment,
  topUpUserQuota,
  getBillingHistory,
  generateInvoicePdf,
};
