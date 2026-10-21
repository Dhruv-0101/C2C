import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ContentLoader } from '@/components/feedback/ContentLoader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { STORAGE_KEYS } from '@/shared/constants';

/**
 * Business User Main Workspace Shell
 * Keeps Sidebar permanently mounted (0 CLS / 0 flicker) during route chunk transitions.
 * Features in-flow sticky mobile header to guarantee 0 top-overlap and 0 content clipping.
 */
export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { mutate: logout } = useLogout();

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextState));
      return nextState;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        } min-h-screen flex flex-col min-w-0 w-full`}
      >
        {/* Mobile Header Bar - In-flow sticky header so content starts naturally below it */}
        <header className="lg:hidden sticky top-0 z-40 h-14 sm:h-16 bg-[#131B2A] border-b border-[#2C384E] px-3.5 sm:px-4 flex items-center justify-between shadow-lg shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-base sm:text-lg text-white">
              Brand<span className="text-amber-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logout()}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            >
              {isMobileOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 min-[380px]:p-4 sm:p-6 lg:p-8 w-full min-w-0">
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
