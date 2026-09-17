import { analyticsRepository } from './analytics.repository.js';

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
   * Get overall KPI metrics & growth rates
   */
  getOverview: async (userId, queryParams = {}) => {
    const { startDate, priorStartDate } = getDateRanges(queryParams.range);
    const metrics = await analyticsRepository.getOverviewMetrics(userId, startDate, priorStartDate, queryParams.platform);

    const impressionsGrowth = calculateGrowthPercentage(metrics.current.impressions, metrics.prior.impressions);
    const reachGrowth = calculateGrowthPercentage(metrics.current.reach, metrics.prior.reach);
    const engagementGrowth = calculateGrowthPercentage(metrics.current.engagementRate, metrics.prior.engagementRate);

    return {
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
  },

  /**
   * Get formatted daily time-series trends for line charts
   */
  getTrends: async (userId, queryParams = {}) => {
    const { startDate } = getDateRanges(queryParams.range);
    const items = await analyticsRepository.getDailyTrends(userId, startDate, queryParams.platform);

    // Group items by date string (YYYY-MM-DD)
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

    return trends;
  },

  /**
   * Get platform distribution breakdown for pie charts
   */
  getPlatformBreakdown: async (userId, queryParams = {}) => {
    const { startDate } = getDateRanges(queryParams.range);
    const rawBreakdown = await analyticsRepository.getPlatformBreakdown(userId, startDate, queryParams.platform);

    const breakdown = rawBreakdown.map((item) => ({
      platform: item.platform,
      impressions: item._sum.impressions || 0,
      reach: item._sum.reach || 0,
      engagement: (item._sum.likes || 0) + (item._sum.comments || 0) + (item._sum.shares || 0),
      postCount: item._count.id || 0,
    }));

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
   * Seed demo analytics data
   */
  seedDemoData: async (userId) => {
    return analyticsRepository.seedDemoAnalytics(userId);
  },
};
