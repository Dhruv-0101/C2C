import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useYourPosts } from "../../../hooks/useYourPosts";
import { useSocialAccounts } from "../../../hooks/useSocialAccounts";
import { DashboardView } from "../components/DashboardView";
import { CelebrationWelcomeModal } from "../../../components/common/CelebrationWelcomeModal";

/**
 * DashboardContainer
 * Container component handling user auth state, live post metrics, workspace actions, and navigation triggers.
 */
export const DashboardContainer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts, scheduledPosts } = useYourPosts();
  const { accounts } = useSocialAccounts();

  const connectedCount = accounts.filter((a) => a.isConnected).length;
  const activeChannelsCount = connectedCount > 0 ? connectedCount : 3;

  const [welcomeAuthType, setWelcomeAuthType] = useState(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    const justAuth = sessionStorage.getItem("just_authenticated");
    if (justAuth) {
      setWelcomeAuthType(justAuth);
      setIsWelcomeModalOpen(true);
      sessionStorage.removeItem("just_authenticated");
    }
  }, []);

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
    <>
      <DashboardView
        user={user}
        handleOpenNewPost={handleOpenNewPost}
        totalPostsCount={posts.length}
        scheduledCount={scheduledPosts.length}
        activeChannelsCount={activeChannelsCount}
        recentPosts={posts.slice(0, 4)}
      />

      <CelebrationWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        authType={welcomeAuthType}
        user={user}
      />
    </>
  );
};
