import { prisma } from '../../config/database.js';

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
   * Create post record and automatically store in Vault atomically
   */
  createWithVault: async (postData, vaultMetaData = {}) => {
    return prisma.$transaction(async (tx) => {
      const newPost = await tx.post.create({
        data: postData,
        include: {
          template: true,
          festival: true,
          category: true,
        },
      });

      if (postData.finalGraphicUrl) {
        await tx.vaultItem.create({
          data: {
            userId: postData.userId,
            postId: newPost.id,
            graphicUrl: postData.finalGraphicUrl,
            occasionName: vaultMetaData.occasionName || newPost.festival?.name || 'Social Graphic',
            categoryName: vaultMetaData.categoryName || newPost.category?.name || 'General',
          },
        });
      }

      return newPost;
    });
  },

  /**
   * Create a scheduled post entry safely
   */
  createScheduledPost: async (data) => {
    const { postId, scheduledAt, status, targetPlatforms, platformResults } = data;
    const payload = {
      postId,
      scheduledAt,
      status: status || 'PENDING',
      targetPlatforms: targetPlatforms || [],
    };
    if (platformResults) {
      payload.platformResults = platformResults;
    }

    try {
      return await prisma.scheduledPost.create({
        data: payload,
        include: {
          post: {
            include: {
              template: true,
              festival: true,
            },
          },
        },
      });
    } catch (err) {
      if (err.message && err.message.includes('platformResults')) {
        delete payload.platformResults;
        return await prisma.scheduledPost.create({
          data: payload,
          include: {
            post: {
              include: {
                template: true,
                festival: true,
              },
            },
          },
        });
      }
      throw err;
    }
  },

  /**
   * Find scheduled posts for a user
   */
  findScheduledPostsByUserId: async (userId) => {
    return prisma.scheduledPost.findMany({
      where: {
        post: { userId },
      },
      include: {
        post: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  },

  /**
   * Find due scheduled posts for cron dispatcher
   */
  findDueScheduledPosts: async (limit = 1000) => {
    return prisma.scheduledPost.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        post: true,
      },
      take: limit,
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
