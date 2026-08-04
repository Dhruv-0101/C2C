import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const postRepository = {
  /**
   * Create a new generated post record
   */
  create: async (data) => {
    return prisma.post.create({
      data,
      include: {
        template: true,
        festival: true,
        category: true,
      },
    });
  },

  /**
   * Find all posts belonging to a user
   */
  findByUserId: async (userId) => {
    return prisma.post.findMany({
      where: { userId },
      include: {
        template: true,
        festival: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Find post by ID
   */
  findById: async (id) => {
    return prisma.post.findUnique({
      where: { id },
      include: {
        template: true,
        festival: true,
        category: true,
      },
    });
  },

  /**
   * Delete post by ID
   */
  delete: async (id, userId) => {
    return prisma.post.deleteMany({
      where: { id, userId },
    });
  },
};
