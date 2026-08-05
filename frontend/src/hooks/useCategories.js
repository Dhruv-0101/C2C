import { usePaginatedQuery } from './usePaginatedQuery';
import { categoryApi } from '../services/category.api';

/**
 * Modular Feature Hook for fetching business categories with pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search, sortBy, sortOrder })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ categories, meta, isLoading, error, refetch, ... }`
 */
export function useCategories(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: ['categories'],
    queryFn: (queryParams) => categoryApi.getCategories(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    categories: result.data?.categories || [],
  };
}
