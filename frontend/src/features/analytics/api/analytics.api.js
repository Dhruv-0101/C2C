import api from '../../../shared/http/api.client';
import { API_ENDPOINTS } from '@/shared/http/api.endpoints';

export const analyticsApi = {
  /**
   * Get overview KPI summary metrics
   */
  getOverview: async ({ range = '30d', platform = 'ALL' } = {}) => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.OVERVIEW, {
      params: { range, platform },
    });
    return response.data;
  },

  /**
   * Get daily time-series trend metrics for line charts
   */
  getTrends: async ({ range = '30d', platform = 'ALL' } = {}) => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.TRENDS, {
      params: { range, platform },
    });
    return response.data;
  },

  /**
   * Get platform distribution breakdown for donut charts
   */
  getPlatformBreakdown: async ({ range = '30d', platform = 'ALL' } = {}) => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.PLATFORMS, {
      params: { range, platform },
    });
    return response.data;
  },

  /**
   * Get top performing design templates
   */
  getTopTemplates: async ({ limit = 5, platform = 'ALL' } = {}) => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.TOP_TEMPLATES, {
      params: { limit, platform },
    });
    return response.data;
  },

  /**
   * Get post-level analytics and engagement metrics
   */
  getPostsAnalytics: async ({
    range = '30d',
    platform = 'ALL',
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = {}) => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.POSTS, {
      params: {
        range,
        platform,
        search: search || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      },
    });
    return {
      posts: response.data || [],
      meta: response.meta || {
        totalCount: (response.data || []).length,
        totalItems: (response.data || []).length,
        page,
        limit,
        totalPages: Math.ceil((response.data || []).length / limit) || 1,
      },
    };
  },

  /**
   * Trigger immediate real-time sync with Meta Graph API
   */
  syncAnalytics: async () => {
    const response = await api.post(API_ENDPOINTS.ANALYTICS.SYNC);
    return response.data;
  },

  /**
   * Seed demo analytics data for development environment
   */
  seedDemo: async () => {
    const response = await api.post(API_ENDPOINTS.ANALYTICS.DEMO_SEED);
    return response.data;
  },
};

export default analyticsApi;
