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
    return prisma.template.findMany({
      where: filter,
      include: {
        festival: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findPaginated: async ({ skip, take, festivalId, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const where = {};
    if (festivalId && festivalId !== 'undefined' && festivalId !== 'null') {
      where.festivalId = festivalId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = ['createdAt', 'title', 'updatedAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [templates, totalCount] = await prisma.$transaction([
      prisma.template.findMany({
        where,
        skip,
        take,
        include: {
          festival: true,
        },
        orderBy: {
          [validSortBy]: sortOrder,
        },
      }),
      prisma.template.count({ where }),
    ]);

    return { templates, totalCount };
  },

  findById: async (id) => {
    return prisma.template.findUnique({
      where: { id },
      include: {
        festival: true,
      },
    });
  },

  delete: async (id) => {
    return prisma.template.delete({
      where: { id },
    });
  },
};
