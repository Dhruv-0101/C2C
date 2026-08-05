import { usePaginatedQuery } from './usePaginatedQuery.js';
import { authApi } from '../services/auth.api';

/**
 * Modular Feature Hook for fetching SubAdmins directory with central pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ subAdmins, meta, isLoading, error, refetch, ... }`
 */
export function useSubAdmins(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: ['subAdmins'],
    queryFn: (queryParams) => authApi.getSubAdmins(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    subAdmins: result.data?.subAdmins || [],
  };
}
