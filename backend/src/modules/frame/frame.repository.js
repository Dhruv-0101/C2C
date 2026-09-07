import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const frameRepository = {
  /**
   * Find all active frames
   */
  findAllActive: async () => {
    try {
      return await prisma.frame.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
    } catch (err) {
      return await prisma.frame.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    }
  },

  findPaginated: async ({ skip, take, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const where = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = ['createdAt', 'title', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    try {
      const [frames, totalCount] = await prisma.$transaction([
        prisma.frame.findMany({
          where: { deletedAt: null, ...where },
          skip,
          take,
          orderBy: {
            [validSortBy]: sortOrder,
          },
        }),
        prisma.frame.count({ where: { deletedAt: null, ...where } }),
      ]);

      return { frames, totalCount };
    } catch (err) {
      const [frames, totalCount] = await prisma.$transaction([
        prisma.frame.findMany({
          where,
          skip,
          take,
          orderBy: {
            [validSortBy]: sortOrder,
          },
        }),
        prisma.frame.count({ where }),
      ]);

      return { frames, totalCount };
    }
  },

  /**
   * Find frame by ID
   */
  findById: async (id) => {
    try {
      return await prisma.frame.findFirst({
        where: { id, deletedAt: null },
      });
    } catch (err) {
      return await prisma.frame.findUnique({
        where: { id },
      });
    }
  },

  /**
   * Create frame
   */
  create: async (data) => {
    return prisma.frame.create({
      data,
    });
  },

  /**
   * Soft delete or deactivate frame with fail-safe fallback
   */
  delete: async (id) => {
    try {
      return await prisma.frame.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });
    } catch (err) {
      return await prisma.frame.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    }
  },
};
