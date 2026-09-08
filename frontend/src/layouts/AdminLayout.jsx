import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Shield, Sparkles, ArrowLeft, LogOut, User } from "lucide-react";
import { AdminSidebar } from "../features/admin/components/AdminSidebar";
import { useAuth } from "../hooks/useAuth";

/**
 * AdminLayout Component
 * Isolated layout wrapper providing dedicated sidebar navigation and security status banner for Admin Console.
 */
export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(nextState));
      return nextState;
    });
  };

  const isSuperAdmin = user?.isSuperAdmin || user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-body flex">
      {/* Dedicated Left Navigation Sidebar */}
      <AdminSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      {/* Main Content & Top Security Header Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        } min-h-screen flex flex-col`}
      >
        {/* Top Security Header Banner */}
        <header className="h-16 bg-[#131B2A] border-b border-[#2C384E] px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
          {/* Left Security Badge */}
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider hidden sm:inline-block">
              🛡️ BrandFlow Admin Console
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border bg-amber-500/20 text-amber-300 border-amber-500/40">
              {isSuperAdmin ? "SUPERADMIN PRIVILEGE" : "SUBADMIN SCOPED"}
            </span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-3 py-1.5 rounded-xl border border-[#2C384E] bg-[#0B0F17] hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">SMB Workspace</span>
            </button>

            <div className="h-4 w-[1px] bg-[#2C384E]" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:inline">
                {user?.fullName || "Admin"}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
