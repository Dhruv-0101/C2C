import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../services/post.api";
import { QUERY_KEYS } from "../constants/queryKeys";

/**
 * Custom Hook for managing User Posts, Scheduled Posts Queue, and Manual Dispatch Triggers
 */
export const useYourPosts = () => {
  const queryClient = useQueryClient();

  // Query User All Posts
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: QUERY_KEYS.POSTS.ALL,
    queryFn: () => postApi.getUserPosts(),
  });

  // Query User Scheduled Posts Queue
  const {
    data: scheduledData,
    isLoading: isLoadingScheduled,
    error: scheduledError,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: QUERY_KEYS.POSTS.SCHEDULED,
    queryFn: () => postApi.getScheduledPosts(),
  });

  // Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => postApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.SCHEDULED });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
    },
  });

  // Manual Trigger Mutation for Testing Scheduled Jobs
  const triggerMutation = useMutation({
    mutationFn: () => postApi.triggerScheduledJobs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.SCHEDULED });
    },
  });

  const posts = postsData?.posts || postsData?.data?.posts || [];
  const scheduledPosts = scheduledData?.scheduledPosts || scheduledData?.data?.scheduledPosts || [];

  return {
    posts,
    scheduledPosts,
    isLoading: isLoadingPosts || isLoadingScheduled,
    error: postsError || scheduledError,
    deletePost: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    triggerScheduledJobs: triggerMutation.mutate,
    isTriggering: triggerMutation.isPending,
    refetchAll: () => {
      refetchPosts();
      refetchScheduled();
    },
  };
};
