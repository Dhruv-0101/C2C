import api from './api.service';

export const analyticsApi = {
  /**
   * Get overview KPI summary metrics
   */
  getOverview: async ({ range = '30d', platform = 'ALL' } = {}) => {
    const response = await api.get('/analytics/overview', {
      params: { range, platform },
    });
    return response.data;
  },

  /**
   * Get daily time-series trend metrics for line charts
   */
  getTrends: async ({ range = '30d', platform = 'ALL' } = {}) => {
    const response = await api.get('/analytics/trends', {
      params: { range, platform },
    });
    return response.data;
  },

  /**
   * Get platform distribution breakdown for donut charts
   */
  getPlatformBreakdown: async ({ range = '30d', platform = 'ALL' } = {}) => {
    const response = await api.get('/analytics/platform-breakdown', {
      params: { range, platform },
    });
    return response.data;
  },

  /**
   * Get top performing design templates
   */
  getTopTemplates: async ({ limit = 5 } = {}) => {
    const response = await api.get('/analytics/top-templates', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Seed demo analytics data for development environment
   */
  seedDemo: async () => {
    const response = await api.post('/analytics/demo-seed');
    return response.data;
  },
};

export default analyticsApi;
