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
  UserPlus,
  Settings,
  LogOut,
  Shield,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logoutState } from '../../store/slices/authSlice';
import { TwoFactorSettingsModal } from './TwoFactorSettingsModal';

export const Sidebar = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutState());
    navigate('/login', { replace: true });
  };

  // Determine Navigation Links based on User Role & SubAdmin allowedTabs
  const getNavItems = () => {
    if (user?.isSuperAdmin) {
      return [
        { label: 'Admin Console', path: '/admin/dashboard', icon: ShieldAlert },
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Users Directory', path: '/admin/dashboard?tab=users', icon: Users },
        { label: 'Base Templates', path: '/admin/dashboard?tab=templates', icon: FileCode2 },
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

  return (
    <>
      {/* Mobile Header Bar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#131B2A] border-b border-[#2C384E]">
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

      {/* Sidebar Desktop Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#131B2A] border-r border-[#2C384E] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo & Role Badge */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-400 flex items-center justify-center font-heading font-extrabold text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              B
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl text-white tracking-tight leading-none">
                Brand<span className="text-amber-400">Flow</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mt-1">
                {user?.isSuperAdmin ? 'SuperAdmin Console' : user?.isSubAdmin ? 'SubAdmin Panel' : 'SMB Workspace'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item.path);

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Footer Actions */}
        <div className="p-4 border-t border-[#2C384E] bg-[#0E1523] space-y-4">
          {/* User Details */}
          <div className="px-2 space-y-1">
            <p className="text-sm font-bold text-white truncate">{user?.fullName || 'BrandFlow User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>

          {/* 2FA Status Trigger */}
          <button
            onClick={() => setIs2FAModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition"
          >
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>2FA Security</span>
            </span>
            {user?.isTwoFactorEnabled ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Active
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                Enable
              </span>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* 2FA Settings Modal */}
      <TwoFactorSettingsModal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} />
    </>
  );
};
