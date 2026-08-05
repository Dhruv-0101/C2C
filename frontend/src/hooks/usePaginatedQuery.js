import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { sanitizePaginationParams } from '../utils/pagination.util';

/**
 * Universal Modular Central Hook for fetching paginated server state via TanStack Query v5.
 *
 * @param {Object} config
 * @param {Array|string} config.queryKey - Base query key (e.g. ['categories']).
 * @param {Function} config.queryFn - API function receiving sanitized pagination params.
 * @param {Object} [config.params={}] - Pagination parameters ({ page, limit, search, sortBy, sortOrder }).
 * @param {Object} [config.queryOptions={}] - Additional TanStack Query options.
 * @returns {Object} Extracted server response data, meta pagination stats, and TanStack Query state.
 */
export function usePaginatedQuery({ queryKey, queryFn, params = {}, queryOptions = {} }) {
  const sanitizedParams = sanitizePaginationParams(params);

  const keyArray = Array.isArray(queryKey) ? queryKey : [queryKey];
  const fullQueryKey = [...keyArray, sanitizedParams];

  const query = useQuery({
    queryKey: fullQueryKey,
    queryFn: () => queryFn(sanitizedParams),
    placeholderData: keepPreviousData,
    ...queryOptions,
  });

  const responseData = query.data?.data || null;
  const meta = query.data?.meta || {
    page: sanitizedParams.page,
    limit: sanitizedParams.limit,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return {
    ...query,
    data: responseData,
    meta,
    page: meta.page,
    limit: meta.limit,
    totalItems: meta.totalItems,
    totalPages: meta.totalPages,
    hasNextPage: meta.hasNextPage,
    hasPrevPage: meta.hasPrevPage,
  };
}
