import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSubAdminActivityTab } from '@/features/admin/sub-admins/AdminSubAdminActivityTab';

/**
 * AdminSubAdminActivityPage Component
 * Canonical route page for SubAdmin Activity Audit Feed (/admin/subadmin-activity).
 */
export const AdminSubAdminActivityPage = () => {
  const navigate = useNavigate();

  const handleNavigateTab = (tabId) => {
    navigate(`/admin/${tabId}`);
  };

  return <AdminSubAdminActivityTab onNavigateTab={handleNavigateTab} />;
};

export default AdminSubAdminActivityPage;
