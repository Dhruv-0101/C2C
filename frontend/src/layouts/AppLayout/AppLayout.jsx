import React, { useState, Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X, LogOut, Zap, Lock, ShieldCheck } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ContentLoader } from '@/components/feedback/ContentLoader';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { NotificationBell } from '@/features/notifications';
import PlanSelectionModal from '@/features/billing/components/PlanSelectionModal';
import PaymentSuccessModal from '@/features/billing/components/PaymentSuccessModal';
import { STORAGE_KEYS } from '@/shared/constants';

/**
 * Business User Main Workspace Shell
 * Keeps Sidebar permanently mounted during route chunk transitions.
 * Features unified sticky header across mobile & desktop with notification center,
 * subscription status, theme toggling, and fast workspace navigation.
 */
export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  const {
    postsRemaining,
    isExpired,
    hasPlan,
    hasClaimedFree,
    planName,
    isPlanModalOpen,
    openPlanModal,
    closePlanModal,
    successData,
    setSuccessData,
  } = useSubscription();

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextState));
      return nextState;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      {/* Sidebar Navigation */}
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
        {/* Unified Top Sticky Header (Desktop & Mobile) */}
        <header className="sticky top-0 z-40 h-14 sm:h-16 bg-[#131B2A]/90 backdrop-blur-md border-b border-[#2C384E] px-3.5 sm:px-6 flex items-center justify-between shadow-lg shrink-0">
          {/* Left Title / Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="lg:hidden p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-heading font-extrabold text-base sm:text-lg text-white shrink-0">
                Brand<span className="text-amber-400">Flow</span>
              </span>
              <span className="hidden sm:inline-block text-slate-600">/</span>
              <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span className="text-xs font-semibold text-slate-400 truncate">
                  Brand Workspace
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Subscription Plan Quick Badge */}
            <button
              type="button"
              onClick={openPlanModal}
              className={`hidden sm:flex px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition items-center gap-1.5 cursor-pointer shadow-md ${
                !hasPlan
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 hover:bg-amber-500/30 animate-pulse'
                  : isExpired
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 hover:bg-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
              }`}
              title="Manage Subscription Plan"
            >
              {!hasPlan ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Select Plan</span>
                </>
              ) : isExpired ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Expired</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span>{postsRemaining} left</span>
                </>
              )}
            </button>

            {/* 🔔 1-Day Festival & Web Push Notification Bell */}
            <NotificationBell />

            {/* Global Theme Toggle */}
            <ThemeToggle />

            {/* Profile Avatar Quick Link on Desktop */}
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition text-xs font-bold text-slate-200"
              title="Manage Profile"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="max-w-[100px] truncate">{user?.fullName || 'Profile'}</span>
            </Link>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => logout()}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-3 min-[380px]:p-4 sm:p-6 lg:p-8 w-full min-w-0">
          <Suspense fallback={<ContentLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Subscription & Payment Modals */}
      <PlanSelectionModal
        isOpen={isPlanModalOpen}
        onClose={closePlanModal}
        currentPlan={planName}
        postsRemaining={postsRemaining}
        hasClaimedFree={hasClaimedFree}
        onSuccess={(resData) => setSuccessData(resData)}
      />

      <PaymentSuccessModal
        isOpen={Boolean(successData)}
        onClose={() => setSuccessData(null)}
        data={successData}
      />
    </div>
  );
};

export default AppLayout;
