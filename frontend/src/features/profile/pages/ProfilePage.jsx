import React from "react";
import { useProfile } from '@/features/profile/hooks/useProfile';
import { ProfileView } from "../components/ProfileView";

/**
 * ProfilePage Component
 * Canonical Route Page (/profile) displaying user profile, brand kit summary, and account security.
 */
export const ProfilePage = () => {
  const { profile, subscription, brandKit, isLoading, error } = useProfile();

  return (
    <ProfileView
      profile={profile}
      subscription={subscription}
      brandKit={brandKit}
      isLoading={isLoading}
      error={error}
    />
  );
};

export { ProfilePage as ProfileContainer };
export default ProfilePage;
