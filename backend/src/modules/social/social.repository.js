import { prisma } from '../../config/database.js';

export const socialRepository = {
  /**
   * Find social account by User ID and Platform
   */
  findByUserAndPlatform: async (userId, platform) => {
    return prisma.socialAccount.findUnique({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
    });
  },

  /**
   * Find all active connected social accounts for user
   */
  findAllByUserId: async (userId) => {
    return prisma.socialAccount.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Upsert (create or update) user social account connection
   */
  upsertAccount: async ({
    userId,
    platform,
    platformUserId,
    accountName,
    accessToken,
    refreshToken,
    tokenExpiresAt,
  }) => {
    return prisma.socialAccount.upsert({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      update: {
        platformUserId,
        accountName,
        accessToken,
        refreshToken: refreshToken || undefined,
        tokenExpiresAt: tokenExpiresAt || undefined,
        isConnected: true,
      },
      create: {
        userId,
        platform,
        platformUserId,
        accountName,
        accessToken,
        refreshToken: refreshToken || null,
        tokenExpiresAt: tokenExpiresAt || null,
        isConnected: true,
      },
    });
  },

  /**
   * Disconnect social account (mark isConnected false or remove record)
   */
  deleteAccount: async (userId, platform) => {
    return prisma.socialAccount.deleteMany({
      where: {
        userId,
        platform,
      },
    });
  },
};
//done