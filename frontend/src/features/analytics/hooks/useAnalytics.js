import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/features/analytics/api/analytics.api';

export const ANALYTICS_QUERY_KEYS = {
  OVERVIEW: 'analyticsOverview',
  TRENDS: 'analyticsTrends',
  PLATFORMS: 'analyticsPlatforms',
  TOP_TEMPLATES: 'analyticsTopTemplates',
  POSTS: 'analyticsPosts',
};

/**
 * Custom hook for managing analytics dashboard data and queries
 */
export const useAnalytics = ({
  range = '30d',
  platform = 'ALL',
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 10,
} = {}) => {
  const queryClient = useQueryClient();

  const overviewQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW, range, platform],
    queryFn: () => analyticsApi.getOverview({ range, platform }),
    staleTime: 2 * 60 * 1000,
  });

  const trendsQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.TRENDS, range, platform],
    queryFn: () => analyticsApi.getTrends({ range, platform }),
    staleTime: 2 * 60 * 1000,
  });

  const platformsQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.PLATFORMS, range, platform],
    queryFn: () => analyticsApi.getPlatformBreakdown({ range, platform }),
    staleTime: 2 * 60 * 1000,
  });

  const topTemplatesQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.TOP_TEMPLATES],
    queryFn: () => analyticsApi.getTopTemplates({ limit: 5 }),
    staleTime: 2 * 60 * 1000,
  });

  const postsQuery = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.POSTS, range, platform, search, sortBy, sortOrder, page, limit],
    queryFn: () => analyticsApi.getPostsAnalytics({
      range,
      platform,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    }),
    staleTime: 2 * 60 * 1000,
  });

  const syncMutation = useMutation({
    mutationFn: () => analyticsApi.syncAnalytics(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TRENDS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.PLATFORMS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TOP_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.POSTS] });
    },
  });

  const seedDemoMutation = useMutation({
    mutationFn: () => analyticsApi.seedDemo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TRENDS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.PLATFORMS] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.TOP_TEMPLATES] });
      queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEYS.POSTS] });
    },
  });

  return {
    kpi: overviewQuery.data || {},
    trends: trendsQuery.data || [],
    platforms: platformsQuery.data || [],
    topTemplates: topTemplatesQuery.data || [],
    posts: postsQuery.data?.data || postsQuery.data || [],
    postsMeta: postsQuery.data?.meta || { totalCount: 0, page: 1, limit: 10, totalPages: 1 },
    isLoading:
      overviewQuery.isLoading ||
      trendsQuery.isLoading ||
      platformsQuery.isLoading ||
      topTemplatesQuery.isLoading,
    isPostsLoading: postsQuery.isLoading,
    isError: overviewQuery.isError || trendsQuery.isError || postsQuery.isError,
    syncAnalytics: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    seedDemo: seedDemoMutation.mutateAsync,
    isSeeding: seedDemoMutation.isPending,
    refetchAll: () => {
      overviewQuery.refetch();
      trendsQuery.refetch();
      platformsQuery.refetch();
      topTemplatesQuery.refetch();
      postsQuery.refetch();
    },
  };
};

export default useAnalytics;

