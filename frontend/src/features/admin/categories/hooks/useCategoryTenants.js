import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/features/admin/categories/api/category.api';

/**
 * useCategoryTenants Hook
 * Fetches paginated business tenants belonging to a specific master business category.
 *
 * @param {string} categoryId - UUID of the category
 * @param {Object} [params={}] - Pagination & search params ({ page, limit, search })
 * @param {Object} [options={}] - Additional react-query options
 */
export function useCategoryTenants(categoryId, params = {}, options = {}) {
  const query = useQuery({
    queryKey: ['admin', 'category-tenants', categoryId, params],
    queryFn: async () => {
      const response = await categoryApi.getCategoryTenants(categoryId, params);
      return response;
    },
    enabled: Boolean(categoryId) && (options.enabled !== false),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });

  const tenantsData = query.data?.data?.tenants || query.data?.tenants || [];
  const meta = query.data?.meta || null;
  const category = query.data?.data?.category || null;

  return {
    tenants: tenantsData,
    meta,
    category,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useCategoryTenants;
