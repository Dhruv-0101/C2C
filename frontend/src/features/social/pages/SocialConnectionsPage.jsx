import React from "react";
import { SocialAccountsManager } from "../components/SocialAccountsManager";

/**
 * SocialConnectionsPage Component
 * Route page component for full-screen Social Media Integrations & Channel Connections.
 */
export const SocialConnectionsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      <SocialAccountsManager />
    </div>
  );
};

export default SocialConnectionsPage;
