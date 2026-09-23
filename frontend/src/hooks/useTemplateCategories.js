import { usePaginatedQuery } from './usePaginatedQuery';
import { templateCategoryApi } from '../services/templateCategory.api';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Modular Feature Hook for fetching master template categories with pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search, sortBy, sortOrder })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ templateCategories, meta, isLoading, error, refetch, ... }`
 */
export function useTemplateCategories(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.TEMPLATE_CATEGORIES.ALL,
    queryFn: (queryParams) => templateCategoryApi.getTemplateCategories(queryParams),
    params,
    queryOptions,
  });

  const categories = result.data?.categories || [];

  return {
    ...result,
    categories,
    templateCategories: categories,
  };
}
