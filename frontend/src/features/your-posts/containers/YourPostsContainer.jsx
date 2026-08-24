import React, { useState } from "react";
import { useYourPosts } from "../../../hooks/useYourPosts";
import { YourPostsView } from "../components/YourPostsView";

/**
 * YourPostsContainer
 * Container component integrating useYourPosts custom hook with presentational YourPostsView.
 */
export const YourPostsContainer = () => {
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'DRAFT'
  const [searchQuery, setSearchQuery] = useState("");

  const {
    posts,
    scheduledPosts,
    isLoading,
    error,
    deletePost,
    triggerScheduledJobs,
    isTriggering,
  } = useYourPosts();

  return (
    <YourPostsView
      posts={posts}
      scheduledPosts={scheduledPosts}
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
