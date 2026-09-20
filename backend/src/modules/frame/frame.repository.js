import { prisma } from '../../config/database.js';
import {
  DEFAULT_FRAME_SORT_BY,
  DEFAULT_FRAME_SORT_ORDER,
  FRAME_ALLOWED_SORT_FIELDS,
} from './frame.constants.js';

/**
 * 🖼️ FRAME REPOSITORY (Database Access Layer)
 * Strictly encapsulates all Prisma ORM operations for Frame records.
 * Follows clean architecture: zero HTTP or business logic.
 */

const CREATOR_SELECT = Object.freeze({
  id: true,
  fullName: true,
  email: true,
  role: true,
});


/**
 * Find paginated frames with search and sort support
 * @param {Object} params
 * @param {number} params.skip - Offset
 * @param {number} params.take - Limit
 * @param {string} [params.search] - Search keyword
 * @param {string} [params.sortBy] - Sort field
 * @param {string} [params.sortOrder] - Sort direction ('asc' | 'desc')
 * @returns {Promise<{ frames: Array<Object>, totalCount: number }>}
 */
export async function findPaginatedFrames({
  skip,
  take,
  search,
  sortBy = DEFAULT_FRAME_SORT_BY,
  sortOrder = DEFAULT_FRAME_SORT_ORDER,
}) {
  const where = { isActive: true };

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const validSortBy = FRAME_ALLOWED_SORT_FIELDS.includes(sortBy)
    ? sortBy
    : DEFAULT_FRAME_SORT_BY;
  const validSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : DEFAULT_FRAME_SORT_ORDER;

  const [frames, totalCount] = await prisma.$transaction([
    prisma.frame.findMany({
      where,
      skip,
      take,
      include: {
        creator: {
          select: CREATOR_SELECT,
        },
      },
      orderBy: {
        [validSortBy]: validSortOrder,
      },
    }),
    prisma.frame.count({ where }),
  ]);

  return { frames, totalCount };
}

/**
 * Find frame by ID
 * @param {string} id - Frame UUID
 * @param {Object} [options]
 * @param {boolean} [options.includeInactive=false]
 * @returns {Promise<Object|null>}
 */
export async function findFrameById(id, { includeInactive = false } = {}) {
  const where = { id };
  if (!includeInactive) {
    where.isActive = true;
  }

  return prisma.frame.findFirst({
    where,
    include: {
      creator: {
        select: CREATOR_SELECT,
      },
    },
  });
}

/**
 * Create a new frame record
 * @param {Object} data - Frame creation data
 * @returns {Promise<Object>}
 */
export async function createFrame(data) {
  return prisma.frame.create({
    data,
    include: {
      creator: {
        select: CREATOR_SELECT,
      },
    },
  });
}

/**
 * Soft delete / deactivate a frame by ID
 * @param {string} id - Frame UUID
 * @returns {Promise<Object>}
 */
export async function softDeleteFrameById(id) {
  return prisma.frame.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

// Backwards-compatible object export
export const frameRepository = {
  findPaginated: findPaginatedFrames,
  findById: findFrameById,
  create: createFrame,
  delete: softDeleteFrameById,
};
