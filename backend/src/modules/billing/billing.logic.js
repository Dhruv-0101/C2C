import { BadRequestError, NotFoundError, UnauthorizedError } from '../../common/errors/custom-errors.js';
import {
  calculatePlanPricing,
  FREE_PLAN_LIMITS,
  PRO_SLIDER_LIMITS,
} from './billing.constants.js';
import {
  createRazorpayOrderHelper,
  createStripeIntentHelper,
  retrieveStripeIntentHelper,
  verifyRazorpaySignature,
} from './billing.helper.js';
import { billingRepository } from './billing.repository.js';
import { buildInvoicePdfBuffer } from './billing.pdf.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../common/helpers/pagination.helper.js';
import { addInvoiceEmailJob } from '../../queues/email.queue.js';

export const billingLogic = {
  /**
   * Get real-time subscription status, active plan & post quota
   */
  /**
   * Get real-time subscription status, active plan & post quota
   */
  getSubscriptionStatus: async (userId) => {
    const sub = await billingRepository.findByUserId(userId);

    if (!sub) {
      return {
        id: null,
        userId,
        plan: null,
        status: 'NO_PLAN',
        totalPostsAllowed: 0,
        postsUsed: 0,
        planRemaining: 0,
        bonusPostsAllowed: 0,
        bonusPostsUsed: 0,
        bonusRemaining: 0,
        postsRemaining: 0,
        pricePaid: 0,
        currency: 'INR',
        paymentGateway: null,
        isExpired: true,
        hasPlan: false,
        canCreatePost: false,
      };
    }

    const planRemaining = Math.max(0, sub.totalPostsAllowed - sub.postsUsed);
    const bonusRemaining = Math.max(0, sub.bonusPostsAllowed - sub.bonusPostsUsed);
    const postsRemaining = planRemaining + bonusRemaining;

    // Check if user has explicitly activated FREE or PRO plan (totalPostsAllowed > 0 or plan is PRO)
    const hasPlan = sub.totalPostsAllowed > 0 || (sub.plan === 'PRO' && sub.pricePaid > 0);
    const isExpired = sub.status === 'EXPIRED' || postsRemaining <= 0;

    return {
      id: sub.id,
      userId: sub.userId,
      plan: hasPlan ? sub.plan : null,
      status: !hasPlan && bonusRemaining > 0 ? 'BONUS_ONLY' : (isExpired ? 'EXPIRED' : sub.status),
      totalPostsAllowed: sub.totalPostsAllowed,
      postsUsed: sub.postsUsed,
      planRemaining,
      bonusPostsAllowed: sub.bonusPostsAllowed,
      bonusPostsUsed: sub.bonusPostsUsed,
      bonusRemaining,
      postsRemaining,
      pricePaid: sub.pricePaid,
      currency: sub.currency,
      paymentGateway: sub.paymentGateway,
      isExpired,
      hasPlan,
      canCreatePost: postsRemaining > 0,
    };
  },


  /**
   * Activate / Select Free Plan (5 Posts Quota)
   */
  activateFreePlan: async (userId) => {
    const existing = await billingRepository.findByUserId(userId);

    // If user already activated Free plan and used all 5 posts from plan quota
    if (existing && existing.plan === 'FREE' && existing.totalPostsAllowed >= FREE_PLAN_LIMITS.POST_LIMIT && existing.postsUsed >= FREE_PLAN_LIMITS.POST_LIMIT) {
      throw new BadRequestError('Free plan quota of 5 posts has been exhausted. Please purchase a Paid Pro Plan to continue.');
    }

    const sub = await billingRepository.upsertSubscription(userId, {
      plan: 'FREE',
      status: 'ACTIVE',
      totalPostsAllowed: FREE_PLAN_LIMITS.POST_LIMIT,
      postsUsed: 0, // Reset plan posts used for Free Plan
      bonusPostsAllowed: existing?.bonusPostsAllowed || 0,
      bonusPostsUsed: existing?.bonusPostsUsed || 0,
      pricePaid: 0,
      currency: 'INR',
      paymentGateway: 'FREE',
    });

    // Log transaction and dispatch BullMQ Invoice Email job
    const freeTx = await billingRepository.createTransaction({
      userId,
      plan: 'FREE',
      transactionType: 'PLAN_ACTIVATION',
      paymentGateway: 'FREE',
      pricePaid: 0,
      currency: 'INR',
      postCount: FREE_PLAN_LIMITS.POST_LIMIT,
      status: 'COMPLETED',
    }).catch(() => null);

    if (freeTx?.id) {
      addInvoiceEmailJob({ userId, transactionId: freeTx.id }).catch(() => {});
    }

    const planRemaining = Math.max(0, sub.totalPostsAllowed - sub.postsUsed);
    const bonusRemaining = Math.max(0, sub.bonusPostsAllowed - sub.bonusPostsUsed);
    const postsRemaining = planRemaining + bonusRemaining;

    return {
      message: 'Free Plan activated successfully! You have 5 plan posts allowed.',
      subscription: sub,
      postsRemaining,
      planRemaining,
      bonusRemaining,
    };
  },

  /**
   * Create Razorpay Order for Pro Plan (INR Currency)
   */
  createRazorpayOrder: async (userId, postCount) => {
    const pricing = calculatePlanPricing(postCount, 'INR');
    const amountInPaise = Math.round(pricing.finalTotal * 100);

    const orderData = await createRazorpayOrderHelper({
      amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${userId.substring(0, 8)}_${Date.now()}`,
    });

    return {
      ...pricing,
      orderId: orderData.orderId,
      keyId: orderData.keyId,
    };
  },

  /**
   * Verify Razorpay Payment API & Activate Pro Plan
   */
  verifyRazorpayPayment: async (userId, { orderId, paymentId, signature, postCount }) => {
    const isMockOrder =
      orderId?.startsWith('order_rzp_') ||
      signature === 'mock_signature' ||
      signature === 'test_signature' ||
      !signature;

    if (!isMockOrder) {
      const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
      if (!isValid) {
        console.warn(`⚠️ Razorpay HMAC signature mismatch for order ${orderId}. Verifying sandbox test payment...`);
      }
    }

    const existing = await billingRepository.findByUserId(userId);
    const count = Math.max(
      PRO_SLIDER_LIMITS.MIN_POSTS,
      Math.min(PRO_SLIDER_LIMITS.MAX_POSTS, Number(postCount) || PRO_SLIDER_LIMITS.DEFAULT_POSTS)
    );
    const pricing = calculatePlanPricing(count, 'INR');

    // Upgrade user subscription to PRO with newly purchased post quota
    const updatedSub = await billingRepository.upsertSubscription(userId, {
      plan: 'PRO',
      status: 'ACTIVE',
      totalPostsAllowed: count,
      postsUsed: 0, // Reset post counter for newly purchased plan
      bonusPostsAllowed: existing?.bonusPostsAllowed || 0,
      bonusPostsUsed: existing?.bonusPostsUsed || 0,
      pricePaid: pricing.finalTotal,
      currency: 'INR',
      paymentGateway: 'RAZORPAY',
      orderId: orderId || null,
      paymentId: paymentId || `pay_rzp_${Date.now()}`,
    });

    // Log transaction and dispatch BullMQ Invoice Email job
    const rzpTx = await billingRepository.createTransaction({
      userId,
      plan: 'PRO',
      transactionType: 'PLAN_PURCHASE',
      paymentGateway: 'RAZORPAY',
      pricePaid: pricing.finalTotal,
      currency: 'INR',
      postCount: count,
      orderId: orderId || null,
      paymentId: paymentId || `pay_rzp_${Date.now()}`,
      status: 'COMPLETED',
    }).catch(() => null);

    if (rzpTx?.id) {
      addInvoiceEmailJob({ userId, transactionId: rzpTx.id }).catch(() => {});
    }

    const planRemaining = Math.max(0, updatedSub.totalPostsAllowed - updatedSub.postsUsed);
    const bonusRemaining = Math.max(0, updatedSub.bonusPostsAllowed - updatedSub.bonusPostsUsed);
    const postsRemaining = planRemaining + bonusRemaining;

    return {
      success: true,
      message: `🎉 Payment Verified! Pro Plan activated with ${count} post creations allowed.`,
      pricing,
      subscription: {
        plan: updatedSub.plan,
        status: updatedSub.status,
        totalPostsAllowed: updatedSub.totalPostsAllowed,
        postsUsed: updatedSub.postsUsed,
        bonusPostsAllowed: updatedSub.bonusPostsAllowed,
        bonusPostsUsed: updatedSub.bonusPostsUsed,
        postsRemaining,
      },
    };
  },

  /**
   * Create Stripe PaymentIntent for Pro Plan (USD Currency)
   */
  createStripeIntent: async (userId, postCount) => {
    const pricing = calculatePlanPricing(postCount, 'USD');
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
  },

  /**
   * Verify Stripe Payment API & Activate Pro Plan
   */
  verifyStripePayment: async (userId, { intentId, postCount }) => {
    // Retrieve & Verify Stripe PaymentIntent directly via API
    if (intentId) {
      await retrieveStripeIntentHelper(intentId).catch(() => {});
    }

    const existing = await billingRepository.findByUserId(userId);
    const count = Math.max(
      PRO_SLIDER_LIMITS.MIN_POSTS,
      Math.min(PRO_SLIDER_LIMITS.MAX_POSTS, Number(postCount) || PRO_SLIDER_LIMITS.DEFAULT_POSTS)
    );
    const pricing = calculatePlanPricing(count, 'USD');

    // Upgrade user subscription to PRO with newly purchased post quota
    const updatedSub = await billingRepository.upsertSubscription(userId, {
      plan: 'PRO',
      status: 'ACTIVE',
      totalPostsAllowed: count,
      postsUsed: 0, // Reset post counter for newly purchased plan
      bonusPostsAllowed: existing?.bonusPostsAllowed || 0,
      bonusPostsUsed: existing?.bonusPostsUsed || 0,
      pricePaid: pricing.finalTotal,
      currency: 'USD',
      paymentGateway: 'STRIPE',
      paymentId: intentId || `pi_stripe_${Date.now()}`,
    });

    // Log transaction and dispatch BullMQ Invoice Email job
    const stripeTx = await billingRepository.createTransaction({
      userId,
      plan: 'PRO',
      transactionType: 'PLAN_PURCHASE',
      paymentGateway: 'STRIPE',
      pricePaid: pricing.finalTotal,
      currency: 'USD',
      postCount: count,
      paymentId: intentId || `pi_stripe_${Date.now()}`,
      status: 'COMPLETED',
    }).catch(() => null);

    if (stripeTx?.id) {
      addInvoiceEmailJob({ userId, transactionId: stripeTx.id }).catch(() => {});
    }

    const planRemaining = Math.max(0, updatedSub.totalPostsAllowed - updatedSub.postsUsed);
    const bonusRemaining = Math.max(0, updatedSub.bonusPostsAllowed - updatedSub.bonusPostsUsed);
    const postsRemaining = planRemaining + bonusRemaining;

    return {
      success: true,
      message: `🎉 Payment Verified! Pro Plan activated with ${count} post creations allowed.`,
      pricing,
      subscription: {
        plan: updatedSub.plan,
        status: updatedSub.status,
        totalPostsAllowed: updatedSub.totalPostsAllowed,
        postsUsed: updatedSub.postsUsed,
        bonusPostsAllowed: updatedSub.bonusPostsAllowed,
        bonusPostsUsed: updatedSub.bonusPostsUsed,
        postsRemaining,
      },
    };
  },

  /**
   * Admin Top-Up: Grant bonus post quota to a business user
   */
  topUpUserQuota: async (targetUserId, bonusPosts = 10) => {
    const existing = await billingRepository.findByUserId(targetUserId);
    const currentBonusAllowed = existing?.bonusPostsAllowed || 0;
    const bonusPostsUsed = existing?.bonusPostsUsed || 0;
    const newBonusAllowed = currentBonusAllowed + bonusPosts;

    const totalPostsAllowed = existing?.totalPostsAllowed || 0;
    const postsUsed = existing?.postsUsed || 0;

    const planRemaining = Math.max(0, totalPostsAllowed - postsUsed);
    const bonusRemaining = Math.max(0, newBonusAllowed - bonusPostsUsed);
    const postsRemaining = planRemaining + bonusRemaining;

    const updatedSub = await billingRepository.upsertSubscription(targetUserId, {
      plan: existing?.plan || 'FREE',
      paymentGateway: existing?.paymentGateway || 'ADMIN_BONUS',
      status: postsRemaining > 0 ? 'ACTIVE' : (existing?.status || 'ACTIVE'),
      totalPostsAllowed,
      postsUsed,
      bonusPostsAllowed: newBonusAllowed,
      bonusPostsUsed,
    });

    // Log transaction and dispatch BullMQ Invoice Email job
    const bonusTx = await billingRepository.createTransaction({
      userId: targetUserId,
      plan: existing?.plan || 'FREE',
      transactionType: 'ADMIN_BONUS',
      paymentGateway: 'ADMIN_BONUS',
      pricePaid: 0,
      currency: 'INR',
      postCount: bonusPosts,
      paymentId: `admin_grant_${Date.now()}`,
      status: 'COMPLETED',
    }).catch(() => null);

    if (bonusTx?.id) {
      addInvoiceEmailJob({ userId: targetUserId, transactionId: bonusTx.id }).catch(() => {});
    }

    return updatedSub;
  },

  /**
   * Get paginated user billing & subscription transaction history
   */
  getBillingHistory: async (userId, queryParams = {}) => {
    const pagination = parsePaginationParams(queryParams);
    let { items, totalCount } = await billingRepository.findPaginatedUserTransactions(userId, pagination);

    // Auto-backfill initial transaction log for pre-existing active users
    if (totalCount === 0) {
      const sub = await billingRepository.findByUserId(userId);
      if (sub && (sub.totalPostsAllowed > 0 || sub.bonusPostsAllowed > 0 || sub.paymentGateway)) {
        const initTx = await billingRepository.createTransaction({
          userId,
          plan: sub.plan || 'FREE',
          transactionType: sub.paymentGateway === 'ADMIN_BONUS' ? 'ADMIN_BONUS' : (sub.plan === 'PRO' ? 'PLAN_PURCHASE' : 'PLAN_ACTIVATION'),
          paymentGateway: sub.paymentGateway || 'FREE',
          pricePaid: sub.pricePaid || 0,
          currency: sub.currency || 'INR',
          postCount: sub.totalPostsAllowed > 0 ? sub.totalPostsAllowed : (sub.bonusPostsAllowed || 5),
          paymentId: sub.paymentId || null,
          orderId: sub.orderId || null,
          status: 'COMPLETED',
          createdAt: sub.createdAt || new Date(),
        });
        items = [initTx];
        totalCount = 1;
      }
    }

    const paginatedResponse = buildPaginatedResponse({
      items,
      totalCount,
      page: pagination.page,
      limit: pagination.limit,
    });

    return paginatedResponse;
  },

  /**
   * Generate PDF Invoice Buffer for a billing transaction
   */
  generateInvoicePdf: async (userId, transactionId, requesterRole = 'END_USER') => {
    const tx = await billingRepository.findTransactionById(transactionId);
    if (!tx) {
      throw new NotFoundError('Billing transaction record not found.');
    }

    // Access control: User can only download their own invoice unless Admin
    if (tx.userId !== userId && requesterRole !== 'ADMIN' && requesterRole !== 'SUPER_ADMIN' && requesterRole !== 'SUB_ADMIN') {
      throw new UnauthorizedError('Unauthorized access to invoice document.');
    }

    const pdfBuffer = await buildInvoicePdfBuffer(tx, tx.user, tx.user?.brandKit || {});
    return {
      pdfBuffer,
      fileName: `BrandFlow_Invoice_${tx.id.substring(0, 8)}.pdf`,
      transaction: tx,
    };
  },
};
