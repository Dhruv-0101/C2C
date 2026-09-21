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
    createdAt: { gte: startDate },
  };

  const priorWhere = {
    userId,
    createdAt: { gte: priorStartDate, lt: startDate },
  };

  if (platform && platform !== 'ALL') {
    currentWhere.platform = platform;
    priorWhere.platform = platform;
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
    prisma.postAnalytics.count({ where: currentWhere }),
  ]);

  return {
    current: {
      impressions: currentAgg._sum.impressions || 0,
      reach: currentAgg._sum.reach || 0,
      likes: currentAgg._sum.likes || 0,
      comments: currentAgg._sum.comments || 0,
      shares: currentAgg._sum.shares || 0,
      clicks: currentAgg._sum.clicks || 0,
      engagementRate: Number((currentAgg._avg.engagementRate || 0).toFixed(2)),
      totalAnalyzedPosts: postCount,
    },
    prior: {
      impressions: priorAgg._sum.impressions || 0,
      reach: priorAgg._sum.reach || 0,
      likes: priorAgg._sum.likes || 0,
      comments: priorAgg._sum.comments || 0,
      shares: priorAgg._sum.shares || 0,
      engagementRate: Number((priorAgg._avg.engagementRate || 0).toFixed(2)),
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
 * Get top performing templates ranked by engagement rate
 *
 * @param {string} userId - User ID
 * @param {number} [limit=5] - Number of templates to return
 * @returns {Promise<Array>} Top templates ranked by average engagement rate
 */
export const getTopTemplates = async (userId, limit = 5) => {
  const items = await prisma.postAnalytics.findMany({
    where: { userId },
    take: 20,
    orderBy: { engagementRate: 'desc' },
    include: {
      post: {
        include: {
          template: {
            select: {
              id: true,
              title: true,
              category: true,
              baseImageUrl: true,
            },
          },
        },
      },
    },
  });

  // Group & average metrics per template
  const templateMap = new Map();
  items.forEach((item) => {
    const templateTitle = item.post?.template?.title || item.post?.occasionName || 'Custom Brand Graphic';
    const templateId = item.post?.template?.id || item.postId;
    const imageUrl = item.post?.finalGraphicUrl || item.post?.template?.baseImageUrl || item.post?.customImageUrl;

    if (!templateMap.has(templateId)) {
      templateMap.set(templateId, {
        id: templateId,
        title: templateTitle,
        category: item.post?.template?.category || 'PROMOTION',
        imageUrl,
        totalImpressions: 0,
        totalReach: 0,
        totalEngagement: 0,
        rates: [],
      });
    }

    const existing = templateMap.get(templateId);
    existing.totalImpressions += item.impressions;
    existing.totalReach += item.reach;
    existing.totalEngagement += item.likes + item.comments + item.shares;
    existing.rates.push(item.engagementRate);
  });

  return Array.from(templateMap.values())
    .map((t) => ({
      ...t,
      avgEngagementRate: Number((t.rates.reduce((a, b) => a + b, 0) / t.rates.length).toFixed(2)),
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
 * Backward-compatible repository singleton export
 */
export const analyticsRepository = {
  getOverviewMetrics,
  getDailyTrends,
  getPlatformBreakdown,
  getTopTemplates,
  seedDemoAnalytics,
};
