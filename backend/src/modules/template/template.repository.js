import { prisma } from '../../config/database.js';

export const templateRepository = {
  create: async (data) => {
    return prisma.template.create({
      data,
      include: {
        festival: true,
        templateCategory: true,
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
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
          templateCategory: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
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
          templateCategory: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  },

  findPaginated: async ({ skip, take, festivalId, category, templateCategoryId, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const where = {};
    if (festivalId && festivalId !== 'undefined' && festivalId !== 'null') {
      where.festivalId = festivalId;
    }

    const targetCategory = templateCategoryId || category;
    if (targetCategory && targetCategory !== 'undefined' && targetCategory !== 'null' && targetCategory !== 'ALL') {
      where.templateCategory = {
        OR: [
          { id: targetCategory },
          { slug: { equals: targetCategory.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'), mode: 'insensitive' } },
          { name: { equals: targetCategory, mode: 'insensitive' } },
        ],
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { templateCategory: { name: { contains: search, mode: 'insensitive' } } },
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
            templateCategory: true,
            creator: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
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
            templateCategory: true,
            creator: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
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
          templateCategory: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      });
    } catch (err) {
      return await prisma.template.findUnique({
        where: { id },
        include: {
          festival: true,
          templateCategory: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
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
