import React from "react";
import { AdminDashboardContainer } from "../features/admin/containers/AdminDashboardContainer";

/**
 * AdminDashboardPage Wrapper
 * Transparently renders AdminDashboardContainer for clean separation of concerns.
 */
export const AdminDashboardPage = () => {
  return <AdminDashboardContainer />;
};

export default AdminDashboardPage;
