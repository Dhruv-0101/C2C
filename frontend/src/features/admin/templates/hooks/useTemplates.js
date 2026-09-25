import { useQuery } from '@tanstack/react-query';
import { usePaginatedQuery } from '@/shared/hooks/usePaginatedQuery';
import { templateApi } from '@/features/admin/templates/api/template.api';
import { QUERY_KEYS } from '@/shared/constants';

/**
 * Modular Feature Hook for fetching base templates with central pagination.
 *
 * @param {Object} [params={}] - Pagination and filter parameters ({ page, limit, search, festivalId, sortBy, sortOrder })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ templates, meta, isLoading, error, refetch, ... }`
 */
export function useTemplates(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.TEMPLATES.ALL,
    queryFn: (queryParams) => templateApi.getTemplates(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    templates: result.data?.templates || [],
  };
}

// Re-export canonical useTemplateCategories hook
export { useTemplateCategories } from '@/features/admin/template-categories/hooks/useTemplateCategories';

export default useTemplates;
