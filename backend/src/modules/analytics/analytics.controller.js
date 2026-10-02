import { HTTP_STATUS } from '../../common/constants/http-status.js';
import { sendSuccessResponse } from '../../common/utils/response.util.js';
import {
  getOverview as getOverviewLogic,
  getTrends as getTrendsLogic,
  getPlatformBreakdown as getPlatformBreakdownLogic,
  getTopTemplates as getTopTemplatesLogic,
  getPostsAnalytics as getPostsAnalyticsLogic,
  syncUserAnalytics as syncUserAnalyticsLogic,
  seedDemoData as seedDemoDataLogic,
} from './analytics.logic.js';

/**
 * Get overview KPI summary metrics
 */
export const getOverview = async (req, res, next) => {
  try {
    const data = await getOverviewLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Analytics KPI metrics fetched successfully.',
      data: data.kpi,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get daily time-series trends for line charts
 */
export const getTrends = async (req, res, next) => {
  try {
    const data = await getTrendsLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Daily trend metrics fetched successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get platform distribution breakdown for pie charts
 */
export const getPlatformBreakdown = async (req, res, next) => {
  try {
    const data = await getPlatformBreakdownLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Platform breakdown fetched successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get top performing design templates
 */
export const getTopTemplates = async (req, res, next) => {
  try {
    const data = await getTopTemplatesLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Top templates fetched successfully.',
      data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get individual post-level analytics and breakdown
 */
export const getPostsAnalytics = async (req, res, next) => {
  try {
    const data = await getPostsAnalyticsLogic(req.user.id, req.query);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Post analytics list fetched successfully.',
      data: data.posts,
      meta: data.meta,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Trigger real-time on-demand Meta Graph API sync for user's published posts
 */
export const syncAnalytics = async (req, res, next) => {
  try {
    const result = await syncUserAnalyticsLogic(req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Seed demo analytics data for local development/testing
 */
export const seedDemo = async (req, res, next) => {
  try {
    const result = await seedDemoDataLogic(req.user.id);
    return sendSuccessResponse(res, {
      statusCode: HTTP_STATUS.OK,
      message: `Successfully seeded ${result.seededCount} analytics metrics records!`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Backward-compatible controller singleton export
 */
export const analyticsController = {
  getOverview,
  getTrends,
  getPlatformBreakdown,
  getTopTemplates,
  getPostsAnalytics,
  syncAnalytics,
  seedDemo,
};

