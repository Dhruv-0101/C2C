import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../services/analytics.api';

export const ANALYTICS_QUERY_KEYS = {
  OVERVIEW: 'analyticsOverview',
  TRENDS: 'analyticsTrends',
  PLATFORMS: 'analyticsPlatforms',
  TOP_TEMPLATES: 'analyticsTopTemplates',
};

/**
 * Custom hook for managing analytics dashboard data and queries
 */
export const useAnalytics = ({ range = '30d', platform = 'ALL' } = {}) => {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW, range],
    queryFn: () => analyticsApi.getOverview({ range }),
    staleTime: 5 * 60 * 1000,
  });

  const trendsQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.TRENDS, range, platform],
    queryFn: () => analyticsApi.getTrends({ range, platform }),
    staleTime: 5 * 60 * 1000,
  });

  const platformsQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.PLATFORMS, range],
    queryFn: () => analyticsApi.getPlatformBreakdown({ range }),
    staleTime: 5 * 60 * 1000,
  });

  const topTemplatesQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.TOP_TEMPLATES],
    queryFn: () => analyticsApi.getTopTemplates({ limit: 5 }),
    staleTime: 5 * 60 * 1000,
  });

  const seedDemoMutation = useMutation({
    mutationFn: () => analyticsApi.seedDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TRENDS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.PLATFORMS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TOP_TEMPLATES] });
    },
  });

  return {
    kpi: overviewQuery.data || {},
    trends: trendsQuery.data || [],
    platforms: platformsQuery.data || [],
    topTemplates: topTemplatesQuery.data || [],
    isLoading:
      overviewQuery.isLoading ||
      trendsQuery.isLoading ||
      platformsQuery.isLoading ||
      topTemplatesQuery.isLoading,
    isError: overviewQuery.isError || trendsQuery.isError,
    seedDemo: seedDemoMutation.mutateAsync,
    isSeeding: seedDemoMutation.isPending,
    refetchAll: () => {
      overviewQuery.refetch();
      trendsQuery.refetch();
      platformsQuery.refetch();
      topTemplatesQuery.refetch();
    },
  };
};
