import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const templateRepository = {
  create: async (data) => {
    return prisma.template.create({
      data,
      include: {
        festival: true,
      },
    });
  },

  findMany: async (filter = {}) => {
    try {
      return await prisma.template.findMany({
        where: {
          deletedAt: null,
          ...filter,
        },
        include: {
          festival: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      return await prisma.template.findMany({
        where: {
          isActive: true,
          ...filter,
        },
        include: {
          festival: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  },

  findPaginated: async ({ skip, take, festivalId, category, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const where = {};
    if (festivalId && festivalId !== 'undefined' && festivalId !== 'null') {
      where.festivalId = festivalId;
    }
    if (category && category !== 'undefined' && category !== 'null' && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = ['createdAt', 'title', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    try {
      const [templates, totalCount] = await prisma.$transaction([
        prisma.template.findMany({
          where: { deletedAt: null, ...where },
          skip,
          take,
          include: {
            festival: true,
          },
          orderBy: {
            [validSortBy]: sortOrder,
          },
        }),
        prisma.template.count({ where: { deletedAt: null, ...where } }),
      ]);

      return { templates, totalCount };
    } catch (err) {
      const [templates, totalCount] = await prisma.$transaction([
        prisma.template.findMany({
          where: { isActive: true, ...where },
          skip,
          take,
          include: {
            festival: true,
          },
          orderBy: {
            [validSortBy]: sortOrder,
          },
        }),
        prisma.template.count({ where: { isActive: true, ...where } }),
      ]);

      return { templates, totalCount };
    }
  },

  findById: async (id) => {
    try {
      return await prisma.template.findFirst({
        where: { id, deletedAt: null },
        include: {
          festival: true,
        },
      });
    } catch (err) {
      return await prisma.template.findUnique({
        where: { id },
        include: {
          festival: true,
        },
      });
    }
  },

  /**
   * Soft delete master template with fail-safe fallback
   */
  delete: async (id) => {
    try {
      return await prisma.template.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
    } catch (err) {
      return await prisma.template.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    }
  },
};
