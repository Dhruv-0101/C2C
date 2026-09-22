import { prisma } from '../../config/database.js';
import {
  DEFAULT_VAULT_SORT_BY,
  DEFAULT_VAULT_SORT_ORDER,
  VAULT_ALLOWED_SORT_FIELDS,
} from './vault.constants.js';

/**
 * 🗄️ VAULT REPOSITORY (Database Access Layer)
 * Strictly encapsulates all database queries and Prisma ORM operations for VaultItem entities.
 * Follows Clean Architecture: zero HTTP or presentation logic exists in this layer.
 */

export const VAULT_INCLUDE = Object.freeze({
  post: {
    include: {
      template: true,
      festival: true,
      category: true,
      frame: true,
      captions: true,
    },
  },
});

/**
 * Create a new VaultItem record
 * @param {Object} data - Creation payload ({ userId, postId })
 * @param {Object} [txPrisma=prisma] - Optional transaction client
 * @returns {Promise<Object>}
 */
export async function create(data, txPrisma = prisma) {
  return txPrisma.vaultItem.create({
    data,
    include: VAULT_INCLUDE,
  });
}

/**
 * Find all vault items belonging to a user with pagination, search, and sorting
 * @param {string} userId - User identifier
 * @param {Object} options - Query pagination and filter options
 * @returns {Promise<{ vaultItems: Array<Object>, totalCount: number }>}
 */
export async function findPaginatedByUserId(
  userId,
  {
    skip = 0,
    take = 8,
    search = '',
    sortBy = DEFAULT_VAULT_SORT_BY,
    sortOrder = DEFAULT_VAULT_SORT_ORDER,
  } = {}
) {
  const where = { userId };

  const safeSkip = typeof skip === 'number' && !isNaN(skip) && skip >= 0 ? skip : 0;
  const safeTake = typeof take === 'number' && !isNaN(take) && take > 0 ? take : 8;
  const safeSortBy = VAULT_ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_VAULT_SORT_BY;
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : DEFAULT_VAULT_SORT_ORDER;

  if (search && search.trim()) {
    const searchPattern = search.trim();
    where.post = {
      OR: [
        { occasionName: { contains: searchPattern, mode: 'insensitive' } },
        { template: { title: { contains: searchPattern, mode: 'insensitive' } } },
        { festival: { name: { contains: searchPattern, mode: 'insensitive' } } },
        { category: { name: { contains: searchPattern, mode: 'insensitive' } } },
        { captions: { some: { captionText: { contains: searchPattern, mode: 'insensitive' } } } },
      ],
    };
  }

  const [vaultItems, totalCount] = await prisma.$transaction([
    prisma.vaultItem.findMany({
      where,
      skip: safeSkip,
      take: safeTake,
      include: VAULT_INCLUDE,
      orderBy: { [safeSortBy]: safeSortOrder },
    }),
    prisma.vaultItem.count({ where }),
  ]);

  return { vaultItems, totalCount };
}

/**
 * Find single vault item by ID and User ID
 * @param {string} id - VaultItem UUID
 * @param {string} userId - User identifier
 * @returns {Promise<Object|null>}
 */
export async function findById(id, userId) {
  return prisma.vaultItem.findFirst({
    where: { id, userId },
    include: VAULT_INCLUDE,
  });
}

/**
 * Update vault item details (updates related Post occasionName)
 * @param {string} id - VaultItem UUID
 * @param {string} userId - User identifier
 * @param {Object} data - Update payload
 * @returns {Promise<Object|null>}
 */
export async function update(id, userId, data) {
  const item = await prisma.vaultItem.findFirst({
    where: { id, userId },
    select: { postId: true },
  });

  if (item?.postId && data.occasionName) {
    await prisma.post.update({
      where: { id: item.postId },
      data: { occasionName: data.occasionName },
    });
  }

  return item;
}

/**
 * Delete vault item by ID and User ID
 * @param {string} id - VaultItem UUID
 * @param {string} userId - User identifier
 * @returns {Promise<{ count: number }>}
 */
export async function deleteVaultItem(id, userId) {
  return prisma.vaultItem.deleteMany({
    where: { id, userId },
  });
}

/**
 * Bulk delete vault items by IDs and User ID
 * @param {Array<string>} ids - Array of VaultItem UUIDs
 * @param {string} userId - User identifier
 * @returns {Promise<{ count: number }>}
 */
export async function deleteManyByIds(ids, userId) {
  return prisma.vaultItem.deleteMany({
    where: {
      id: { in: ids },
      userId,
    },
  });
}

// Backwards-compatible object export
export const vaultRepository = {
  create,
  findPaginatedByUserId,
  findById,
  update,
  delete: deleteVaultItem,
  deleteVaultItem,
  deleteManyByIds,
};
