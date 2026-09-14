import { prisma } from '../../config/database.js';

export const billingRepository = {
  /**
   * Find user subscription by userId
   */
  findByUserId: async (userId) => {
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
  },

  /**
   * Create or update user subscription
   */
  upsertSubscription: async (userId, data) => {
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
  },

  /**
   * Increment postsUsed or bonusPostsUsed by 1 for user subscription
   */
  incrementPostsUsed: async (userId) => {
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
  },

  /**
   * Log a new billing / subscription transaction record
   */
  createTransaction: async (data) => {
    return prisma.billingTransaction.create({
      data,
    });
  },

  /**
   * Find paginated billing transactions for a specific user
   */
  findPaginatedUserTransactions: async (userId, { skip, take }) => {
    const where = { userId };
    const [items, totalCount] = await prisma.$transaction([
      prisma.billingTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.billingTransaction.count({ where }),
    ]);

    return { items, totalCount };
  },

  /**
   * Find a specific billing transaction by ID including user and brandKit details
   */
  findTransactionById: async (id) => {
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
  },
};
