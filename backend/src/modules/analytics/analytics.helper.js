import { getRedisClient } from '../../config/redis.js';
import { logger } from '../../config/logger.js';
import {
  ANALYTICS_RANGES,
  DEFAULT_ANALYTICS_RANGE,
  ANALYTICS_CACHE_TTL_SECONDS,
} from './analytics.constants.js';

/**
 * 🛡️ Redis Cache: Safely retrieve JSON data from Redis
 *
 * @param {string} key - Cache key
 * @returns {Promise<Object|null>} Cached data or null
 */
export const getFromCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (!redis) return null;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsHelper] Redis cache get error for key ${key}: ${err.message}`);
    return null;
  }
};

/**
 * 🛡️ Redis Cache: Safely store JSON data in Redis with TTL
 *
 * @param {string} key - Cache key
 * @param {any} data - Data to serialize and store
 * @param {number} [ttl=ANALYTICS_CACHE_TTL_SECONDS] - TTL in seconds
 */
export const setInCache = async (key, data, ttl = ANALYTICS_CACHE_TTL_SECONDS) => {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsHelper] Redis cache set error for key ${key}: ${err.message}`);
  }
};

/**
 * 🧹 Invalidate all cached analytics queries for a specific user
 *
 * @param {string} userId - User ID
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
        logger.info(`🧹 [AnalyticsHelper] Purged ${keysToDelete.length} cached keys for user ${userId}`);
      }
    });
  } catch (err) {
    logger.warn(`⚠️ [AnalyticsHelper] Redis cache invalidation error: ${err.message}`);
  }
};

/**
 * Calculate growth percentage difference between current and prior periods
 *
 * @param {number} current - Current period aggregate
 * @param {number} prior - Prior period aggregate
 * @returns {number} Growth percentage
 */
export const calculateGrowthPercentage = (current, prior) => {
  const currVal = Number(current) || 0;
  const priorVal = Number(prior) || 0;

  if (priorVal === 0) {
    return currVal > 0 ? 100 : 0;
  }

  const growth = ((currVal - priorVal) / priorVal) * 100;
  return Number(growth.toFixed(1));
};

/**
 * Calculate Date Thresholds for filter ranges (7d, 30d, 90d)
 *
 * @param {string} [rangeParam='30d'] - Range filter identifier
 * @returns {{ startDate: Date, priorStartDate: Date, days: number }} Date boundaries
 */
export const getDateRanges = (rangeParam = DEFAULT_ANALYTICS_RANGE) => {
  const now = new Date();
  let days = 30;

  if (rangeParam === ANALYTICS_RANGES.SEVEN_DAYS) {
    days = 7;
  } else if (rangeParam === ANALYTICS_RANGES.NINETY_DAYS) {
    days = 90;
  }

  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const priorStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  return { startDate, priorStartDate, days };
};

/**
 * 🛡️ Sanitize KPI overview metrics (OWASP Data Minimization)
 *
 * @param {Object} kpi - Raw KPI aggregate metrics
 * @returns {Object} Sanitized KPI summary
 */
export const sanitizeOverviewKpi = (kpi = {}) => {
  return {
    totalImpressions: Number(kpi.totalImpressions) || 0,
    impressionsGrowth: Number(kpi.impressionsGrowth) || 0,
    totalReach: Number(kpi.totalReach) || 0,
    reachGrowth: Number(kpi.reachGrowth) || 0,
    avgEngagementRate: Number(kpi.avgEngagementRate) || 0,
    engagementGrowth: Number(kpi.engagementGrowth) || 0,
    totalLikes: Number(kpi.totalLikes) || 0,
    totalComments: Number(kpi.totalComments) || 0,
    totalShares: Number(kpi.totalShares) || 0,
    totalClicks: Number(kpi.totalClicks) || 0,
    analyzedPosts: Number(kpi.analyzedPosts) || 0,
  };
};

/**
 * 🛡️ Format and sanitize daily time-series items into trend points
 *
 * @param {Array} rawItems - Daily metrics from database
 * @returns {Array} Formatted time-series points
 */
export const formatDailyTrends = (rawItems = []) => {
  const dateMap = new Map();

  rawItems.forEach((item) => {
    const dateStr = new Date(item.createdAt).toISOString().slice(0, 10);
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, {
        date: dateStr,
        displayDate: new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        impressions: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      });
    }

    const existing = dateMap.get(dateStr);
    existing.impressions += item.impressions || 0;
    existing.reach += item.reach || 0;
    existing.likes += item.likes || 0;
    existing.comments += item.comments || 0;
    existing.shares += item.shares || 0;
  });

  return Array.from(dateMap.values()).map((t) => {
    const totalEngagement = t.likes + t.comments + t.shares;
    const rate = t.reach > 0 ? Number(((totalEngagement / t.reach) * 100).toFixed(2)) : 0;
    return {
      ...t,
      engagement: totalEngagement,
      rate,
    };
  });
};

/**
 * 🛡️ Sanitize platform distribution aggregates
 *
 * @param {Array} rawBreakdown - Database groupby array
 * @returns {Array} Formatted platform breakdown
 */
export const formatPlatformBreakdown = (rawBreakdown = []) => {
  return rawBreakdown.map((item) => ({
    platform: item.platform,
    impressions: item._sum?.impressions || 0,
    reach: item._sum?.reach || 0,
    engagement: (item._sum?.likes || 0) + (item._sum?.comments || 0) + (item._sum?.shares || 0),
    postCount: item._count?.id || 0,
  }));
};
