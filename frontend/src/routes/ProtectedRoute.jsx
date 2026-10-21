import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Route guard for authenticated pages with role & privilege checks.
 * Enforces authentication, SuperAdmin exclusive access, and SubAdmin granular tab permissions.
 */
export const ProtectedRoute = ({
  requireSuperAdmin,
  requireSubAdmin,
  requireAdmin,
  requireTab,
}) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, isSubAdmin, allowedTabs = [] } = useAuth();
  const location = useLocation();

  // 1. Authentication Check: Guest users cannot access protected routes
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. SuperAdmin Exclusive Guard: SubAdmins and end-users are blocked
  if (requireSuperAdmin && !isSuperAdmin) {
    const fallback = isSubAdmin
      ? (allowedTabs[0] ? `/admin/${allowedTabs[0]}` : '/dashboard')
      : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // 3. SubAdmin Role Guard
  if (requireSubAdmin && !isSubAdmin) {
    const fallback = isSuperAdmin ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  // 4. General Admin Guard (SuperAdmin or SubAdmin required; End-users blocked)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Granular SubAdmin Tab RBAC Guard (SuperAdmin bypasses automatically)
  if (requireTab && !isSuperAdmin) {
    const hasTabPermission = Array.isArray(allowedTabs) && allowedTabs.includes(requireTab);
    if (!hasTabPermission) {
      const fallback = allowedTabs[0] ? `/admin/${allowedTabs[0]}` : '/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
