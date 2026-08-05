import { usePaginatedQuery } from './usePaginatedQuery.js';
import { authApi } from '../services/auth.api';

/**
 * Modular Feature Hook for fetching registered end-users directory with central pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ users, meta, isLoading, error, refetch, ... }`
 */
export function useUsers(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: ['users'],
    queryFn: (queryParams) => authApi.getUsers(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    users: result.data?.users || [],
  };
}
