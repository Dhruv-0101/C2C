import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { authApi } from '@/features/auth/api/auth.api';
import { QUERY_KEYS } from '@/shared/constants';

/**
 * Modular Feature Hook for fetching SubAdmins directory with central pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ subAdmins, meta, isLoading, error, refetch, ... }`
 */
export function useSubAdmins(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.SUB_ADMINS.ALL,
    queryFn: (queryParams) => authApi.getSubAdmins(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    subAdmins: result.data?.subAdmins || [],
  };
}

export default useSubAdmins;
