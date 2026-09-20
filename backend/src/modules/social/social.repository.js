import { prisma } from '../../config/database.js';
import {
  DEFAULT_SOCIAL_SORT_BY,
  DEFAULT_SOCIAL_SORT_ORDER,
  SOCIAL_ALLOWED_SORT_FIELDS,
} from './social.constants.js';

/**
 * Find social account by User ID and Platform
 *
 * @param {string} userId - User ID
 * @param {string} platform - Social platform (INSTAGRAM, FACEBOOK, LINKEDIN)
 * @returns {Promise<Object|null>}
 */
export const findByUserAndPlatform = async (userId, platform) => {
  return prisma.socialAccount.findUnique({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
  });
};

/**
 * Find all active connected social accounts for user with pagination
 *
 * @param {string} userId - User ID
 * @param {Object} [options={}] - Pagination & sorting options
 * @param {number} [options.skip=0] - Records to skip
 * @param {number} [options.take=10] - Records to take
 * @param {string} [options.sortBy='createdAt'] - Sort field
 * @param {string} [options.sortOrder='desc'] - Sort direction
 * @returns {Promise<{ accounts: Array, totalCount: number }>}
 */
export const findPaginatedByUserId = async (
  userId,
  {
    skip = 0,
    take = 10,
    sortBy = DEFAULT_SOCIAL_SORT_BY,
    sortOrder = DEFAULT_SOCIAL_SORT_ORDER,
  } = {}
) => {
  const where = { userId };
  const safeSortBy = SOCIAL_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_SOCIAL_SORT_BY;
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const [accounts, totalCount] = await Promise.all([
    prisma.socialAccount.findMany({
      where,
      skip,
      take,
      orderBy: { [safeSortBy]: safeSortOrder },
    }),
    prisma.socialAccount.count({ where }),
  ]);

  return { accounts, totalCount };
};

/**
 * Find all active connected social accounts for user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export const findAllByUserId = async (userId) => {
  return prisma.socialAccount.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Upsert (create or update) user social account connection
 *
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.platform - Platform name
 * @param {string} params.platformUserId - Platform user or page ID
 * @param {string} params.accountName - Display account handle
 * @param {string} params.accessToken - Encrypted access token
 * @param {string} [params.refreshToken] - Optional encrypted refresh token
 * @param {Date} [params.tokenExpiresAt] - Optional token expiry
 * @returns {Promise<Object>}
 */
export const upsertAccount = async ({
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
};

/**
 * Disconnect social account (mark isConnected false or remove record)
 *
 * @param {string} userId - User ID
 * @param {string} platform - Platform name
 * @returns {Promise<Object>}
 */
export const deleteAccount = async (userId, platform) => {
  return prisma.socialAccount.deleteMany({
    where: {
      userId,
      platform,
    },
  });
};

/**
 * Social Repository singleton for backward-compatible consumption
 */
export const socialRepository = {
  findByUserAndPlatform,
  findPaginatedByUserId,
  findAllByUserId,
  upsertAccount,
  deleteAccount,
};