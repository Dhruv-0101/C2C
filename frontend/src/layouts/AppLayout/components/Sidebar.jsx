import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Layers,
  Palette,
  FolderKanban,
  FolderTree,
  Building2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  CheckCircle2,
  Lock,
  Menu,
  X,
  FileCode,
  Users,
  Share2,
  User,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { TwoFactorSettingsModal } from '@/features/auth/components/TwoFactorSettingsModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Sidebar = ({ isCollapsed: propCollapsed, onToggle }) => {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed((prev) => !prev);
    }
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  const { user, isSuperAdmin } = useAuth();
  const { mutate: logout } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => navigate('/login'),
    });
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Festival Calendar', path: '/calendar', icon: Calendar },
    { label: 'Post Studio', path: '/create-post', icon: Sparkles },
    { label: 'Your Posts & Queue', path: '/posts', icon: Share2 },
    { label: 'Graphic Vault', path: '/vault', icon: FolderKanban },
    { label: 'BrandKit', path: '/brandkit', icon: Building2 },
    { label: 'Social Integrations', path: '/connections', icon: Share2 },
    { label: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
  ];



  const isPathActive = (path) => {
    if (path.includes('?tab=')) {
      const [basePath, search] = path.split('?');
      const tabParam = new URLSearchParams(search).get('tab');
      const currentTab = new URLSearchParams(location.search).get('tab') || 'templates';
      return location.pathname === basePath && currentTab === tabParam;
    }
    if (path === '/posts' && (location.pathname === '/posts' || location.pathname === '/your-posts')) {
      return true;
    }
    if (path === '/brandkit' && (location.pathname === '/brandkit' || location.pathname === '/brand-kit')) {
      return true;
    }
    if (path === '/connections' && (location.pathname === '/connections' || location.pathname === '/social')) {
      return true;
    }
    return location.pathname === path;
  };

  const isAdminConsolePathActive = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Mobile Header Bar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#131B2A] border-b border-[#2C384E] px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="font-heading font-extrabold text-lg text-white">
            Brand<span className="text-amber-400">Flow</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="modal-backdrop-overlay lg:hidden fixed inset-0 z-40 animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#131B2A] border-r border-[#2C384E] transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header Banner */}
        <div
          className={`h-16 flex items-center border-b border-[#2C384E] shrink-0 ${
            isCollapsed && !isMobileOpen ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {(!isCollapsed || isMobileOpen) ? (
            <>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white leading-none">
                  Brand<span className="text-amber-400">Flow</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                  Social Media Manager
                </span>
              </div>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={handleToggle}
                className="hidden lg:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleToggle}
              className="hidden lg:flex w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition items-center justify-center group"
              title="Expand Sidebar"
            >
              <span className="font-heading font-extrabold text-xs tracking-tight text-white group-hover:hidden">
                B<span className="text-amber-400">F</span>
              </span>
              <ChevronRight className="w-4 h-4 text-amber-400 hidden group-hover:block" />
            </button>
          )}
        </div>

        {/* Navigation Links List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path);

            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}

          {/* SuperAdmin Console Direct Link (SuperAdmin Only) */}
          {isSuperAdmin && (
            <div className="pt-3 border-t border-[#2C384E]">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3.5 pb-2">
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    Administration
                  </span>
                </div>
              )}

              <NavLink
                to="/admin"
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isAdminConsolePathActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                title={isCollapsed && !isMobileOpen ? "Admin Console" : undefined}
              >
                <ShieldAlert className={`w-5 h-5 shrink-0 ${isAdminConsolePathActive ? 'text-slate-950' : 'text-amber-400'}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate">Admin Console</span>
                )}
              </NavLink>
            </div>
          )}
        </div>

        {/* Sidebar Footer User Info & Actions */}
        <div className="p-3 border-t border-[#2C384E] space-y-2 shrink-0 bg-[#0B0F17]">
          {/* User Profile Summary */}
          {(!isCollapsed || isMobileOpen) && (
            <NavLink
              to="/profile"
              onClick={() => setIsMobileOpen(false)}
              className="p-2.5 rounded-xl bg-[#131B2A] hover:bg-slate-800/80 border border-[#2C384E] hover:border-amber-500/40 flex items-center justify-between transition cursor-pointer group"
              title="View & Manage User Profile"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 truncate transition">
                    {user?.fullName || 'Business Account'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            </NavLink>
          )}

          {/* Theme Toggle Button */}
          <div className="pt-0.5 flex justify-center">
            <ThemeToggle
              showText={!isCollapsed || isMobileOpen}
              className={isCollapsed && !isMobileOpen ? "w-10 h-10 p-0 justify-center rounded-xl" : "w-full justify-center"}
            />
          </div>

          {/* 2FA Status Trigger */}
          <button
            onClick={() => setIs2FAModalOpen(true)}
            title={isCollapsed && !isMobileOpen ? (user?.isTwoFactorEnabled ? '2FA Active' : 'Enable 2FA') : undefined}
            className={`transition cursor-pointer ${
              isCollapsed && !isMobileOpen
                ? "w-10 h-10 p-0 mx-auto flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700"
                : "w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700"
            }`}
          >
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>2FA Security</span>}
            </span>
            {(!isCollapsed || isMobileOpen) && (
              user?.isTwoFactorEnabled ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Active
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Enable
                </span>
              )
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title={isCollapsed && !isMobileOpen ? 'Sign Out' : undefined}
            className={`font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition cursor-pointer ${
              isCollapsed && !isMobileOpen
                ? "w-10 h-10 p-0 mx-auto flex items-center justify-center"
                : "w-full flex items-center gap-2 p-2.5 text-xs"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* 2FA Settings Modal */}
      <TwoFactorSettingsModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />
    </>
  );
};

export default Sidebar;
