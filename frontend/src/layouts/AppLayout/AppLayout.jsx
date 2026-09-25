import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { STORAGE_KEYS } from '@/shared/constants';

/**
 * Business User Main Workspace Shell
 */
export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextState));
      return nextState;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        } p-4 sm:p-6 lg:p-8 min-h-screen w-full overflow-y-auto`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
