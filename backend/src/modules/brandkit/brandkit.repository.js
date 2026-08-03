import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const brandKitRepository = {
  /**
   * Find user's BrandKit by userId
   */
  findByUserId: async (userId) => {
    return prisma.brandKit.findUnique({
      where: { userId },
      include: {
        category: true,
      },
    });
  },

  /**
   * Upsert user's BrandKit by userId
   */
  upsertByUserId: async (userId, data) => {
    return prisma.brandKit.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: {
        ...data,
      },
      include: {
        category: true,
      },
    });
  },
};
