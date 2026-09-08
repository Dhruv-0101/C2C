import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../services/post.api";
import { QUERY_KEYS } from "../constants/queryKeys";

/**
 * Custom Hook for managing User Posts, Scheduled Posts Queue, and Manual Dispatch Triggers with central pagination
 */
export const useYourPosts = (initialParams = {}) => {
  const queryClient = useQueryClient();

  const [postsPage, setPostsPage] = useState(initialParams.postsPage || 1);
  const [postsLimit, setPostsLimit] = useState(initialParams.postsLimit || 10);

  const [scheduledPage, setScheduledPage] = useState(initialParams.scheduledPage || 1);
  const [scheduledLimit, setScheduledLimit] = useState(initialParams.scheduledLimit || 10);

  // Query User All Posts with Pagination
  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: [...QUERY_KEYS.POSTS.ALL, postsPage, postsLimit],
    queryFn: () => postApi.getUserPosts({ page: postsPage, limit: postsLimit }),
  });

  // Query User Scheduled Posts Queue with Pagination
  const {
    data: scheduledResponse,
    isLoading: isLoadingScheduled,
    error: scheduledError,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: [...QUERY_KEYS.POSTS.SCHEDULED, scheduledPage, scheduledLimit],
    queryFn: () => postApi.getScheduledPosts({ page: scheduledPage, limit: scheduledLimit }),
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

  const posts = postsResponse?.posts || postsResponse?.data?.posts || [];
  const postsMeta = postsResponse?.meta;

  const scheduledPosts = scheduledResponse?.scheduledPosts || scheduledResponse?.data?.scheduledPosts || [];
  const scheduledMeta = scheduledResponse?.meta;

  return {
    posts,
    postsMeta,
    postsPage,
    setPostsPage,
    postsLimit,
    setPostsLimit,
    scheduledPosts,
    scheduledMeta,
    scheduledPage,
    setScheduledPage,
    scheduledLimit,
    setScheduledLimit,
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
