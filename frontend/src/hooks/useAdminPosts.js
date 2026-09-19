import { useQuery } from '@tanstack/react-query';
import { usePaginatedQuery } from './usePaginatedQuery.js';
import { postApi } from '../services/post.api';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Modular Feature Hook for Admin to fetch all generated posts with multi-filters and central pagination.
 *
 * @param {Object} [params={}] - Filter and pagination parameters (page, limit, categoryId, frameId, templateId, templateCategoryId, festivalId, userId, status, search, etc.)
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ posts, meta, isLoading, error, refetch, ... }`
 */
export function useAdminPosts(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.POSTS.ADMIN_ALL(params),
    queryFn: (queryParams) => postApi.getAdminPosts(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    posts: result.data?.posts || [],
  };
}

/**
 * Modular Feature Hook for Admin to fetch aggregated volume counts and breakdown metrics.
 * "Kitni bani hai" - Category-wise, Frame-wise, Template-wise, Festival-wise, Status-wise, Top creators.
 *
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ analytics, isLoading, error, refetch, ... }`
 */
export function useAdminPostAnalytics(queryOptions = {}) {
  const result = useQuery({
    queryKey: QUERY_KEYS.POSTS.ANALYTICS,
    queryFn: () => postApi.getAdminPostAnalytics(),
    staleTime: 60 * 1000, // 1 minute fresh cache
    ...queryOptions,
  });

  return {
    ...result,
    analytics: result.data?.data || null,
  };
}
