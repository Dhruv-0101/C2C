import { env } from '../../config/env.js';
import { BadRequestError } from '../../common/errors/custom-errors.js';
import {
  DEFAULT_ANALYTICS_RANGE,
  DEFAULT_ANALYTICS_PLATFORM,
  ANALYTICS_CACHE_TTL_SECONDS,
  ANALYTICS_TOP_TEMPLATES_LIMITS,
} from './analytics.constants.js';
import {
  getFromCache,
  setInCache,
  invalidateUserAnalyticsCache,
  calculateGrowthPercentage,
  getDateRanges,
  sanitizeOverviewKpi,
  formatDailyTrends,
  formatPlatformBreakdown,
} from './analytics.helper.js';
import { logger } from '../../config/logger.js';
import * as analyticsRepository from './analytics.repository.js';
import {
  getOverviewMetrics,
  getDailyTrends,
  getPlatformBreakdown as getPlatformBreakdownRepo,
  getTopTemplates as getTopTemplatesRepo,
  seedDemoAnalytics,
  getUserPostsWithAnalytics,
  findUserPublishedPostsForSync,
} from './analytics.repository.js';

export { invalidateUserAnalyticsCache };

/**
 * Get overall KPI metrics & growth rates (Redis Cached)
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters { range, platform }
 * @returns {Promise<Object>} Overview KPI metrics
 */
export const getOverview = async (userId, queryParams = {}) => {
  const range = queryParams.range || DEFAULT_ANALYTICS_RANGE;
  const platform = queryParams.platform || DEFAULT_ANALYTICS_PLATFORM;
  const cacheKey = `analytics:overview:${userId}:${range}:${platform}`;

  // 1. Check Redis Cache
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // 2. Database Aggregation Scan
  const { startDate, priorStartDate } = getDateRanges(range);
  const metrics = await getOverviewMetrics(userId, startDate, priorStartDate, platform);

  const impressionsGrowth = calculateGrowthPercentage(metrics.current.impressions, metrics.prior.impressions);
  const reachGrowth = calculateGrowthPercentage(metrics.current.reach, metrics.prior.reach);
  const engagementGrowth = calculateGrowthPercentage(metrics.current.engagementRate, metrics.prior.engagementRate);

  const sanitizedKpi = sanitizeOverviewKpi({
    totalImpressions: metrics.current.impressions,
    impressionsGrowth,
    totalReach: metrics.current.reach,
    reachGrowth,
    avgEngagementRate: metrics.current.engagementRate,
    engagementGrowth,
    totalLikes: metrics.current.likes,
    totalComments: metrics.current.comments,
    totalShares: metrics.current.shares,
    totalClicks: metrics.current.clicks,
    analyzedPosts: metrics.current.totalAnalyzedPosts,
  });

  const response = { kpi: sanitizedKpi };

  // 3. Populate Redis Cache
  await setInCache(cacheKey, response, ANALYTICS_CACHE_TTL_SECONDS);

  return response;
};

/**
 * Get formatted daily time-series trends for line charts (Redis Cached)
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters { range, platform }
 * @returns {Promise<Array>} Time-series trend points
 */
export const getTrends = async (userId, queryParams = {}) => {
  const range = queryParams.range || DEFAULT_ANALYTICS_RANGE;
  const platform = queryParams.platform || DEFAULT_ANALYTICS_PLATFORM;
  const cacheKey = `analytics:trends:${userId}:${range}:${platform}`;

  // 1. Check Redis Cache
  const cachedTrends = await getFromCache(cacheKey);
  if (cachedTrends) {
    return cachedTrends;
  }

  // 2. Database Timeseries Scan
  const { startDate } = getDateRanges(range);
  const rawItems = await getDailyTrends(userId, startDate, platform);
  const trends = formatDailyTrends(rawItems);

  // 3. Populate Redis Cache
  await setInCache(cacheKey, trends, ANALYTICS_CACHE_TTL_SECONDS);

  return trends;
};

/**
 * Get platform distribution breakdown for pie charts (Redis Cached)
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters { range, platform }
 * @returns {Promise<Array>} Platform breakdown metrics
 */
export const getPlatformBreakdown = async (userId, queryParams = {}) => {
  const range = queryParams.range || DEFAULT_ANALYTICS_RANGE;
  const platform = queryParams.platform || DEFAULT_ANALYTICS_PLATFORM;
  const cacheKey = `analytics:breakdown:${userId}:${range}:${platform}`;

  // 1. Check Redis Cache
  const cachedBreakdown = await getFromCache(cacheKey);
  if (cachedBreakdown) {
    return cachedBreakdown;
  }

  // 2. Database GroupBy Query
  const { startDate } = getDateRanges(range);
  const rawBreakdown = await getPlatformBreakdownRepo(userId, startDate, platform);
  const breakdown = formatPlatformBreakdown(rawBreakdown);

  // 3. Populate Redis Cache
  await setInCache(cacheKey, breakdown, ANALYTICS_CACHE_TTL_SECONDS);

  return breakdown;
};

/**
 * Get top performing design templates (Redis Cached)
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters { limit, platform }
 * @returns {Promise<Array>} Ranked top templates
 */
export const getTopTemplates = async (userId, queryParams = {}) => {
  const limit = Math.max(
    ANALYTICS_TOP_TEMPLATES_LIMITS.MIN,
    Math.min(
      ANALYTICS_TOP_TEMPLATES_LIMITS.MAX,
      Number(queryParams.limit) || ANALYTICS_TOP_TEMPLATES_LIMITS.DEFAULT
    )
  );
  const platform = queryParams.platform || DEFAULT_ANALYTICS_PLATFORM;
  const cacheKey = `analytics:top-templates:${userId}:${limit}:${platform}`;

  // 1. Check Redis Cache
  const cachedTemplates = await getFromCache(cacheKey);
  if (cachedTemplates) {
    return cachedTemplates;
  }

  // 2. Database Aggregation
  const templates = await getTopTemplatesRepo(userId, limit, platform);

  // 3. Populate Redis Cache
  await setInCache(cacheKey, templates, ANALYTICS_CACHE_TTL_SECONDS);

  return templates;
};

/**
 * Seed demo analytics data and invalidate user cache
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Seeding result summary
 */
export const seedDemoData = async (userId) => {
  if (env.NODE_ENV === 'production') {
    throw new BadRequestError('Demo data seeding is strictly disabled in production environments.');
  }

  const result = await seedDemoAnalytics(userId);
  await invalidateUserAnalyticsCache(userId);
  return result;
};

/**
 * Get paginated post-level analytics and engagement breakdown
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Filter and pagination options
 * @returns {Promise<Object>} Post analytics list with pagination
 */
export const getPostsAnalytics = async (userId, queryParams = {}) => {
  const range = queryParams.range || DEFAULT_ANALYTICS_RANGE;
  const platform = queryParams.platform || DEFAULT_ANALYTICS_PLATFORM;
  const search = queryParams.search || null;
  const sortBy = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder || 'desc';
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  const { startDate } = getDateRanges(range);

  const { posts, totalCount, isRelationalSort } = await analyticsRepository.getUserPostsWithAnalytics(userId, {
    startDate,
    platform: platform !== 'ALL' ? platform : null,
    search,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const formattedPosts = posts.map((post) => {
    const analytics = post.postAnalytics || [];
    const schedule = post.scheduledPost || {};
    const platformResults = schedule.platformResults || {};

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalReach = 0;
    let totalImpressions = 0;
    let latestSync = null;

    const platformBreakdown = analytics.map((pa) => {
      totalLikes += pa.likes || 0;
      totalComments += pa.comments || 0;
      totalShares += pa.shares || 0;
      totalReach += pa.reach || 0;
      totalImpressions += pa.impressions || 0;

      if (!latestSync || (pa.lastSyncedAt && new Date(pa.lastSyncedAt) > new Date(latestSync))) {
        latestSync = pa.lastSyncedAt;
      }

      // Resolve live post URL if available from platform results
      const liveInfo = platformResults[pa.platform] || {};
      const postUrl = liveInfo.postUrl || liveInfo.permalink || null;

      return {
        platform: pa.platform,
        likes: pa.likes || 0,
        comments: pa.comments || 0,
        shares: pa.shares || 0,
        reach: pa.reach || 0,
        impressions: pa.impressions || 0,
        engagementRate: pa.engagementRate || 0,
        lastSyncedAt: pa.lastSyncedAt || null,
        platformPostId: pa.platformPostId,
        postUrl,
      };
    });

    const totalInteractions = totalLikes + totalComments + totalShares;
    const engagementRate = totalReach > 0
      ? Number(((totalInteractions / totalReach) * 100).toFixed(2))
      : (totalInteractions > 0 ? 100 : 0);

    // Collect target platforms
    const targetPlatforms = schedule.targetPlatforms?.length > 0
      ? schedule.targetPlatforms
      : analytics.length > 0
      ? analytics.map((a) => a.platform)
      : ['INSTAGRAM', 'FACEBOOK'];

    return {
      id: post.id,
      title: post.occasionName || post.template?.title || 'Branded Graphic Post',
      graphicUrl: post.finalGraphicUrl || post.customImageUrl || post.template?.baseImageUrl || null,
      caption: post.captions?.[0]?.captionText || '',
      hashtags: post.captions?.[0]?.hashtags || [],
      festivalName: post.festival?.name || null,
      categoryName: post.category?.name || null,
      createdAt: post.createdAt,
      publishedAt: schedule.publishedAt || post.createdAt,
      targetPlatforms,
      platformResults,
      metrics: {
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        reach: totalReach,
        impressions: totalImpressions,
        totalInteractions,
        engagementRate,
        lastSyncedAt: latestSync || post.createdAt,
      },
      platformBreakdown,
    };
  });

  // Apply sorting when sorting by computed metrics (reach, engagementRate, likes, impressions, etc.)
  if (isRelationalSort) {
    const isAsc = String(sortOrder).toLowerCase() === 'asc';
    formattedPosts.sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case 'reach':
          diff = (b.metrics.reach || 0) - (a.metrics.reach || 0);
          break;
        case 'impressions':
          diff = (b.metrics.impressions || 0) - (a.metrics.impressions || 0);
          break;
        case 'likes':
          diff = (b.metrics.likes || 0) - (a.metrics.likes || 0);
          break;
        case 'comments':
          diff = (b.metrics.comments || 0) - (a.metrics.comments || 0);
          break;
        case 'shares':
          diff = (b.metrics.shares || 0) - (a.metrics.shares || 0);
          break;
        case 'engagementRate':
          diff = (b.metrics.engagementRate || 0) - (a.metrics.engagementRate || 0);
          break;
        default:
          diff = 0;
          break;
      }

      // Tie-breaker when metric values are identical
      if (diff === 0) {
        if (sortBy !== 'engagementRate') {
          diff = (b.metrics.engagementRate || 0) - (a.metrics.engagementRate || 0);
        }
        if (diff === 0) {
          diff = new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
        }
      }

      return isAsc ? -diff : diff;
    });

    const startIndex = (page - 1) * limit;
    const paginatedPosts = formattedPosts.slice(startIndex, startIndex + limit);

    return {
      posts: paginatedPosts,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    };
  }

  return {
    posts: formattedPosts,
    meta: {
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  };
};

/**
 * Trigger immediate real-time sync with Meta Graph API for all user's published posts
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Sync result
 */
export const syncUserAnalytics = async (userId) => {
  const eligiblePosts = await analyticsRepository.findUserPublishedPostsForSync(userId, 20);

  if (eligiblePosts.length === 0) {
    return {
      syncedCount: 0,
      message: 'No published posts available to sync.',
    };
  }

  const { processAnalyticsJob } = await import('../../jobs/workers/analytics.worker.js');

  let syncedCount = 0;
  for (const post of eligiblePosts) {
    const latestSchedule = post.scheduledPost;
    const platformResults = latestSchedule?.platformResults || {};
    const targetPlatforms = latestSchedule?.targetPlatforms?.length > 0
      ? latestSchedule.targetPlatforms
      : Object.keys(platformResults).length > 0
      ? Object.keys(platformResults)
      : ['INSTAGRAM', 'FACEBOOK'];

    try {
      await processAnalyticsJob({
        postId: post.id,
        userId,
        targetPlatforms,
        platformResults,
      });
      syncedCount++;
    } catch (err) {
      logger.warn(`⚠️ [AnalyticsLogic] On-demand sync warning for post ${post.id}:`, err.message);
    }
  }

  await invalidateUserAnalyticsCache(userId);

  return {
    syncedCount,
    message: `Successfully synchronized live metrics for ${syncedCount} post(s) with Meta Graph API!`,
  };
};

/**
 * Backward-compatible logic singleton export
 */
export const analyticsLogic = {
  getOverview,
  getTrends,
  getPlatformBreakdown,
  getTopTemplates,
  getPostsAnalytics,
  syncUserAnalytics,
  seedDemoData,
  invalidateUserAnalyticsCache,
};

