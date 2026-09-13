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
   * Increment postsUsed by 1 for user subscription
   */
  incrementPostsUsed: async (userId) => {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    if (!sub) return null;

    const newPostsUsed = sub.postsUsed + 1;
    const isQuotaReached = newPostsUsed >= sub.totalPostsAllowed;

    return prisma.subscription.update({
      where: { userId },
      data: {
        postsUsed: newPostsUsed,
        status: isQuotaReached ? 'EXPIRED' : sub.status,
      },
    });
  },
};
