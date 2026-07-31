import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Route guard for authenticated pages with role & privilege checks
 */
export const ProtectedRoute = ({ requireSuperAdmin, requireSubAdmin, requireAdmin }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, isSubAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // SuperAdmin privilege required
  if (requireSuperAdmin && !isSuperAdmin) {
    const fallback = isSubAdmin ? '/subadmin/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // SubAdmin privilege required
  if (requireSubAdmin && !isSubAdmin) {
    const fallback = isSuperAdmin ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // Admin privilege required (SuperAdmin or SubAdmin)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
