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
