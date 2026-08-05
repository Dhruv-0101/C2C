import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const vaultRepository = {
  /**
   * Create a new VaultItem record
   */
  create: async (data, txPrisma = prisma) => {
    return txPrisma.vaultItem.create({
      data,
      include: {
        post: {
          include: {
            template: true,
            festival: true,
            category: true,
          },
        },
      },
    });
  },

  /**
   * Auto-sync existing user posts with finalGraphicUrl into VaultItem records
   */
  syncUserPostsToVault: async (userId) => {
    if (!userId) return;

    const postsWithGraphics = await prisma.post.findMany({
      where: {
        userId,
        finalGraphicUrl: { not: null },
      },
      include: {
        festival: true,
        category: true,
        vaultItems: true,
      },
    });

    for (const post of postsWithGraphics) {
      if (!post.vaultItems || post.vaultItems.length === 0) {
        await prisma.vaultItem.create({
          data: {
            userId,
            postId: post.id,
            graphicUrl: post.finalGraphicUrl,
            occasionName: post.festival?.name || 'Social Graphic',
            categoryName: post.category?.name || 'General',
          },
        });
      }
    }
  },

  /**
   * Find all vault items belonging to a user with pagination & search
   */
  findPaginatedByUserId: async (userId, { skip, take, search }) => {
    const where = { userId };

    if (search) {
      where.OR = [
        { categoryName: { contains: search, mode: 'insensitive' } },
        { occasionName: { contains: search, mode: 'insensitive' } },
        { post: { customText: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [vaultItems, totalCount] = await prisma.$transaction([
      prisma.vaultItem.findMany({
        where,
        skip,
        take,
        include: {
          post: {
            include: {
              template: true,
              festival: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vaultItem.count({ where }),
    ]);

    return { vaultItems, totalCount };
  },

  /**
   * Find single vault item by ID
   */
  findById: async (id, userId) => {
    return prisma.vaultItem.findFirst({
      where: { id, userId },
      include: {
        post: {
          include: {
            template: true,
            festival: true,
            category: true,
          },
        },
      },
    });
  },

  /**
   * Update vault item details
   */
  update: async (id, userId, data) => {
    return prisma.vaultItem.updateMany({
      where: { id, userId },
      data,
    });
  },

  /**
   * Delete vault item by ID
   */
  delete: async (id, userId) => {
    return prisma.vaultItem.deleteMany({
      where: { id, userId },
    });
  },
};
