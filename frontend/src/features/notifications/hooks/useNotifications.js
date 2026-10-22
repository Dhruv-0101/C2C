import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Hook for In-App Notification Feed & Actions
 * Manages notification state, unread counts, and read status mutations.
 */
export const useNotifications = (params = { limit: 15 }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications feed
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS.FEED(params),
    queryFn: () => notificationApi.getFeed(params),
    enabled: Boolean(isAuthenticated),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every minute for fresh alerts
    refetchOnWindowFocus: true,
  });

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
  const unreadCount = data?.unreadCount || 0;

  // Mark single notification as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });

  // Mark all unread notifications as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    isError,
    refetch,
    markAsRead: markReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
};

export default useNotifications;
