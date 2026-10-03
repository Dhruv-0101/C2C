import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { postApi } from '@/features/post-studio/api/post.api';
import { QUERY_KEYS } from '@/shared/constants';

/**
 * Custom Hook for managing User Posts, Scheduled Posts Queue, and Manual Dispatch Triggers with central pagination & multi-filter support
 */
export const useYourPosts = (initialParams = {}) => {
  const queryClient = useQueryClient();

  const [postsPage, setPostsPage] = useState(initialParams.postsPage || 1);
  const [postsLimit, setPostsLimit] = useState(initialParams.postsLimit || 10);

  const [scheduledPage, setScheduledPage] = useState(initialParams.scheduledPage || 1);
  const [scheduledLimit, setScheduledLimit] = useState(initialParams.scheduledLimit || 10);

  const search = initialParams.search || "";
  const status = initialParams.status || "";
  const platform = initialParams.platform || "";
  const timeFilter = initialParams.timeFilter || "";
  const sortBy = initialParams.sortBy || "";
  const sortOrder = initialParams.sortOrder || "";

  // Query User All Posts with Pagination, Search & Enterprise Filters
  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: [
      ...QUERY_KEYS.POSTS.ALL,
      postsPage,
      postsLimit,
      search,
      status,
      platform,
      timeFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      postApi.getUserPosts({
        page: postsPage,
        limit: postsLimit,
        search: search.trim() || undefined,
        status: status || undefined,
        platform: platform || undefined,
        timeFilter: timeFilter || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  // Query User Scheduled Posts Queue with Pagination, Search & Enterprise Filters
  const {
    data: scheduledResponse,
    isLoading: isLoadingScheduled,
    error: scheduledError,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: [
      ...QUERY_KEYS.POSTS.SCHEDULED,
      scheduledPage,
      scheduledLimit,
      search,
      platform,
      timeFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      postApi.getScheduledPosts({
        page: scheduledPage,
        limit: scheduledLimit,
        search: search.trim() || undefined,
        platform: platform || undefined,
        timeFilter: timeFilter || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      }),
    placeholderData: keepPreviousData,
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

  const posts = postsResponse?.posts || postsResponse?.data?.posts || [];
  const postsMeta = postsResponse?.meta;

  const scheduledPosts =
    scheduledResponse?.scheduledPosts ||
    scheduledResponse?.data?.scheduledPosts ||
    [];
  const scheduledMeta = scheduledResponse?.meta;

  const counts =
    postsResponse?.counts ||
    postsResponse?.data?.counts ||
    scheduledResponse?.counts ||
    scheduledResponse?.data?.counts ||
    postsMeta?.counts ||
    scheduledMeta?.counts ||
    null;

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
    counts,
    isLoading: isLoadingPosts || isLoadingScheduled,
    error: postsError || scheduledError,
    deletePost: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    refetchAll: () => {
      refetchPosts();
      refetchScheduled();
    },
  };
};

export default useYourPosts;
