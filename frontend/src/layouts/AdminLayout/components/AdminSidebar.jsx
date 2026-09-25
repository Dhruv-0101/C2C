import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FileCode2,
  Calendar,
  Layers,
  FolderKanban,
  FolderTree,
  Users,
  Shield,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  CreditCard,
  Activity,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { TwoFactorSettingsModal } from '@/features/auth/components/TwoFactorSettingsModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ADMIN_TABS } from '@/shared/constants';

/**
 * Categorized Navigation Sections for Admin Console
 * Grouped logically with clear visual hierarchy matching enterprise SaaS standards.
 */
const ADMIN_NAVIGATION_SECTIONS = [
  {
    title: "",
    items: [
      { id: ADMIN_TABS.DASHBOARD, label: "Dashboard Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Creative Library",
    items: [
      { id: ADMIN_TABS.TEMPLATES, label: "Graphic Templates", icon: FileCode2 },
      { id: ADMIN_TABS.TEMPLATE_CATEGORIES, label: "Template Categories", icon: FolderTree },
      { id: ADMIN_TABS.FESTIVALS, label: "Festival Calendar", icon: Calendar },
      { id: ADMIN_TABS.FRAMES, label: "Brand Frames Studio", icon: Layers },
      { id: ADMIN_TABS.CATEGORIES, label: "Business Categories", icon: FolderKanban },
    ],
  },
  {
    title: "Users & Governance",
    items: [
      { id: ADMIN_TABS.USERS, label: "Business Users Directory", icon: Users },
      { id: ADMIN_TABS.SUB_ADMINS, label: "SubAdmin Accounts", icon: Shield, superAdminOnly: true },
      { id: ADMIN_TABS.SUB_ADMIN_ACTIVITY, label: "SubAdmin Activity Feed", icon: Activity, superAdminOnly: true },
    ],
  },
  {
    title: "Finance & Post Audits",
    items: [
      { id: ADMIN_TABS.FINANCE, label: "Finance & Revenue", icon: CreditCard, superAdminOnly: true },
      { id: ADMIN_TABS.POSTS, label: "Generated Posts Audit", icon: Sparkles },
    ],
  },
];

/**
 * AdminSidebar Component
 * Enterprise Left Navigation Sidebar for Admin Console.
 * Mirrored with the user workspace aesthetics: rich navy theme, grouped menus,
 * profile card, 2FA status modal, theme toggle, and collapsible responsive drawer.
 */
export const AdminSidebar = ({
  isCollapsed: propCollapsed,
  onToggle,
  isMobileOpen = false,
  setIsMobileOpen,
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const isCollapsed = propCollapsed !== undefined ? propCollapsed : localCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed((prev) => !prev);
    }
  };

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = user?.isSuperAdmin || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const currentTab = searchParams.get("tab") || ADMIN_TABS.DASHBOARD;

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => navigate("/login"),
    });
  };

  // Filter sections and items based on SubAdmin RBAC permissions
  const filteredSections = ADMIN_NAVIGATION_SECTIONS.map((section) => {
    const visibleItems = section.items.filter((item) => {
      if (item.superAdminOnly) return isSuperAdmin;
      if (isSuperAdmin) return true;
      return Array.isArray(user?.allowedTabs) && user.allowedTabs.includes(item.id);
    });
    return { ...section, items: visibleItems };
  }).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#131B2A] border-r border-[#2C384E] transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header Branding */}
        <div
          className={`h-16 flex items-center border-b border-[#2C384E] shrink-0 ${
            isCollapsed && !isMobileOpen ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!isCollapsed || isMobileOpen ? (
            <>
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-glow">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-base tracking-tight text-white leading-none">
                      Brand<span className="text-amber-400">Flow</span>
                    </span>
                    <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1 truncate">
                    {isSuperAdmin ? "SuperAdmin Console" : "SubAdmin Scoped"}
                  </span>
                </div>
              </div>

              {/* Close Button on Mobile / Collapse on Desktop */}
              {isMobileOpen ? (
                <button
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                  title="Close Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleToggle}
                  className="hidden lg:flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleToggle}
              className="hidden lg:flex w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition items-center justify-center group shadow-sm"
              title="Expand Sidebar"
            >
              <Shield className="w-5 h-5 text-amber-400 group-hover:hidden" />
              <ChevronRight className="w-4 h-4 text-amber-400 hidden group-hover:block" />
            </button>
          )}
        </div>

        {/* Categorized Navigation Links List */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto custom-scrollbar">
          {filteredSections.map((section) => (
            <div key={section.title || section.items[0]?.id || "main-section"} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && Boolean(section.title) && (
                <div className="px-3 pb-1.5 pt-1">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    {section.title}
                  </span>
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentTab === item.id ||
                  (item.id === ADMIN_TABS.FESTIVALS && currentTab === "calendar");

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                      isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
                    } ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? "text-slate-950" : "text-slate-400"
                      }`}
                    />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info & Controls */}
        <div className="p-3 border-t border-[#2C384E] space-y-2 shrink-0 bg-[#0B0F17]">
          {/* Admin User Profile Summary Card */}
          {(!isCollapsed || isMobileOpen) && (
            <div
              onClick={() => navigate("/profile")}
              className="p-2.5 rounded-xl bg-[#131B2A] hover:bg-slate-800/80 border border-[#2C384E] hover:border-amber-500/40 flex items-center justify-between transition cursor-pointer group"
              title="Manage Admin Profile"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 truncate transition">
                    {user?.fullName || "Administrator"}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                {isSuperAdmin ? "SUPERADMIN" : "SUBADMIN"}
              </span>
            </div>
          )}
          {/* Theme Toggle Button */}
          <div className="pt-0.5">
            <ThemeToggle className="w-full justify-center" />
          </div>

          {/* 2FA Status Trigger */}
          <button
            onClick={() => setIs2FAModalOpen(true)}
            title={
              isCollapsed && !isMobileOpen
                ? user?.isTwoFactorEnabled
                  ? "2FA Active"
                  : "Enable 2FA"
                : undefined
            }
            className={`w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition cursor-pointer ${
              isCollapsed && !isMobileOpen ? "justify-center p-2" : ""
            }`}
          >
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span>2FA Security</span>}
            </span>
            {(!isCollapsed || isMobileOpen) &&
              (user?.isTwoFactorEnabled ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Active
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Enable
                </span>
              ))}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title={isCollapsed && !isMobileOpen ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-2 p-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition cursor-pointer ${
              isCollapsed && !isMobileOpen ? "justify-center p-2" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* 2FA Settings Modal */}
      <TwoFactorSettingsModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </>
  );
};

export default AdminSidebar;
