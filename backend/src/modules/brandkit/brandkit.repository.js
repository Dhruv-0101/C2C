import { prisma } from '../../config/database.js';

const CATEGORY_SELECT = Object.freeze({
  id: true,
  name: true,
  slug: true,
});

/**
 * Find user's BrandKit by userId with whitelisted category relation
 * @param {string} userId - User primary key UUID
 * @returns {Promise<Object|null>}
 */
export async function findBrandKitByUserId(userId) {
  return prisma.brandKit.findUnique({
    where: { userId },
    include: {
      category: {
        select: CATEGORY_SELECT,
      },
    },
  });
}

/**
 * Upsert user's BrandKit by userId
 * @param {string} userId - User primary key UUID
 * @param {Object} data - BrandKit data to insert/update
 * @returns {Promise<Object>}
 */
export async function upsertBrandKitByUserId(userId, data) {
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
      category: {
        select: CATEGORY_SELECT,
      },
    },
  });
}
