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
 * Billing Repository singleton for backward-compatible consumption
 */
export const billingRepository = {
  findByUserId,
  upsertSubscription,
  incrementPostsUsed,
  createTransaction,
  findPaginatedUserTransactions,
  findTransactionById,
};
