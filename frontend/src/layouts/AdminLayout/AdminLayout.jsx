import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { STORAGE_KEYS } from '@/shared/constants';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';

/**
 * SuperAdmin / SubAdmin dashboard shell (< 80 lines)
 */
export const AdminLayout = () => {
  const { user, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SIDEBAR_COLLAPSED) === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem(STORAGE_KEYS.ADMIN_SIDEBAR_COLLAPSED, String(nextState));
      return nextState;
    });
  };

  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } min-h-screen flex flex-col`}
      >
        <AdminHeader
          user={user}
          isSuperAdmin={isSuperAdmin}
          onOpenMobile={() => setIsMobileOpen(true)}
          onLogout={logout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
