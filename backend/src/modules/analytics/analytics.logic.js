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
import {
  getOverviewMetrics,
  getDailyTrends,
  getPlatformBreakdown as getPlatformBreakdownRepo,
  getTopTemplates as getTopTemplatesRepo,
  seedDemoAnalytics,
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
 * Get top performing design templates
 *
 * @param {string} userId - User ID
 * @param {Object} [queryParams={}] - Query parameters { limit }
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
  return getTopTemplatesRepo(userId, limit);
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
 * Backward-compatible logic singleton export
 */
export const analyticsLogic = {
  getOverview,
  getTrends,
  getPlatformBreakdown,
  getTopTemplates,
  seedDemoData,
  invalidateUserAnalyticsCache,
};
