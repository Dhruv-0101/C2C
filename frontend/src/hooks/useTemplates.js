import { usePaginatedQuery } from './usePaginatedQuery';
import { templateApi } from '../services/template.api';

/**
 * Modular Feature Hook for fetching base templates with central pagination.
 *
 * @param {Object} [params={}] - Pagination and filter parameters ({ page, limit, search, festivalId, sortBy, sortOrder })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ templates, meta, isLoading, error, refetch, ... }`
 */
export function useTemplates(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: ['templates'],
    queryFn: (queryParams) => templateApi.getTemplates(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    templates: result.data?.templates || [],
  };
}
