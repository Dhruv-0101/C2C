import { usePaginatedQuery } from './usePaginatedQuery';
import { frameApi } from '../services/frame.api';

/**
 * Modular Feature Hook for fetching transparent Canva PNG frames with central pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search, sortBy, sortOrder })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ frames, meta, isLoading, error, refetch, ... }`
 */
export function useFrames(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: ['frames'],
    queryFn: (queryParams) => frameApi.getFrames(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    frames: result.data?.frames || [],
  };
}
