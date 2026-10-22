import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft, LogOut } from 'lucide-react';
import { NotificationBell } from '@/features/notifications';

/**
 * Topbar with security status banner, mobile trigger & admin profile actions
 */
export const AdminHeader = ({ user, isSuperAdmin, onOpenMobile, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#131B2A] border-b border-[#2C384E] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md min-w-0">
      {/* Left Security Badge & Mobile Drawer Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>
        <span className="flex h-2.5 w-2.5 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider hidden sm:inline-block truncate">
          BrandFlow Admin Console
        </span>
        <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-extrabold border bg-amber-500/20 text-amber-300 border-amber-500/40 shrink-0">
          {isSuperAdmin ? (
            <>
              <span className="inline min-[400px]:hidden">SUPER</span>
              <span className="hidden min-[400px]:inline">SUPERADMIN PRIVILEGE</span>
            </>
          ) : (
            <>
              <span className="inline min-[400px]:hidden">SUBADMIN</span>
              <span className="hidden min-[400px]:inline">SUBADMIN SCOPED</span>
            </>
          )}
        </span>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <NotificationBell />

        <button
          onClick={() => navigate('/dashboard')}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#2C384E] bg-[#0B0F17] hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          title="Return to Brand Workspace"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden md:inline">Brand Workspace</span>
        </button>

        <div className="h-4 w-[1px] bg-[#2C384E] hidden min-[360px]:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <span className="text-xs font-bold text-slate-200 hidden lg:inline max-w-[120px] truncate">
            {user?.fullName || 'Admin'}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
