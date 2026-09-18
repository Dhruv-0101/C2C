import { usePaginatedQuery } from './usePaginatedQuery.js';
import { authApi } from '../services/auth.api';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Modular Feature Hook for fetching SubAdmin creations and activity feed.
 *
 * @param {Object} [params={}] - Query parameters ({ page, limit, search, subAdminId, type })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ items, summary, meta, isLoading, error, refetch, ... }`
 */
export function useSubAdminActivity(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.SUB_ADMINS.ACTIVITY(params),
    queryFn: (queryParams) => authApi.getSubAdminActivity(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    items: result.data?.data?.items || result.data?.items || [],
    summary: result.data?.data?.summary || result.data?.summary || {
      totalCreations: 0,
      byType: { templates: 0, frames: 0, festivals: 0, categories: 0 },
      subAdmins: [],
    },
  };
}
