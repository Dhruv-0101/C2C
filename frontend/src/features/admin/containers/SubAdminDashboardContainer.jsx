import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { ADMIN_TABS } from "../../../constants/theme.constants";
import { SubAdminDashboardView } from "../components/SubAdminDashboardView";

/**
 * SubAdminDashboardContainer
 * Container component handling SubAdmin authorization logic, assigned tabs filtering, and active tab state.
 */
export const SubAdminDashboardContainer = () => {
  const { user, allowedTabs } = useAuth();

  const availableTabs = ADMIN_TABS.filter(
    (tab) => allowedTabs.includes("all") || allowedTabs.includes(tab.id),
  );

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || "users");

  return (
    <SubAdminDashboardView
      user={user}
      availableTabs={availableTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};
