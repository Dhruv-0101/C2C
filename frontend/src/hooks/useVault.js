import { usePaginatedQuery } from "./usePaginatedQuery";
import { vaultApi } from "../services/vault.api";
import { QUERY_KEYS } from "../constants/queryKeys";

/**
 * Modular Feature Hook for fetching user Vault items with central pagination.
 *
 * @param {Object} [params={}] - Pagination parameters ({ page, limit, search })
 * @param {Object} [queryOptions={}] - Additional TanStack Query options
 * @returns {Object} `{ vaultItems, meta, isLoading, error, refetch, ... }`
 */
export function useVault(params = {}, queryOptions = {}) {
  const result = usePaginatedQuery({
    queryKey: QUERY_KEYS.VAULT.ALL,
    queryFn: (queryParams) => vaultApi.getVaultItems(queryParams),
    params,
    queryOptions,
  });

  return {
    ...result,
    vaultItems: result.data?.data || [],
  };
}
