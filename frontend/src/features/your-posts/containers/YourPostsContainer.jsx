import React, { useState, useEffect } from "react";
import { useYourPosts } from "../../../hooks/useYourPosts";
import { useDebounce } from "../../../hooks/useDebounce";
import { YourPostsView } from "../components/YourPostsView";

/**
 * YourPostsContainer
 * Container component integrating useYourPosts custom hook with presentational YourPostsView, debounced server-side search, and central pagination.
 */
export const YourPostsContainer = () => {
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFT'
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const {
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
    isLoading,
    error,
    deletePost,
  } = useYourPosts({
    search: debouncedSearch,
  });

  // Auto-reset pagination pages to 1 on debounced search change or active tab change
  useEffect(() => {
    setPostsPage(1);
    setScheduledPage(1);
  }, [debouncedSearch, activeTab, setPostsPage, setScheduledPage]);

  return (
    <YourPostsView
      posts={posts}
      postsMeta={postsMeta}
      postsPage={postsPage}
      setPostsPage={setPostsPage}
      postsLimit={postsLimit}
      setPostsLimit={setPostsLimit}
      scheduledPosts={scheduledPosts}
      scheduledMeta={scheduledMeta}
      scheduledPage={scheduledPage}
      setScheduledPage={setScheduledPage}
      scheduledLimit={scheduledLimit}
      setScheduledLimit={setScheduledLimit}
      isLoading={isLoading}
      error={error}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onDeletePost={deletePost}
    />
  );
};
