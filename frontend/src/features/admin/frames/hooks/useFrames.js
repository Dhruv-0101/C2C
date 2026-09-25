import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { frameApi } from '@/features/admin/frames/api/frame.api';
import { QUERY_KEYS } from '@/shared/constants';

/**
 * Modular Feature Hook for fetching transparent Canva PNG frames with central pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search, sortBy, sortOrder })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ frames, meta, isLoading, error, refetch, ... }`
 */
export function useFrames(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.FRAMES.ALL,
    queryFn: (queryParams) => frameApi.getFrames(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    frames: result.data?.frames || [],
  };
}

export default useFrames;
