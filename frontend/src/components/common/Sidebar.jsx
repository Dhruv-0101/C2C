import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  Sparkles,
  Palette,
  Share2,
  FolderKanban,
  BarChart3,
  Users,
  FileCode2,
  Send,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  CheckCircle2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Layers,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logoutState } from '../../store/slices/authSlice';
import { TwoFactorSettingsModal } from './TwoFactorSettingsModal';

export const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // State to control Admin Console sub-menu open/close state
  const [isAdminConsoleExpanded, setIsAdminConsoleExpanded] = useState(true);

  const handleLogout = () => {
    dispatch(logoutState());
    navigate('/login', { replace: true });
  };

  // Sub-items list for Admin Console
  const adminConsoleSubItems = [
    { label: 'Master Categories', path: '/admin/dashboard?tab=categories', icon: FolderKanban },
    { label: 'Festivals Calendar', path: '/admin/dashboard?tab=festivals', icon: Calendar },
    { label: 'Base Templates', path: '/admin/dashboard?tab=templates', icon: FileCode2 },
    { label: 'Canva Frames', path: '/admin/dashboard?tab=frames', icon: Layers },
    { label: 'Design Styles', path: '/admin/dashboard?tab=styles', icon: Palette },
    { label: 'SubAdmins Directory', path: '/admin/dashboard?tab=subadmins', icon: Shield },
    { label: 'Users Directory', path: '/admin/dashboard?tab=users', icon: Users },
  ];

  // Determine Navigation Links based on User Role & SubAdmin allowedTabs
  const getNavItems = () => {
    if (user?.isSuperAdmin) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Analytics', path: '/admin/dashboard?tab=analytics', icon: BarChart3 },
        { label: 'Settings', path: '/settings', icon: Settings },
      ];
    }

    if (user?.isSubAdmin) {
      const allowed = user?.allowedTabs || [];
      const subAdminItems = [
        { label: 'SubAdmin Console', path: '/subadmin/dashboard', icon: Shield },
      ];

      if (allowed.includes('users')) {
        subAdminItems.push({ label: 'Users Management', path: '/subadmin/dashboard?tab=users', icon: Users });
      }
      if (allowed.includes('templates')) {
        subAdminItems.push({ label: 'Base Templates', path: '/subadmin/dashboard?tab=templates', icon: FileCode2 });
      }
      if (allowed.includes('posts')) {
        subAdminItems.push({ label: 'Posts & Queue', path: '/subadmin/dashboard?tab=posts', icon: Send });
      }
      if (allowed.includes('analytics')) {
        subAdminItems.push({ label: 'Analytics', path: '/subadmin/dashboard?tab=analytics', icon: BarChart3 });
      }
      if (allowed.includes('billing')) {
        subAdminItems.push({ label: 'Subscriptions', path: '/subadmin/dashboard?tab=billing', icon: CreditCard });
      }

      subAdminItems.push({ label: 'Settings', path: '/settings', icon: Settings });
      return subAdminItems;
    }

    // Default Regular SMB User Menu
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Create Post', path: '/create-post', icon: Sparkles },
      { label: 'Brand Kit', path: '/brand-kit', icon: Palette },
      { label: 'Connections', path: '/connections', icon: Share2 },
      { label: 'Content Vault', path: '/vault', icon: FolderKanban },
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'Settings', path: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const isPathActive = (itemPath) => {
    if (itemPath.includes('?tab=')) {
      return location.pathname + location.search === itemPath;
    }
    return location.pathname === itemPath;
  };

  const isAdminConsolePathActive = location.pathname.startsWith('/admin/dashboard');

  return (
    <>
      {/* Mobile Header Bar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#131B2A] border-b border-[#2C384E] w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center font-heading font-extrabold text-slate-950 text-lg shadow-md">
            B
          </div>
          <span className="font-heading font-bold text-lg text-white tracking-tight">BrandFlow</span>
        </div>
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Overlay Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#131B2A] border-r border-[#2C384E] flex flex-col justify-between transition-all duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top Logo & Collapse Toggle */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center font-heading font-extrabold text-slate-950 text-xl shadow-lg shadow-amber-500/20 shrink-0">
                B
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="animate-in fade-in duration-200">
                  <h1 className="font-heading font-extrabold text-xl text-white tracking-tight leading-none">
                    Brand<span className="text-amber-400">Flow</span>
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-1">
                    {user?.isSuperAdmin ? 'SuperAdmin Console' : user?.isSubAdmin ? 'SubAdmin Panel' : 'SMB Workspace'}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={onToggle}
              className="hidden md:flex p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-amber-500/40 transition shrink-0"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4 text-amber-400" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1.5 pt-2">
            {/* SuperAdmin Exclusive: Collapsible Admin Console Sub-menu */}
            {user?.isSuperAdmin && (
              <div className="space-y-1">
                {/* Admin Console Root Header Toggle */}
                <button
                  onClick={() => setIsAdminConsoleExpanded((prev) => !prev)}
                  title={isCollapsed && !isMobileOpen ? 'Admin Console' : undefined}
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
                      <span className="truncate animate-in fade-in duration-200">Admin Console</span>
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

                {/* Sub-menu Dropdown List */}
                {isAdminConsoleExpanded && (!isCollapsed || isMobileOpen) && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-800/80 ml-4 animate-in fade-in slide-in-from-top-2 duration-200">
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
                          <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="truncate">{subItem.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Other Top-Level Nav Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item.path);

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
                  } ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate animate-in fade-in duration-200">{item.label}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Footer Actions */}
        <div className="p-3 border-t border-[#2C384E] bg-[#0E1523] space-y-3">
          {/* User Details */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-2 space-y-0.5 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'BrandFlow User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          )}

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
