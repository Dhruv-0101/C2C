import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useYourPosts } from "../../../hooks/useYourPosts";
import { DashboardView } from "../components/DashboardView";

/**
 * DashboardContainer
 * Container component handling user auth state, live post metrics, workspace actions, and navigation triggers.
 */
export const DashboardContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts, scheduledPosts } = useYourPosts();

  const handleOpenNewPost = (template = null) => {
    if (template?.id) {
      navigate(`/create-post?templateId=${template.id}`, {
        state: { template },
      });
    } else {
      navigate("/create-post");
    }
  };

  return (
    <DashboardView
      user={user}
      handleOpenNewPost={handleOpenNewPost}
      totalPostsCount={posts.length}
      scheduledCount={scheduledPosts.length}
      recentPosts={posts.slice(0, 4)}
    />
  );
};
