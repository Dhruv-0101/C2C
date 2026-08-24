import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandKitApi } from '@/services/brandkit.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

/**
 * Custom TanStack Query Hook for AI BrandKit Management
 */
export const useBrandKit = () => {
  const queryClient = useQueryClient();

  const brandKitQuery = useQuery({
    queryKey: QUERY_KEYS.BRANDKIT.MINE,
    queryFn: async () => {
      const response = await brandKitApi.getBrandKit();
      return response.data?.brandKit || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const saveBrandKitMutation = useMutation({
    mutationFn: (data) => brandKitApi.updateBrandKit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDKIT.MINE });
    },
  });

  return {
    brandKit: brandKitQuery.data,
    isLoading: brandKitQuery.isLoading,
    isError: brandKitQuery.isError,
    error: brandKitQuery.error,
    saveBrandKit: saveBrandKitMutation.mutateAsync,
    isSaving: saveBrandKitMutation.isPending,
    saveError: saveBrandKitMutation.error,
  };
};
