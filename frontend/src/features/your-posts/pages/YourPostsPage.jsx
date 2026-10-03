import React, { useState, useEffect } from "react";
import { useYourPosts } from '@/features/your-posts/hooks/useYourPosts';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { YourPostsView } from "../components/YourPostsView";

/**
 * YourPostsPage Component
 * Canonical Route Page (/your-posts) displaying tenant generated posts history, scheduled queue, and multi-filter controls.
 */
export const YourPostsPage = () => {
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFT'
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Derive sort fields
  let parsedSortBy = undefined;
  let parsedSortOrder = undefined;
  if (sortBy) {
    if (sortBy === "scheduledAt_desc") {
      parsedSortBy = "scheduledAt";
      parsedSortOrder = "desc";
    } else if (sortBy === "createdAt_desc") {
      parsedSortBy = "createdAt";
      parsedSortOrder = "desc";
    } else if (sortBy === "createdAt_asc") {
      parsedSortBy = "createdAt";
      parsedSortOrder = "asc";
    } else if (sortBy === "occasionName_asc") {
      parsedSortBy = "occasionName";
      parsedSortOrder = "asc";
    }
  }

  const statusParam =
    activeTab === "PUBLISHED" ? "PUBLISHED" : activeTab === "DRAFT" ? "DRAFT" : undefined;

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
    counts,
    isLoading,
    error,
    deletePost,
  } = useYourPosts({
    search: debouncedSearch,
    status: statusParam,
    platform: platform || undefined,
    timeFilter: timeFilter || undefined,
    sortBy: parsedSortBy,
    sortOrder: parsedSortOrder,
  });

  // Auto-reset pagination pages to 1 on filter changes
  useEffect(() => {
    setPostsPage(1);
    setScheduledPage(1);
  }, [debouncedSearch, activeTab, platform, timeFilter, sortBy, setPostsPage, setScheduledPage]);

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
      counts={counts}
      platform={platform}
      setPlatform={setPlatform}
      timeFilter={timeFilter}
      setTimeFilter={setTimeFilter}
      sortBy={sortBy}
      setSortBy={setSortBy}
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

export { YourPostsPage as YourPostsContainer };
export default YourPostsPage;
