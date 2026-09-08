import React, { useState } from "react";
import { useYourPosts } from "../../../hooks/useYourPosts";
import { YourPostsView } from "../components/YourPostsView";

/**
 * YourPostsContainer
 * Container component integrating useYourPosts custom hook with presentational YourPostsView and central pagination.
 */
export const YourPostsContainer = () => {
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFT'
  const [searchQuery, setSearchQuery] = useState("");

  const {
    posts,
    postsMeta,
    postsPage,
    setPostsPage,
    setPostsLimit,
    scheduledPosts,
    scheduledMeta,
    scheduledPage,
    setScheduledPage,
    setScheduledLimit,
    isLoading,
    error,
    deletePost,
    triggerScheduledJobs,
    isTriggering,
  } = useYourPosts();

  return (
    <YourPostsView
      posts={posts}
      postsMeta={postsMeta}
      postsPage={postsPage}
      setPostsPage={setPostsPage}
      setPostsLimit={setPostsLimit}
      scheduledPosts={scheduledPosts}
      scheduledMeta={scheduledMeta}
      scheduledPage={scheduledPage}
      setScheduledPage={setScheduledPage}
      setScheduledLimit={setScheduledLimit}
      isLoading={isLoading}
      error={error}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onDeletePost={deletePost}
      onTriggerScheduled={triggerScheduledJobs}
      isTriggering={isTriggering}
    />
  );
};
