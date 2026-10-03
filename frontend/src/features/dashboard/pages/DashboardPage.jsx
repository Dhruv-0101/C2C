import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useYourPosts } from '@/features/your-posts/hooks/useYourPosts';
import { useSocialAccounts } from '@/features/social/hooks/useSocialAccounts';
import { useAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { DashboardView } from "../components/DashboardView";
import { CelebrationWelcomeModal } from '@/features/welcome/components/CelebrationWelcomeModal';

/**
 * DashboardPage Component
 * Canonical Route Page (/dashboard) handling user session stats, recent activities, mixed analytics summary, and welcome celebration modal.
 */
export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { posts, scheduledPosts } = useYourPosts();
  const { accounts } = useSocialAccounts();

  // Fetch real aggregated Meta analytics for the executive dashboard
  const {
    kpi: analyticsKpi,
    platforms: analyticsPlatforms,
    posts: analyticsPosts,
    isLoading: isAnalyticsLoading,
  } = useAnalytics({
    range: '30d',
    platform: 'ALL',
    limit: 4,
  });

  const connectedCount = accounts.filter((a) => a.isConnected).length;
  const activeChannelsCount = connectedCount;

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
        analyticsKpi={analyticsKpi}
        analyticsPlatforms={analyticsPlatforms}
        analyticsPosts={analyticsPosts}
        isAnalyticsLoading={isAnalyticsLoading}
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

export { DashboardPage as DashboardContainer };
export default DashboardPage;
