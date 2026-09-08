import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FileCode2,
  Calendar,
  Layers,
  Palette,
  FolderKanban,
  Users,
  Shield,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

const ADMIN_NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "templates", label: "Graphic Templates", icon: FileCode2 },
  { id: "festivals", label: "Festival Calendar", icon: Calendar },
  { id: "frames", label: "Brand Frames Studio", icon: Layers },
  { id: "styles", label: "Design System & Palettes", icon: Palette },
  { id: "categories", label: "Business Categories", icon: FolderKanban },
  { id: "users", label: "Business User Directory", icon: Users },
  { id: "subadmins", label: "SubAdmin Directory", icon: Shield, superAdminOnly: true },
];

/**
 * AdminSidebar Component
 * Dedicated left navigation bar exclusively for Admin Console operations.
 */
export const AdminSidebar = ({ isCollapsed, onToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = user?.isSuperAdmin || user?.role === "ADMIN";
  const currentTab = searchParams.get("tab") || "dashboard";

  // Filter visible tabs based on SubAdmin RBAC permissions
  const visibleNavItems = ADMIN_NAVIGATION_ITEMS.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (isSuperAdmin) return true;
    return Array.isArray(user?.allowedTabs) && user.allowedTabs.includes(item.id);
  });

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0B0F17] border-r border-[#2C384E] z-40 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header Branding */}
      <div
        className={`h-16 flex items-center border-b border-[#2C384E] bg-[#131B2A]/50 ${
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-heading font-extrabold text-sm text-white tracking-wide truncate">
                  Admin Console
                </h1>
                <span className="text-[10px] text-amber-400 font-mono uppercase font-bold tracking-wider block truncate">
                  {isSuperAdmin ? "SuperAdmin" : "SubAdmin Scoped"}
                </span>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-[#131B2A] border border-[#2C384E] hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition flex items-center justify-center group"
            title="Expand Sidebar"
          >
            <Shield className="w-4 h-4 text-amber-400 group-hover:hidden" />
            <ChevronRight className="w-4 h-4 text-amber-400 hidden group-hover:block" />
          </button>
        )}
      </div>

      {/* Navigation Items List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === "festivals" && currentTab === "calendar");

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isCollapsed ? "justify-center px-0" : "px-3"
              } ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-glow font-extrabold"
                  : "text-slate-400 hover:text-white hover:bg-[#131B2A]"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Switch Back to Brand Workspace Footer */}
      <div className="p-3 border-t border-[#2C384E] bg-[#131B2A]/40 space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={`w-full flex items-center gap-2.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition ${
            isCollapsed ? "justify-center px-0" : "px-3"
          }`}
          title="Switch to Brand Workspace"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 shrink-0" />
          {!isCollapsed && <span>Brand Workspace</span>}
        </button>
      </div>
    </aside>
  );
};
