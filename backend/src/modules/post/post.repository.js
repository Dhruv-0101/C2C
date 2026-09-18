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
    try {
      return await prisma.$transaction(
        async (tx) => {
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
              },
            }).catch(() => {});
          }

          if (vaultMetaData.caption) {
            await tx.caption.create({
              data: {
                postId: newPost.id,
                captionText: vaultMetaData.caption,
                hashtags: [],
              },
            }).catch(() => {});
          }

          return newPost;
        },
        { maxWait: 10000, timeout: 25000 }
      );
    } catch (err) {
      // Fallback if transaction timed out: execute sequential creation
      const newPost = await prisma.post.create({
        data: postData,
        include: {
          template: true,
          festival: true,
          category: true,
        },
      });

      if (postData.finalGraphicUrl) {
        prisma.vaultItem
          .create({
            data: {
              userId: postData.userId,
              postId: newPost.id,
            },
          })
          .catch(() => {});
      }

      if (vaultMetaData.caption) {
        prisma.caption
          .create({
            data: {
              postId: newPost.id,
              captionText: vaultMetaData.caption,
              hashtags: [],
            },
          })
          .catch(() => {});
      }

      return newPost;
    }
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
   * Find scheduled posts for a user with pagination
   */
  findPaginatedScheduledByUserId: async (userId, { skip = 0, take = 10 }) => {
    const where = { post: { userId } };

    const [scheduledPosts, totalCount] = await Promise.all([
      prisma.scheduledPost.findMany({
        where,
        skip,
        take,
        include: {
          post: {
            include: {
              template: true,
              festival: true,
              category: true,
              captions: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.scheduledPost.count({ where }),
    ]);

    return { scheduledPosts, totalCount };
  },

  findScheduledPostsByUserId: async (userId) => {
    return prisma.scheduledPost.findMany({
      where: {
        post: { userId },
      },
      include: {
        post: {
          include: {
            template: true,
            festival: true,
            category: true,
            captions: true,
          },
        },
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
        post: {
          include: {
            template: true,
            festival: true,
            category: true,
            captions: true,
          },
        },
      },
      take: limit,
    });
  },

  /**
   * Find all posts belonging to a user with pagination & optional search
   */
  findPaginatedByUserId: async (userId, { skip = 0, take = 10, search, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const where = {
      userId,
      ...(search
        ? {
            OR: [
              { occasionName: { contains: search, mode: 'insensitive' } },
              { festival: { name: { contains: search, mode: 'insensitive' } } },
              { category: { name: { contains: search, mode: 'insensitive' } } },
              { template: { title: { contains: search, mode: 'insensitive' } } },
              { captions: { some: { captionText: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take,
        include: {
          template: true,
          festival: true,
          category: true,
          captions: true,
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.post.count({ where }),
    ]);

    return { posts, totalCount };
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
        captions: true,
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
        captions: true,
      },
    });
  },

  /**
   * Find all pending draft/scheduled posts belonging to a user for BrandKit re-sync
   */
  findPendingPostsByUserId: async (userId) => {
    return prisma.post.findMany({
      where: {
        userId,
        status: {
          in: ['DRAFT', 'SCHEDULED'],
        },
      },
      include: {
        scheduledPosts: true,
        vaultItems: true,
      },
    });
  },

  /**
   * Update post config JSON and optional graphic URL
   */
  updatePostConfigAndGraphic: async (postId, userConfigJson, finalGraphicUrl) => {
    const data = { userConfigJson };
    if (finalGraphicUrl) {
      data.finalGraphicUrl = finalGraphicUrl;
    }
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data,
    });

    return updatedPost;
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
