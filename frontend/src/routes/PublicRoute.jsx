import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Route guard for guest/public pages (Login, Register).
 * Redirects authenticated users away to their role dashboard.
 */
export const PublicRoute = () => {
  const { isAuthenticated, isSuperAdmin, isSubAdmin } = useAuth();

  if (isAuthenticated) {
    if (isSuperAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (isSubAdmin) {
      return <Navigate to="/subadmin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
