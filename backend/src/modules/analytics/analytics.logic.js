import { analyticsRepository } from './analytics.repository.js';
import { getRedisClient } from '../../config/redis.js';
import { logger } from '../../config/logger.js';

const CACHE_TTL_SECONDS = 900; // 15 minutes TTL

/**
 * Helper: Safely retrieve JSON data from Redis cache
 */
const getFromCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis) return null;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsLogic] Redis cache get error for key ${key}: ${err.message}`);
    return null;
  }
};

/**
 * Helper: Safely store JSON data in Redis cache with TTL
 */
const setInCache = async (key, data, ttl = CACHE_TTL_SECONDS) => {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsLogic] Redis cache set error for key ${key}: ${err.message}`);
  }
};

/**
 * Invalidate all cached analytics queries for a specific user
 */
export const invalidateUserAnalyticsCache = async (userId) => {
  try {
    const redis = getRedisClient();
    if (!redis || !userId) return;

    const stream = redis.scanStream({
      match: `analytics:*:${userId}:*`,
      count: 50,
    });

    const keysToDelete = [];
    stream.on('data', (resultKeys) => {
      keysToDelete.push(...resultKeys);
    });

    stream.on('end', async () => {
      if (keysToDelete.length > 0) {
        await redis.del(...keysToDelete);
        logger.info(`🧹 [AnalyticsLogic] Cleaned ${keysToDelete.length} cached keys for user ${userId}`);
      }
    });
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsLogic] Redis cache invalidation error: ${err.message}`);
  }
};

/**
 * Helper: Calculate growth percentage difference between current and prior period
 */
const calculateGrowthPercentage = (current, prior) => {
  if (prior === 0) return current > 0 ? 100 : 0;
  const growth = ((current - prior) / prior) * 100;
  return Number(growth.toFixed(1));
};

/**
 * Helper: Get Date Threshold for filter ranges (7d, 30d, 90d)
 */
const getDateRanges = (rangeParam = '30d') => {
  const now = new Date();
  let days = 30;

  if (rangeParam === '7d') days = 7;
  else if (rangeParam === '90d') days = 90;

  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const priorStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  return { startDate, priorStartDate, days };
};

export const analyticsLogic = {
  /**
   * Get overall KPI metrics & growth rates (Redis Cached)
   */
  getOverview: async (userId, queryParams = {}) => {
    const range = queryParams.range || '30d';
    const platform = queryParams.platform || 'ALL';
    const cacheKey = `analytics:overview:${userId}:${range}:${platform}`;

    // 1. Check Redis Cache
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 2. Database Aggregation Scan
    const { startDate, priorStartDate } = getDateRanges(range);
    const metrics = await analyticsRepository.getOverviewMetrics(userId, startDate, priorStartDate, platform);

    const impressionsGrowth = calculateGrowthPercentage(metrics.current.impressions, metrics.prior.impressions);
    const reachGrowth = calculateGrowthPercentage(metrics.current.reach, metrics.prior.reach);
    const engagementGrowth = calculateGrowthPercentage(metrics.current.engagementRate, metrics.prior.engagementRate);

    const response = {
      kpi: {
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
      },
    };

    // 3. Populate Redis Cache
    await setInCache(cacheKey, response, CACHE_TTL_SECONDS);

    return response;
  },

  /**
   * Get formatted daily time-series trends for line charts (Redis Cached)
   */
  getTrends: async (userId, queryParams = {}) => {
    const range = queryParams.range || '30d';
    const platform = queryParams.platform || 'ALL';
    const cacheKey = `analytics:trends:${userId}:${range}:${platform}`;

    // 1. Check Redis Cache
    const cachedTrends = await getFromCache(cacheKey);
    if (cachedTrends) {
      return cachedTrends;
    }

    // 2. Database Timeseries Scan
    const { startDate } = getDateRanges(range);
    const items = await analyticsRepository.getDailyTrends(userId, startDate, platform);

    const dateMap = new Map();
    items.forEach((item) => {
      const dateStr = new Date(item.createdAt).toISOString().slice(0, 10);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {
          date: dateStr,
          displayDate: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          impressions: 0,
          reach: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        });
      }

      const existing = dateMap.get(dateStr);
      existing.impressions += item.impressions;
      existing.reach += item.reach;
      existing.likes += item.likes;
      existing.comments += item.comments;
      existing.shares += item.shares;
    });

    const trends = Array.from(dateMap.values()).map((t) => ({
      ...t,
      engagement: t.likes + t.comments + t.shares,
      rate: t.reach > 0 ? Number((((t.likes + t.comments + t.shares) / t.reach) * 100).toFixed(2)) : 0,
    }));

    // 3. Populate Redis Cache
    await setInCache(cacheKey, trends, CACHE_TTL_SECONDS);

    return trends;
  },

  /**
   * Get platform distribution breakdown for pie charts (Redis Cached)
   */
  getPlatformBreakdown: async (userId, queryParams = {}) => {
    const range = queryParams.range || '30d';
    const platform = queryParams.platform || 'ALL';
    const cacheKey = `analytics:breakdown:${userId}:${range}:${platform}`;

    // 1. Check Redis Cache
    const cachedBreakdown = await getFromCache(cacheKey);
    if (cachedBreakdown) {
      return cachedBreakdown;
    }

    // 2. Database GroupBy Query
    const { startDate } = getDateRanges(range);
    const rawBreakdown = await analyticsRepository.getPlatformBreakdown(userId, startDate, platform);

    const breakdown = rawBreakdown.map((item) => ({
      platform: item.platform,
      impressions: item._sum.impressions || 0,
      reach: item._sum.reach || 0,
      engagement: (item._sum.likes || 0) + (item._sum.comments || 0) + (item._sum.shares || 0),
      postCount: item._count.id || 0,
    }));

    // 3. Populate Redis Cache
    await setInCache(cacheKey, breakdown, CACHE_TTL_SECONDS);

    return breakdown;
  },

  /**
   * Get top performing design templates
   */
  getTopTemplates: async (userId, queryParams = {}) => {
    const limit = Number(queryParams.limit) || 5;
    return analyticsRepository.getTopTemplates(userId, limit);
  },

  /**
   * Seed demo analytics data and invalidate user cache
   */
  seedDemoData: async (userId) => {
    const result = await analyticsRepository.seedDemoAnalytics(userId);
    await invalidateUserAnalyticsCache(userId);
    return result;
  },
};
