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
