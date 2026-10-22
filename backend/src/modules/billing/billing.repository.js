import { prisma } from '../../config/database.js';
import { BadRequestError } from '../../common/errors/custom-errors.js';
import {
  DEFAULT_BILLING_SORT_BY,
  DEFAULT_BILLING_SORT_ORDER,
  BILLING_ALLOWED_SORT_FIELDS,
  BILLING_PLANS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  PAYMENT_GATEWAYS,
  FREE_PLAN_LIMITS,
  SUBSCRIPTION_STATUSES,
} from './billing.constants.js';

/**
 * Find user subscription by userId
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Subscription record
 */
export const findByUserId = async (userId) => {
  return prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
  });
};

/**
 * Create or update user subscription
 *
 * @param {string} userId - User ID
 * @param {Object} data - Subscription attributes
 * @returns {Promise<Object>} Upserted subscription
 */
export const upsertSubscription = async (userId, data) => {
  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: {
      ...data,
    },
  });
};

/**
 * Increment postsUsed or bonusPostsUsed by 1 for user subscription
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Updated subscription or null
 */
export const incrementPostsUsed = async (userId) => {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;

  const planRemaining = Math.max(0, sub.totalPostsAllowed - sub.postsUsed);
  const bonusRemaining = Math.max(0, sub.bonusPostsAllowed - sub.bonusPostsUsed);

  let updateData = {};

  if (planRemaining > 0) {
    const newPostsUsed = sub.postsUsed + 1;
    const newPlanRemaining = sub.totalPostsAllowed - newPostsUsed;
    const isDepleted = newPlanRemaining <= 0 && bonusRemaining <= 0;
    updateData = {
      postsUsed: newPostsUsed,
      status: isDepleted ? 'EXPIRED' : sub.status,
    };
  } else if (bonusRemaining > 0) {
    const newBonusUsed = sub.bonusPostsUsed + 1;
    const newBonusRemaining = sub.bonusPostsAllowed - newBonusUsed;
    const isDepleted = planRemaining <= 0 && newBonusRemaining <= 0;
    updateData = {
      bonusPostsUsed: newBonusUsed,
      status: isDepleted ? 'EXPIRED' : sub.status,
    };
  } else {
    updateData = {
      status: 'EXPIRED',
    };
  }

  return prisma.subscription.update({
    where: { userId },
    data: updateData,
  });
};

/**
 * Log a new billing / subscription transaction record
 *
 * @param {Object} data - Transaction attributes
 * @returns {Promise<Object>} Created billing transaction
 */
export const createTransaction = async (data) => {
  return prisma.billingTransaction.create({
    data,
  });
};

/**
 * Find paginated billing transactions for a specific user
 *
 * @param {string} userId - User ID
 * @param {Object} options
 * @param {number} [options.skip=0]
 * @param {number} [options.take=10]
 * @param {string} [options.sortBy='createdAt']
 * @param {string} [options.sortOrder='desc']
 * @returns {Promise<{ items: Array, totalCount: number }>}
 */
export const findPaginatedUserTransactions = async (
  userId,
  {
    skip = 0,
    take = 10,
    sortBy = DEFAULT_BILLING_SORT_BY,
    sortOrder = DEFAULT_BILLING_SORT_ORDER,
  } = {}
) => {
  const where = { userId };
  const safeSortBy = BILLING_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_BILLING_SORT_BY;
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const [items, totalCount] = await prisma.$transaction([
    prisma.billingTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { [safeSortBy]: safeSortOrder },
    }),
    prisma.billingTransaction.count({ where }),
  ]);

  return { items, totalCount };
};

/**
 * Find a specific billing transaction by ID including user and brandKit details
 *
 * @param {string} id - Transaction ID
 * @returns {Promise<Object|null>} Billing transaction
 */
export const findTransactionById = async (id) => {
  return prisma.billingTransaction.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          brandKit: {
            select: {
              businessName: true,
              city: true,
              country: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Find a transaction by gateway paymentId (for replay / double-spend detection)
 *
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object|null>} Billing transaction
 */
export const findTransactionByPaymentId = async (paymentId) => {
  if (!paymentId) return null;
  return prisma.billingTransaction.findFirst({
    where: { paymentId },
  });
};

/**
 * Find a transaction by gateway orderId (for order replay detection)
 *
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} Billing transaction
 */
export const findTransactionByOrderId = async (orderId) => {
  if (!orderId) return null;
  return prisma.billingTransaction.findFirst({
    where: { orderId },
  });
};

/**
 * Atomically checks and decrements 1 post credit from the user's active subscription.
 * Handles plan posts first, then bonus posts, with row-level transaction safety.
 *
 * @param {string} userId - User ID
 * @returns {Promise<{ success: boolean, reason?: string, subscription?: Object }>}
 */
export const deductPostCreditAtomic = async (userId) => {
  return prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      return { success: false, reason: 'NO_SUBSCRIPTION' };
    }

    const planRemaining = Math.max(0, sub.totalPostsAllowed - sub.postsUsed);
    const bonusRemaining = Math.max(0, sub.bonusPostsAllowed - sub.bonusPostsUsed);
    const totalRemaining = planRemaining + bonusRemaining;

    if (totalRemaining <= 0 || sub.status === 'EXPIRED') {
      return { success: false, reason: 'QUOTA_EXHAUSTED', sub };
    }

    let updateData = {};
    if (planRemaining > 0) {
      const newPostsUsed = sub.postsUsed + 1;
      const isDepleted = sub.totalPostsAllowed - newPostsUsed <= 0 && bonusRemaining <= 0;
      updateData = {
        postsUsed: newPostsUsed,
        status: isDepleted ? 'EXPIRED' : sub.status,
      };
    } else {
      const newBonusUsed = sub.bonusPostsUsed + 1;
      const isDepleted = sub.bonusPostsAllowed - newBonusUsed <= 0;
      updateData = {
        bonusPostsUsed: newBonusUsed,
        status: isDepleted ? 'EXPIRED' : sub.status,
      };
    }

    const updatedSub = await tx.subscription.update({
      where: { userId },
      data: updateData,
    });

    return { success: true, subscription: updatedSub };
  });
};

/**
 * Compensating transaction: refunds 1 post credit if post creation/upload fails
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const refundPostCreditAtomic = async (userId) => {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return null;

  if (sub.postsUsed > 0) {
    return prisma.subscription.update({
      where: { userId },
      data: {
        postsUsed: Math.max(0, sub.postsUsed - 1),
        status: 'ACTIVE',
      },
    }).catch(() => null);
  } else if (sub.bonusPostsUsed > 0) {
    return prisma.subscription.update({
      where: { userId },
      data: {
        bonusPostsUsed: Math.max(0, sub.bonusPostsUsed - 1),
        status: 'ACTIVE',
      },
    }).catch(() => null);
  }
  return null;
};

/**
 * Check if a user has ever claimed the Free Starter Plan or holds prior subscription history
 * Checks the immutable BillingTransaction ledger and existing Subscription records
 *
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has ever claimed free plan or holds/held a plan
 */
export const hasUserEverClaimedFreePlan = async (userId) => {
  const [freeTx, paidTx, sub] = await Promise.all([
    prisma.billingTransaction.findFirst({
      where: {
        userId,
        status: TRANSACTION_STATUSES.COMPLETED,
        OR: [
          { plan: BILLING_PLANS.FREE },
          { paymentGateway: PAYMENT_GATEWAYS.FREE },
        ],
      },
      select: { id: true },
    }),
    prisma.billingTransaction.findFirst({
      where: {
        userId,
        status: TRANSACTION_STATUSES.COMPLETED,
        OR: [
          { plan: BILLING_PLANS.PRO },
          { paymentGateway: { in: [PAYMENT_GATEWAYS.RAZORPAY, PAYMENT_GATEWAYS.STRIPE] } },
        ],
      },
      select: { id: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { id: true, plan: true, totalPostsAllowed: true },
    }),
  ]);

  if (freeTx || paidTx) return true;
  if (sub && (sub.plan === BILLING_PLANS.FREE || sub.plan === BILLING_PLANS.PRO || sub.totalPostsAllowed > 0)) {
    return true;
  }

  return false;
};

/**
 * Atomically activate the Free Starter Plan with strict 1-time enforcement.
 * Guaranteed zero double-claiming:
 * - Checks immutable BillingTransaction ledger inside transaction
 * - Checks existing Subscription record inside transaction
 * - Upserts subscription and logs completed transaction in a single atomic transaction
 *
 * @param {string} userId - User ID
 * @returns {Promise<{ sub: Object, freeTx: Object }>}
 */
export const executeFreePlanActivation = async (userId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Immutable audit ledger check for ANY completed FREE or PAID transactions
    const [priorFreeTx, priorPaidTx] = await Promise.all([
      tx.billingTransaction.findFirst({
        where: {
          userId,
          status: TRANSACTION_STATUSES.COMPLETED,
          OR: [
            { plan: BILLING_PLANS.FREE },
            { paymentGateway: PAYMENT_GATEWAYS.FREE },
          ],
        },
        select: { id: true, createdAt: true },
      }),
      tx.billingTransaction.findFirst({
        where: {
          userId,
          status: TRANSACTION_STATUSES.COMPLETED,
          OR: [
            { plan: BILLING_PLANS.PRO },
            { paymentGateway: { in: [PAYMENT_GATEWAYS.RAZORPAY, PAYMENT_GATEWAYS.STRIPE] } },
          ],
        },
        select: { id: true },
      }),
    ]);

    if (priorFreeTx) {
      throw new BadRequestError(
        'The Free Starter Plan has already been claimed for this account. Each user account is strictly eligible for only one free trial in its lifetime. Please upgrade to a Pro plan to continue creating posts.'
      );
    }

    if (priorPaidTx) {
      throw new BadRequestError(
        'You have previous Pro Plan purchase history on this account. The Free Starter Plan is only available once for new accounts. Please purchase a Pro pack to add post credits.'
      );
    }

    // 2. Check existing subscription record
    const existingSub = await tx.subscription.findUnique({
      where: { userId },
    });

    if (existingSub) {
      if (existingSub.plan === BILLING_PLANS.FREE || existingSub.totalPostsAllowed > 0) {
        throw new BadRequestError(
          'The Free Starter Plan has already been claimed for this account. Each user account is strictly eligible for only one free trial in its lifetime. Please upgrade to a Pro plan to continue creating posts.'
        );
      }
      if (existingSub.plan === BILLING_PLANS.PRO) {
        throw new BadRequestError(
          'You already have an active Pro Plan. Free plan activation is not available.'
        );
      }
    }

    // 3. Upsert subscription with Free Starter Plan (5 Posts)
    const sub = await tx.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: BILLING_PLANS.FREE,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        totalPostsAllowed: FREE_PLAN_LIMITS.POST_LIMIT,
        postsUsed: 0,
        bonusPostsAllowed: existingSub?.bonusPostsAllowed || 0,
        bonusPostsUsed: existingSub?.bonusPostsUsed || 0,
        pricePaid: 0,
        currency: 'INR',
        paymentGateway: PAYMENT_GATEWAYS.FREE,
      },
      update: {
        plan: BILLING_PLANS.FREE,
        status: SUBSCRIPTION_STATUSES.ACTIVE,
        totalPostsAllowed: FREE_PLAN_LIMITS.POST_LIMIT,
        postsUsed: 0,
        pricePaid: 0,
        currency: 'INR',
        paymentGateway: PAYMENT_GATEWAYS.FREE,
      },
    });

    // 4. Record immutable BillingTransaction log
    const timestamp = Date.now();
    const freeTx = await tx.billingTransaction.create({
      data: {
        userId,
        plan: BILLING_PLANS.FREE,
        transactionType: TRANSACTION_TYPES.PLAN_ACTIVATION,
        paymentGateway: PAYMENT_GATEWAYS.FREE,
        pricePaid: 0,
        currency: 'INR',
        postCount: FREE_PLAN_LIMITS.POST_LIMIT,
        orderId: `FREE_ORD_${timestamp}`,
        paymentId: `FREE_ACT_${timestamp}`,
        status: TRANSACTION_STATUSES.COMPLETED,
      },
    });

    return { sub, freeTx };
  });
};

/**
 * Billing Repository singleton for backward-compatible consumption
 */
export const billingRepository = {
  findByUserId,
  upsertSubscription,
  incrementPostsUsed,
  deductPostCreditAtomic,
  refundPostCreditAtomic,
  createTransaction,
  findPaginatedUserTransactions,
  findTransactionById,
  findTransactionByPaymentId,
  findTransactionByOrderId,
  hasUserEverClaimedFreePlan,
  executeFreePlanActivation,
};

