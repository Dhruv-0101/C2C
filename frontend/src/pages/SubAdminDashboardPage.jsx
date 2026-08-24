import React from "react";
import { SubAdminDashboardContainer } from "../features/admin/containers/SubAdminDashboardContainer";

/**
 * SubAdminDashboardPage Wrapper
 * Delegates rendering to SubAdminDashboardContainer for clean container/presentational separation.
 */
export const SubAdminDashboardPage = () => {
  return <SubAdminDashboardContainer />;
};

export default SubAdminDashboardPage;
