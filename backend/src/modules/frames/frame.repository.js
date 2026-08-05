import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const frameRepository = {
  /**
   * Find all active frames
   */
  findAllActive: async () => {
    return prisma.frame.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
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
  },

  /**
   * Find frame by ID
   */
  findById: async (id) => {
    return prisma.frame.findUnique({
      where: { id },
    });
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
   * Delete or deactivate frame
   */
  delete: async (id) => {
    return prisma.frame.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
