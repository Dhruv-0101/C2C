import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      {/* Consistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Area (Margin Left md:ml-64) */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen max-w-7xl mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
