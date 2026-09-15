import { analyticsLogic } from './analytics.logic.js';

export const analyticsController = {
  /**
   * Get overview KPI summary metrics
   */
  getOverview: async (req, res, next) => {
    try {
      const data = await analyticsLogic.getOverview(req.user.id, req.query);
      res.status(200).json({
        success: true,
        message: 'Analytics KPI metrics fetched successfully.',
        data: data.kpi,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get daily time-series trends for line charts
   */
  getTrends: async (req, res, next) => {
    try {
      const data = await analyticsLogic.getTrends(req.user.id, req.query);
      res.status(200).json({
        success: true,
        message: 'Daily trend metrics fetched successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get platform distribution breakdown for pie charts
   */
  getPlatformBreakdown: async (req, res, next) => {
    try {
      const data = await analyticsLogic.getPlatformBreakdown(req.user.id, req.query);
      res.status(200).json({
        success: true,
        message: 'Platform breakdown fetched successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get top performing design templates
   */
  getTopTemplates: async (req, res, next) => {
    try {
      const data = await analyticsLogic.getTopTemplates(req.user.id, req.query);
      res.status(200).json({
        success: true,
        message: 'Top templates fetched successfully.',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Seed demo analytics data for local development/testing
   */
  seedDemo: async (req, res, next) => {
    try {
      const result = await analyticsLogic.seedDemoData(req.user.id);
      res.status(200).json({
        success: true,
        message: `Successfully seeded ${result.seededCount} analytics metrics records!`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
