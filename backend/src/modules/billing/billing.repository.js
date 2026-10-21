import { prisma } from '../../config/database.js';
import {
  DEFAULT_BILLING_SORT_BY,
  DEFAULT_BILLING_SORT_ORDER,
  BILLING_ALLOWED_SORT_FIELDS,
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
};

