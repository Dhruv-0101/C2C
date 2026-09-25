import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft, LogOut } from 'lucide-react';

/**
 * Topbar with security status banner, mobile trigger & admin profile actions
 */
export const AdminHeader = ({ user, isSuperAdmin, onOpenMobile, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#131B2A] border-b border-[#2C384E] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left Security Badge & Mobile Drawer Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider hidden sm:inline-block">
          🛡️ BrandFlow Admin Console
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border bg-amber-500/20 text-amber-300 border-amber-500/40">
          {isSuperAdmin ? 'SUPERADMIN PRIVILEGE' : 'SUBADMIN SCOPED'}
        </span>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-3 py-1.5 rounded-xl border border-[#2C384E] bg-[#0B0F17] hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Brand Workspace</span>
        </button>

        <div className="h-4 w-[1px] bg-[#2C384E]" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <span className="text-xs font-bold text-slate-200 hidden md:inline">
            {user?.fullName || 'Admin'}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
