import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LogOut, ShieldCheck, User as UserIcon, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../features/auth/hooks/useLogout';
import { Button } from '../ui/Button';
import { TwoFactorSettingsModal } from './TwoFactorSettingsModal';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
  const { isAuthenticated, user, isSuperAdmin, isSubAdmin } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <>
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <div className="text-left text-xs">
            <p className="font-semibold text-slate-200 line-clamp-1">{user?.fullName || user?.email}</p>
            <p className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">Super Admin</p>
          </div>
        </>
      );
    }
    if (isSubAdmin) {
      return (
        <>
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <div className="text-left text-xs">
            <p className="font-semibold text-slate-200 line-clamp-1">{user?.fullName || user?.email}</p>
            <p className="text-[10px] text-teal-400 font-bold tracking-wider uppercase">Sub Admin</p>
          </div>
        </>
      );
    }
    return (
      <>
        <UserIcon className="w-4 h-4 text-slate-400" />
        <div className="text-left text-xs">
          <p className="font-semibold text-slate-200 line-clamp-1">{user?.fullName || user?.email}</p>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">SMB Account</p>
        </div>
      </>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">
              Brand<span className="text-amber-400">Flow</span>
            </span>
          </Link>

          {/* Right Nav Actions */}
          <div className="flex items-center gap-3">
            {/* Global Theme Switcher Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* 2FA Security Modal Trigger */}
                <button
                  onClick={() => setIs2FAModalOpen(true)}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    user?.isTwoFactorEnabled
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                  title={user?.isTwoFactorEnabled ? '2FA Active' : 'Enable 2FA Security'}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {user?.isTwoFactorEnabled ? '2FA Active' : 'Enable 2FA'}
                  </span>
                </button>

                {/* User Role Badge */}
                <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 rounded-xl py-1.5 px-3">
                  {getRoleBadge()}
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  isLoading={isLoggingOut}
                  onClick={() => logout()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2FA Modal */}
      <TwoFactorSettingsModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </>
  );
};
