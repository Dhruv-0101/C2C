import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const templateRepository = {
  create: async (data) => {
    return prisma.template.create({
      data,
      include: {
        category: true,
        festival: true,
        style: true,
      },
    });
  },

  findMany: async (filter = {}) => {
    return prisma.template.findMany({
      where: filter,
      include: {
        category: true,
        festival: true,
        style: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id) => {
    return prisma.template.findUnique({
      where: { id },
      include: {
        category: true,
        festival: true,
        style: true,
      },
    });
  },

  delete: async (id) => {
    return prisma.template.delete({
      where: { id },
    });
  },
};
