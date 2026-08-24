import React from "react";
import { DashboardContainer } from "../features/dashboard/containers/DashboardContainer";

/**
 * DashboardPage Wrapper
 * Delegates rendering to DashboardContainer for clean container/presentational separation.
 */
export const DashboardPage = () => {
  return <DashboardContainer />;
};

export default DashboardPage;
