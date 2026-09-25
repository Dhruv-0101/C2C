import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * RBAC Role Route Guard
 * Enforces allowed roles (e.g. ['ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'])
 */
export const RoleRoute = ({ allowedRoles = [], fallbackPath = '/dashboard' }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || 'USER';
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
