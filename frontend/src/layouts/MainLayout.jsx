import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';

export const MainLayout = () => {
  // Persist sidebar collapsed preference in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('sidebar_collapsed', String(nextState));
      return nextState;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      {/* Consistent Left Navigation Sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* Main Workspace Area (Margin Left md:ml-20 vs md:ml-64) */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        } p-4 sm:p-6 lg:p-8 min-h-screen max-w-7xl mx-auto overflow-y-auto`}
      >
        <Outlet />
      </main>
    </div>
  );
};
