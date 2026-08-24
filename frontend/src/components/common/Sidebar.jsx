import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Layers,
  Palette,
  FolderKanban,
  Building2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  CheckCircle2,
  Lock,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  FileCode,
  Users,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../features/auth/hooks/useLogout';
import { TwoFactorSettingsModal } from './TwoFactorSettingsModal';
import { ThemeToggle } from './ThemeToggle';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isAdminConsoleExpanded, setIsAdminConsoleExpanded] = useState(true);

  const { user, isSuperAdmin, isSubAdmin } = useAuth();
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
    { label: 'AI BrandKit Manager', path: '/brandkit', icon: Building2 },
    { label: 'Post Creator Studio', path: '/create-post', icon: Sparkles },
    { label: 'Your Posts & Queue', path: '/posts', icon: Share2 },
    { label: 'Festival Calendar', path: '/calendar', icon: Calendar },
    { label: 'Canva Vector Frames', path: '/frames', icon: Layers },
    { label: 'Design Styles Engine', path: '/design-styles', icon: Palette },
    { label: 'Graphic Vault', path: '/vault', icon: FolderKanban },
  ];

  const adminConsoleAllSubItems = [
    { id: 'templates', label: 'AI Base Templates', path: '/admin?tab=templates', icon: PlusCircle },
    { id: 'festivals', label: 'Festival Calendar', path: '/admin?tab=festivals', icon: Calendar },
    { id: 'frames', label: 'Canva Vector Frames', path: '/admin?tab=frames', icon: Layers },
    { id: 'styles', label: 'Design System & Palettes', path: '/admin?tab=styles', icon: Palette },
    { id: 'categories', label: 'Business Categories', path: '/admin?tab=categories', icon: FolderKanban },
    { id: 'subadmins', label: 'SubAdmin Directory', path: '/admin?tab=subadmins', icon: ShieldAlert, superAdminOnly: true },
    { id: 'users', label: 'SMB User Directory', path: '/admin?tab=users', icon: Users },
  ];

  // RBAC Permission Filter for SubAdmins vs SuperAdmins
  const adminConsoleSubItems = isSuperAdmin
    ? adminConsoleAllSubItems
    : adminConsoleAllSubItems.filter((item) =>
        !item.superAdminOnly && Array.isArray(user?.allowedTabs) && user.allowedTabs.includes(item.id)
      );

  const isPathActive = (path) => {
    if (path.includes('?tab=')) {
      const [basePath, search] = path.split('?');
      const tabParam = new URLSearchParams(search).get('tab');
      const currentTab = new URLSearchParams(location.search).get('tab') || 'templates';
      return location.pathname === basePath && currentTab === tabParam;
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
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in"
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
        <div className="p-4 border-b border-[#2C384E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {(!isCollapsed || isMobileOpen) ? (
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg tracking-tight text-white leading-none">
                  Brand<span className="text-amber-400">Flow</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                  AI Social Manager
                </span>
              </div>
            ) : (
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                B<span className="text-amber-400">F</span>
              </span>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
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

          {/* SuperAdmin & SubAdmin Console Dropdown Root */}
          {(isSuperAdmin || isSubAdmin) && (
            <div className="pt-3 border-t border-[#2C384E]">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3.5 pb-2">
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    Administration
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <button
                  onClick={() => {
                    if (isCollapsed && !isMobileOpen) {
                      navigate('/admin');
                    } else {
                      setIsAdminConsoleExpanded(!isAdminConsoleExpanded);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
                  } ${
                    isAdminConsolePathActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <ShieldAlert className={`w-5 h-5 shrink-0 ${isAdminConsolePathActive ? 'text-slate-950' : 'text-amber-400'}`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">Admin Console</span>
                    )}
                  </div>
                  {(!isCollapsed || isMobileOpen) && (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isAdminConsoleExpanded ? 'rotate-180' : ''
                      } ${isAdminConsolePathActive ? 'text-slate-950' : 'text-slate-400'}`}
                    />
                  )}
                </button>

                {/* Sub-menu Dropdown List (RBAC Filtered) */}
                {isAdminConsoleExpanded && (!isCollapsed || isMobileOpen) && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-800/80 ml-4">
                    {adminConsoleSubItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = isPathActive(subItem.path);

                      return (
                        <NavLink
                          key={subItem.label}
                          to={subItem.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                            isSubActive
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="truncate">{subItem.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer User Info & Actions */}
        <div className="p-3 border-t border-[#2C384E] space-y-2 shrink-0 bg-[#0B0F17]">
          {/* User Profile Summary */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#2C384E] flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-100 truncate">
                    {user?.fullName || 'Business Account'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Theme Toggle Button */}
          <div className="pt-1">
            <ThemeToggle className="w-full justify-center" />
          </div>

          {/* 2FA Status Trigger */}
          <button
            onClick={() => setIs2FAModalOpen(true)}
            title={isCollapsed && !isMobileOpen ? (user?.isTwoFactorEnabled ? '2FA Active' : 'Enable 2FA') : undefined}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition ${
              isCollapsed && !isMobileOpen ? 'justify-center p-2' : ''
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
            className={`w-full flex items-center gap-2 p-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition ${
              isCollapsed && !isMobileOpen ? 'justify-center p-2' : ''
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
