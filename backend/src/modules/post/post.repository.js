import { prisma } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import {
  DEFAULT_POST_SORT_BY,
  DEFAULT_POST_SORT_ORDER,
  POST_ALLOWED_SORT_FIELDS,
} from './post.constants.js';

/**
 * 📝 POST REPOSITORY (Database Access Layer)
 * Strictly encapsulates all database queries and Prisma ORM operations for Post & ScheduledPost entities.
 * Follows clean architecture: zero HTTP or presentation logic exists in this layer.
 */

export const POST_INCLUDE = Object.freeze({
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      avatarUrl: true,
      role: true,
    },
  },
  category: true,
  frame: true,
  template: {
    include: {
      templateCategory: true,
    },
  },
  festival: true,
  captions: true,
});

/**
 * Create a new generated post record
 * @param {Object} data - Post creation payload
 * @returns {Promise<Object>}
 */
export async function createPost(data) {
  return prisma.post.create({
    data,
    include: POST_INCLUDE,
  });
}

/**
 * Create post record and automatically store in Vault atomically
 * @param {Object} postData
 * @param {Object} [vaultMetaData={}]
 * @returns {Promise<Object>}
 */
export async function createWithVault(postData, vaultMetaData = {}) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const newPost = await tx.post.create({
          data: postData,
          include: {
            template: {
              include: {
                templateCategory: true,
              },
            },
            festival: true,
            category: true,
            frame: true,
          },
        });

        if (postData.finalGraphicUrl) {
          await tx.vaultItem.create({
            data: {
              userId: postData.userId,
              postId: newPost.id,
            },
          }).catch((err) => {
            logger.warn(`Non-critical Vault item insertion skipped: ${err.message}`);
          });
        }

        if (vaultMetaData.caption) {
          const hashtags = Array.isArray(vaultMetaData.hashtags) && vaultMetaData.hashtags.length > 0
            ? vaultMetaData.hashtags
            : (typeof vaultMetaData.caption === 'string'
              ? Array.from(new Set(vaultMetaData.caption.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g) || []))
              : []);

          await tx.caption.create({
            data: {
              postId: newPost.id,
              captionText: vaultMetaData.caption,
              hashtags,
            },
          }).catch((err) => {
            logger.warn(`Non-critical Caption insertion skipped: ${err.message}`);
          });
        }

        return newPost;
      },
      { maxWait: 10000, timeout: 25000 }
    );
  } catch (err) {
    // Fallback if transaction timed out: execute sequential creation
    logger.warn(`Transaction failed or timed out, executing sequential creation: ${err.message}`);
    const newPost = await prisma.post.create({
      data: postData,
      include: {
        template: {
          include: {
            templateCategory: true,
          },
        },
        festival: true,
        category: true,
        frame: true,
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
        .catch((vaultErr) => {
          logger.warn(`Fallback Vault item creation skipped: ${vaultErr.message}`);
        });
    }

    if (vaultMetaData.caption) {
      const hashtags = Array.isArray(vaultMetaData.hashtags) && vaultMetaData.hashtags.length > 0
        ? vaultMetaData.hashtags
        : (typeof vaultMetaData.caption === 'string'
          ? Array.from(new Set(vaultMetaData.caption.match(/#[a-zA-Z0-9_\u0900-\u097F]+/g) || []))
          : []);

      prisma.caption
        .create({
          data: {
            postId: newPost.id,
            captionText: vaultMetaData.caption,
            hashtags,
          },
        })
        .catch((captionErr) => {
          logger.warn(`Fallback Caption creation skipped: ${captionErr.message}`);
        });
    }

    return newPost;
  }
}

/**
 * Create a scheduled post entry safely
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createScheduledPost(data) {
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
}

/**
 * Find scheduled posts for a user with pagination and optional search
 * @param {string} userId
 * @param {Object} params
 * @param {number} params.skip
 * @param {number} params.take
 * @param {string} [params.search]
 * @returns {Promise<{ scheduledPosts: Array<Object>, totalCount: number }>}
 */
export async function findPaginatedScheduledByUserId(userId, { skip = 0, take = 10, search }) {
  const where = {
    post: {
      userId,
      ...(search
        ? {
            OR: [
              { occasionName: { contains: search, mode: 'insensitive' } },
              { festival: { name: { contains: search, mode: 'insensitive' } } },
              { template: { title: { contains: search, mode: 'insensitive' } } },
              { captions: { some: { captionText: { contains: search, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    },
  };

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
            captions: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.scheduledPost.count({ where }),
  ]);

  return { scheduledPosts, totalCount };
}

/**
 * Find all scheduled posts for a user without pagination
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function findScheduledPostsByUserId(userId) {
  return prisma.scheduledPost.findMany({
    where: {
      post: { userId },
    },
    include: {
      post: {
        include: {
          template: true,
          festival: true,
          captions: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });
}

/**
 * Find due scheduled posts for cron dispatcher
 * @param {number} [limit=1000]
 * @returns {Promise<Array<Object>>}
 */
export async function findDueScheduledPosts(limit = 1000) {
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
          captions: true,
        },
      },
    },
    take: limit,
  });
}

/**
 * Find all posts belonging to a user with pagination & optional search
 * @param {string} userId
 * @param {Object} params
 * @returns {Promise<{ posts: Array<Object>, totalCount: number }>}
 */
export async function findPaginatedByUserId(
  userId,
  {
    skip = 0,
    take = 10,
    search,
    sortBy = DEFAULT_POST_SORT_BY,
    sortOrder = DEFAULT_POST_SORT_ORDER,
  }
) {
  const where = {
    userId,
    ...(search
      ? {
          OR: [
            { occasionName: { contains: search, mode: 'insensitive' } },
            { festival: { name: { contains: search, mode: 'insensitive' } } },
            { template: { title: { contains: search, mode: 'insensitive' } } },
            { captions: { some: { captionText: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {}),
  };

  const validSortBy = POST_ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_POST_SORT_BY;
  const validSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : DEFAULT_POST_SORT_ORDER;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take,
      include: {
        template: true,
        festival: true,
        captions: true,
      },
      orderBy: { [validSortBy]: validSortOrder },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalCount };
}

/**
 * Find all posts belonging to a user
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function findByUserId(userId) {
  return prisma.post.findMany({
    where: { userId },
    include: {
      template: true,
      festival: true,
      captions: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Find post by ID
 * @param {string} id - Post UUID
 * @returns {Promise<Object|null>}
 */
export async function findById(id) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      template: true,
      festival: true,
      frame: true,
      category: true,
      captions: true,
      scheduledPost: true,
    },
  });
}

/**
 * Find all pending draft/scheduled posts belonging to a user for BrandKit re-sync
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function findPendingPostsByUserId(userId) {
  return prisma.post.findMany({
    where: {
      userId,
      status: {
        in: ['DRAFT', 'SCHEDULED'],
      },
    },
    include: {
      template: true,
      festival: true,
      frame: true,
      category: true,
      scheduledPost: true,
      vaultItems: true,
    },
  });
}

/**
 * Update post config JSON
 * @param {string} postId
 * @param {Object|string} userConfigJson
 * @returns {Promise<Object>}
 */
export async function updatePostConfigAndGraphic(postId, userConfigJson) {
  return prisma.post.update({
    where: { id: postId },
    data: { userConfigJson },
  });
}

/**
 * Update post final graphic URL and config JSON in place (re-render without duplicate quota deduction)
 * @param {string} postId
 * @param {string} finalGraphicUrl
 * @param {Object} [userConfigJson]
 * @returns {Promise<Object>}
 */
export async function updatePostGraphicById(postId, finalGraphicUrl, userConfigJson) {
  const data = { finalGraphicUrl };
  if (userConfigJson !== undefined) {
    data.userConfigJson = userConfigJson;
  }

  return prisma.post.update({
    where: { id: postId },
    data,
    include: {
      template: true,
      festival: true,
      frame: true,
      category: true,
      scheduledPost: true,
    },
  });
}

/**
 * Enterprise Admin Query: Find all generated posts across platform with multi-dimensional filtering
 * @param {Object} params
 * @returns {Promise<{ posts: Array<Object>, totalCount: number }>}
 */
export async function findPaginatedForAdmin({
  skip = 0,
  take = 10,
  categoryId,
  frameId,
  templateId,
  templateCategoryId,
  festivalId,
  userId,
  status,
  search,
  startDate,
  endDate,
  sortBy = DEFAULT_POST_SORT_BY,
  sortOrder = DEFAULT_POST_SORT_ORDER,
}) {
  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(frameId ? { frameId } : {}),
    ...(templateId ? { templateId } : {}),
    ...(templateCategoryId ? { template: { templateCategoryId } } : {}),
    ...(festivalId ? { festivalId } : {}),
    ...(userId ? { userId } : {}),
    ...(status ? { status } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { occasionName: { contains: search, mode: 'insensitive' } },
            { user: { fullName: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { user: { brandKit: { businessName: { contains: search, mode: 'insensitive' } } } },
            { festival: { name: { contains: search, mode: 'insensitive' } } },
            { template: { title: { contains: search, mode: 'insensitive' } } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
            { frame: { title: { contains: search, mode: 'insensitive' } } },
            { captions: { some: { captionText: { contains: search, mode: 'insensitive' } } } },
          ],
        }
      : {}),
  };

  const validSortBy = POST_ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_POST_SORT_BY;
  const validSortOrder = ['asc', 'desc'].includes(sortOrder?.toLowerCase())
    ? sortOrder.toLowerCase()
    : DEFAULT_POST_SORT_ORDER;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        frame: {
          select: {
            id: true,
            title: true,
            previewUrl: true,
            overlayPngUrl: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            baseImageUrl: true,
            templateCategoryId: true,
            templateCategory: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        festival: {
          select: {
            id: true,
            name: true,
            slug: true,
            date: true,
            bannerUrl: true,
          },
        },
        captions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        scheduledPost: true,
      },
      orderBy: { [validSortBy]: validSortOrder },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalCount };
}

/**
 * Enterprise Admin Metrics: Calculate aggregated volume and breakdown distributions
 * "Kitni bani hai" - Total posts, By Category, By Frame, By Template, By Festival, By Status, Top Creators
 * @returns {Promise<Object>}
 */
export async function getPostAnalytics() {
  const [
    totalPosts,
    byCategoryGroup,
    byFrameGroup,
    byTemplateGroup,
    byFestivalGroup,
    byStatusGroup,
    byUserGroup,
    allCategories,
    allFrames,
    allTemplates,
    allFestivals,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.post.groupBy({
      by: ['frameId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.post.groupBy({
      by: ['templateId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.post.groupBy({
      by: ['festivalId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.post.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.post.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.frame.findMany({ select: { id: true, title: true, previewUrl: true } }),
    prisma.template.findMany({
      select: {
        id: true,
        title: true,
        baseImageUrl: true,
        templateCategoryId: true,
        templateCategory: { select: { id: true, name: true } },
      },
    }),
    prisma.festival.findMany({ select: { id: true, name: true, date: true } }),
  ]);

  // Fast O(1) lookup maps
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));
  const frameMap = new Map(allFrames.map((f) => [f.id, f]));
  const templateMap = new Map(allTemplates.map((t) => [t.id, t]));
  const festivalMap = new Map(allFestivals.map((f) => [f.id, f]));

  // Fetch top user creators details
  const topUserIds = byUserGroup.map((u) => u.userId).filter(Boolean);
  const topUsers = await prisma.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
  });
  const userMap = new Map(topUsers.map((u) => [u.id, u]));

  // Format distributions
  const byCategory = byCategoryGroup.map((item) => {
    const cat = item.categoryId ? categoryMap.get(item.categoryId) : null;
    return {
      categoryId: item.categoryId || 'uncategorized',
      name: cat?.name || 'General / Uncategorized',
      count: item._count.id,
      percentage: totalPosts > 0 ? Number(((item._count.id / totalPosts) * 100).toFixed(1)) : 0,
    };
  });

  const byFrame = byFrameGroup.map((item) => {
    const frame = item.frameId ? frameMap.get(item.frameId) : null;
    return {
      frameId: item.frameId || 'no_frame',
      title: frame?.title || 'No Frame Applied',
      previewUrl: frame?.previewUrl || null,
      count: item._count.id,
      percentage: totalPosts > 0 ? Number(((item._count.id / totalPosts) * 100).toFixed(1)) : 0,
    };
  });

  // Group by Template Category
  const templateCategoryCountMap = new Map();
  const byTemplate = byTemplateGroup.map((item) => {
    const tpl = item.templateId ? templateMap.get(item.templateId) : null;
    const tplCatName = tpl?.templateCategory?.name || 'Unassigned Category';
    const tplCatId = tpl?.templateCategoryId || 'unassigned';

    const prev = templateCategoryCountMap.get(tplCatId) || { id: tplCatId, name: tplCatName, count: 0 };
    prev.count += item._count.id;
    templateCategoryCountMap.set(tplCatId, prev);

    return {
      templateId: item.templateId || 'custom_upload',
      title: tpl?.title || 'Custom Canvas Poster',
      baseImageUrl: tpl?.baseImageUrl || null,
      categoryName: tplCatName,
      count: item._count.id,
      percentage: totalPosts > 0 ? Number(((item._count.id / totalPosts) * 100).toFixed(1)) : 0,
    };
  });

  const byTemplateCategory = Array.from(templateCategoryCountMap.values())
    .map((tc) => ({
      ...tc,
      percentage: totalPosts > 0 ? Number(((tc.count / totalPosts) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const byFestival = byFestivalGroup.map((item) => {
    const fest = item.festivalId ? festivalMap.get(item.festivalId) : null;
    return {
      festivalId: item.festivalId || 'no_festival',
      name: fest?.name || 'General / Non-Festival',
      date: fest?.date || null,
      count: item._count.id,
      percentage: totalPosts > 0 ? Number(((item._count.id / totalPosts) * 100).toFixed(1)) : 0,
    };
  });

  const byStatus = byStatusGroup.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    },
    { DRAFT: 0, SCHEDULED: 0, PUBLISHED: 0 }
  );

  const topCreators = byUserGroup.map((item) => {
    const u = userMap.get(item.userId);
    return {
      userId: item.userId,
      fullName: u?.fullName || 'Anonymous User',
      email: u?.email || 'N/A',
      avatarUrl: u?.avatarUrl || null,
      role: u?.role || 'END_USER',
      count: item._count.id,
    };
  });

  return {
    totalPosts,
    byCategory,
    byFrame,
    byTemplate,
    byTemplateCategory,
    byFestival,
    byStatus,
    topCreators,
  };
}

/**
 * Delete post by ID
 * @param {string} id - Post UUID
 * @param {string} userId - Authenticated user UUID
 * @returns {Promise<Object>}
 */
export async function deletePostById(id, userId) {
  return prisma.post.deleteMany({
    where: { id, userId },
  });
}

// Backwards-compatible object export
export const postRepository = {
  postInclude: POST_INCLUDE,
  create: createPost,
  createWithVault,
  createScheduledPost,
  findPaginatedScheduledByUserId,
  findScheduledPostsByUserId,
  findDueScheduledPosts,
  findPaginatedByUserId,
  findByUserId,
  findById,
  findPendingPostsByUserId,
  updatePostConfigAndGraphic,
  updatePostGraphicById,
  findPaginatedForAdmin,
  getPostAnalytics,
  delete: deletePostById,
};
