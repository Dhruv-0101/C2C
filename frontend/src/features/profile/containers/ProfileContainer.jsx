import React from "react";
import { useProfile } from "../../../hooks/useProfile";
import { ProfileView } from "../components/ProfileView";

/**
 * ProfileContainer
 * Container component managing profile data fetching via useProfile hook.
 */
export const ProfileContainer = () => {
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
