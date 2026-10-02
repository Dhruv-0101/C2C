import { prisma } from '../../config/database.js';

/**
 * Get overall aggregated analytics metrics for a user within a date range
 *
 * @param {string} userId - User ID
 * @param {Date} startDate - Current window start date
 * @param {Date} priorStartDate - Prior comparison window start date
 * @param {string} [platform=null] - Social network filter
 * @returns {Promise<Object>} Aggregated metrics for current and prior windows
 */
export const getOverviewMetrics = async (userId, startDate, priorStartDate, platform = null) => {
  const currentWhere = {
    userId,
    ...(startDate ? { createdAt: { gte: startDate } } : {}),
  };

  const priorWhere = {
    userId,
    ...(priorStartDate && startDate ? { createdAt: { gte: priorStartDate, lt: startDate } } : {}),
  };

  if (platform && platform !== 'ALL') {
    currentWhere.platform = platform;
    priorWhere.platform = platform;
  }

  // Count unique published posts matching the filter
  const postWhere = {
    userId,
    status: 'PUBLISHED',
    ...(startDate ? { createdAt: { gte: startDate } } : {}),
  };
  if (platform && platform !== 'ALL') {
    postWhere.postAnalytics = { some: { platform } };
  }

  const [currentAgg, priorAgg, postCount] = await Promise.all([
    prisma.postAnalytics.aggregate({
      where: currentWhere,
      _sum: {
        impressions: true,
        reach: true,
        likes: true,
        comments: true,
        shares: true,
        clicks: true,
      },
      _avg: {
        engagementRate: true,
      },
    }),
    prisma.postAnalytics.aggregate({
      where: priorWhere,
      _sum: {
        impressions: true,
        reach: true,
        likes: true,
        comments: true,
        shares: true,
      },
      _avg: {
        engagementRate: true,
      },
    }),
    prisma.post.count({ where: postWhere }),
  ]);

  const currentLikes = currentAgg._sum.likes || 0;
  const currentComments = currentAgg._sum.comments || 0;
  const currentShares = currentAgg._sum.shares || 0;
  const currentReach = currentAgg._sum.reach || 0;
  const currentInteractions = currentLikes + currentComments + currentShares;
  const currentEngagementRate = currentReach > 0
    ? Number(((currentInteractions / currentReach) * 100).toFixed(2))
    : Number((currentAgg._avg.engagementRate || 0).toFixed(2));

  const priorLikes = priorAgg._sum.likes || 0;
  const priorComments = priorAgg._sum.comments || 0;
  const priorShares = priorAgg._sum.shares || 0;
  const priorReach = priorAgg._sum.reach || 0;
  const priorInteractions = priorLikes + priorComments + priorShares;
  const priorEngagementRate = priorReach > 0
    ? Number(((priorInteractions / priorReach) * 100).toFixed(2))
    : Number((priorAgg._avg.engagementRate || 0).toFixed(2));

  return {
    current: {
      impressions: currentAgg._sum.impressions || 0,
      reach: currentReach,
      likes: currentLikes,
      comments: currentComments,
      shares: currentShares,
      clicks: currentAgg._sum.clicks || 0,
      engagementRate: currentEngagementRate,
      totalAnalyzedPosts: postCount,
    },
    prior: {
      impressions: priorAgg._sum.impressions || 0,
      reach: priorReach,
      likes: priorLikes,
      comments: priorComments,
      shares: priorShares,
      engagementRate: priorEngagementRate,
    },
  };
};

/**
 * Get daily time-series metrics for trend line charts
 *
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date filter
 * @param {string} [platform=null] - Social network filter
 * @returns {Promise<Array>} Time-series metrics
 */
export const getDailyTrends = async (userId, startDate, platform = null) => {
  const where = {
    userId,
    createdAt: { gte: startDate },
  };
  if (platform && platform !== 'ALL') {
    where.platform = platform;
  }

  return prisma.postAnalytics.findMany({
    where,
    select: {
      createdAt: true,
      impressions: true,
      reach: true,
      likes: true,
      comments: true,
      shares: true,
      engagementRate: true,
      platform: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Get platform distribution breakdown for pie/donut charts
 *
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date filter
 * @param {string} [platform=null] - Social network filter
 * @returns {Promise<Array>} Platform grouped aggregates
 */
export const getPlatformBreakdown = async (userId, startDate, platform = null) => {
  const where = {
    userId,
    createdAt: { gte: startDate },
  };

  if (platform && platform !== 'ALL') {
    where.platform = platform;
  }

  return prisma.postAnalytics.groupBy({
    by: ['platform'],
    where,
    _sum: {
      impressions: true,
      reach: true,
      likes: true,
      comments: true,
      shares: true,
    },
    _count: {
      id: true,
    },
  });
};

/**
 * Get top performing templates ranked by true weighted engagement rate
 *
 * @param {string} userId - User ID
 * @param {number} [limit=5] - Number of templates to return
 * @param {string} [platform=null] - Social platform filter
 * @returns {Promise<Array>} Top templates ranked by weighted engagement rate
 */
export const getTopTemplates = async (userId, limit = 5, platform = null) => {
  const where = { userId };
  if (platform && platform !== 'ALL') {
    where.platform = platform;
  }

  const items = await prisma.postAnalytics.findMany({
    where,
    take: 50,
    orderBy: { engagementRate: 'desc' },
    select: {
      postId: true,
      impressions: true,
      reach: true,
      likes: true,
      comments: true,
      shares: true,
      engagementRate: true,
      platform: true,
      post: {
        select: {
          id: true,
          occasionName: true,
          customImageUrl: true,
          finalGraphicUrl: true,
          template: {
            select: {
              id: true,
              title: true,
              baseImageUrl: true,
            },
          },
        },
      },
    },
  });

  // Group & sum metrics per template using true weighted aggregation
  const templateMap = new Map();
  items.forEach((item) => {
    const templateTitle = item.post?.template?.title || item.post?.occasionName || 'Custom Brand Graphic';
    const templateId = item.post?.template?.id || item.postId;
    const imageUrl = item.post?.finalGraphicUrl || item.post?.template?.baseImageUrl || item.post?.customImageUrl;

    if (!templateMap.has(templateId)) {
      templateMap.set(templateId, {
        id: templateId,
        title: templateTitle,
        category: 'PROMOTION',
        imageUrl,
        totalImpressions: 0,
        totalReach: 0,
        totalEngagement: 0,
      });
    }

    const existing = templateMap.get(templateId);
    existing.totalImpressions += item.impressions || 0;
    existing.totalReach += item.reach || 0;
    existing.totalEngagement += (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
  });

  return Array.from(templateMap.values())
    .map((t) => ({
      ...t,
      avgEngagementRate: t.totalReach > 0
        ? Number(((t.totalEngagement / t.totalReach) * 100).toFixed(2))
        : (t.totalImpressions > 0 ? Number(((t.totalEngagement / t.totalImpressions) * 100).toFixed(2)) : 0),
    }))
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
    .slice(0, limit);
};

/**
 * Seed realistic analytics demo data for local/dev testing
 *
 * @param {string} userId - User ID
 * @returns {Promise<{ seededCount: number }>} Number of analytics records seeded
 */
export const seedDemoAnalytics = async (userId) => {
  let posts = await prisma.post.findMany({
    where: { userId },
    select: { id: true },
    take: 10,
  });

  // If user has no posts yet, create sample posts so analytics can be visualized
  if (posts.length === 0) {
    const mockPostsData = [
      { occasionName: 'Diwali Festive Sale Offer', status: 'PUBLISHED' },
      { occasionName: 'New Product Launch Banner', status: 'PUBLISHED' },
      { occasionName: 'Weekend Promo Special', status: 'PUBLISHED' },
      { occasionName: 'Customer Testimonial Spotlight', status: 'PUBLISHED' },
      { occasionName: 'Independence Day Greeting', status: 'PUBLISHED' },
    ];

    for (const p of mockPostsData) {
      const created = await prisma.post.create({
        data: {
          userId,
          occasionName: p.occasionName,
          status: 'PUBLISHED',
        },
      });
      posts.push(created);
    }
  }

  const platforms = ['INSTAGRAM', 'FACEBOOK', 'LINKEDIN'];
  const now = new Date();

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    for (const platform of platforms) {
      const daysAgo = Math.floor(Math.random() * 28);
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const reach = Math.floor(Math.random() * 1200) + 300;
      const impressions = Math.floor(reach * (1.2 + Math.random() * 0.8));
      const likes = Math.floor(reach * (0.04 + Math.random() * 0.08));
      const comments = Math.floor(likes * (0.1 + Math.random() * 0.2));
      const shares = Math.floor(likes * (0.05 + Math.random() * 0.15));
      const clicks = Math.floor(reach * (0.02 + Math.random() * 0.05));
      const engagementRate = Number((((likes + comments + shares) / reach) * 100).toFixed(2));

      await prisma.postAnalytics.upsert({
        where: {
          postId_platform: {
            postId: post.id,
            platform,
          },
        },
        create: {
          postId: post.id,
          userId,
          platform,
          platformPostId: `platform_${platform.toLowerCase()}_${Date.now()}_${i}`,
          impressions,
          reach,
          likes,
          comments,
          shares,
          clicks,
          engagementRate,
          createdAt,
        },
        update: {
          impressions,
          reach,
          likes,
          comments,
          shares,
          clicks,
          engagementRate,
        },
      });
    }
  }

  return { seededCount: posts.length * platforms.length };
};

/**
 * Fetch paginated user published posts with full relational analytics data
 *
 * @param {string} userId - User ID
 * @param {Object} options - Filter & pagination options
 * @returns {Promise<{ posts: Array, totalCount: number }>}
 */
export const getUserPostsWithAnalytics = async (userId, {
  startDate = null,
  platform = null,
  search = null,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 10,
} = {}) => {
  const skip = (page - 1) * limit;
  const take = limit;

  const where = {
    userId,
    status: 'PUBLISHED',
  };

  if (startDate) {
    where.createdAt = { gte: startDate };
  }

  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { occasionName: { contains: s, mode: 'insensitive' } },
      { captions: { some: { captionText: { contains: s, mode: 'insensitive' } } } },
      { template: { title: { contains: s, mode: 'insensitive' } } },
      { festival: { name: { contains: s, mode: 'insensitive' } } },
    ];
  }

  if (platform && platform !== 'ALL') {
    where.postAnalytics = {
      some: { platform },
    };
  }

  const isRelationalSort = Boolean(sortBy && sortBy !== 'createdAt');

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      ...(isRelationalSort ? {} : { skip, take }),
      include: {
        captions: {
          select: {
            id: true,
            captionText: true,
            hashtags: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            baseImageUrl: true,
          },
        },
        festival: {
          select: {
            id: true,
            name: true,
            bannerUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        scheduledPost: {
          select: {
            id: true,
            scheduledAt: true,
            publishedAt: true,
            targetPlatforms: true,
            platformResults: true,
          },
        },
        postAnalytics: {
          ...(platform && platform !== 'ALL' ? { where: { platform } } : {}),
          orderBy: { platform: 'asc' },
        },
      },
      orderBy: { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' },
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalCount, isRelationalSort };
};

/**
 * Find all published posts of a user eligible for live Meta Graph sync
 *
 * @param {string} userId - User ID
 * @param {number} [limit=20] - Max posts to sync in on-demand batch
 * @returns {Promise<Array>} Published posts
 */
export const findUserPublishedPostsForSync = async (userId, limit = 20) => {
  return prisma.post.findMany({
    where: {
      userId,
      status: 'PUBLISHED',
    },
    include: {
      scheduledPost: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Backward-compatible repository singleton export
 */
export const analyticsRepository = {
  getOverviewMetrics,
  getDailyTrends,
  getPlatformBreakdown,
  getTopTemplates,
  seedDemoAnalytics,
  getUserPostsWithAnalytics,
  findUserPublishedPostsForSync,
};

