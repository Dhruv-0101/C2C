import React, { useState } from "react";
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ADMIN_TABS, SUBADMIN_TAB_CONFIG } from '@/shared/constants';
import { SubAdminDashboardView } from "../components/SubAdminDashboardView";

/**
 * SubAdminDashboardPage
 * Canonical Page component handling SubAdmin authorization logic, assigned tabs filtering, and active tab state.
 */
export const SubAdminDashboardPage = () => {
  const { user, allowedTabs = [] } = useAuth();

  const availableTabs = SUBADMIN_TAB_CONFIG.filter(
    (tab) => allowedTabs.includes("all") || allowedTabs.includes(tab.id),
  );

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || ADMIN_TABS.TEMPLATES);

  return (
    <SubAdminDashboardView
      user={user}
      availableTabs={availableTabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
};

export default SubAdminDashboardPage;
