import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/features/auth/api/auth.api';

export const USER_PROFILE_QUERY_KEY = ['userProfile'];

/**
 * Custom hook to fetch and manage user profile, subscription & brandkit details
 */
export function useProfile() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const res = await authApi.getProfile();
      return res.data?.data?.user || res.data?.user || res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    profile: data,
    subscription: data?.subscription || null,
    brandKit: data?.brandKit || null,
    isLoading,
    error,
    refetch,
  };
}

export default useProfile;
