import React from "react";
import { Users, Shield, FolderKanban } from "lucide-react";
import { Card } from "../../../components/ui/Card";

/**
 * AdminStatsHeader Component
 * Interactive metric overview cards providing real-time system counts.
 * Clicking on a stat card smoothly navigates the admin user to the relevant tab.
 */
export const AdminStatsHeader = ({
  usersTotal,
  subAdminsTotal,
  categoriesTotal,
  isLoadingUsers,
  isLoadingSubAdmins,
  isLoadingCategories,
  onNavigateTab,
  isSuperAdmin,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Business Tenants Stat Card */}
      <Card
        onClick={() => onNavigateTab && onNavigateTab("users")}
        className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2 cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
          <span className="group-hover:text-amber-400 transition-colors">Business Tenants</span>
          <Users className="w-4 h-4 text-amber-400" />
        </div>
        <p className="font-heading text-3xl font-extrabold text-white">
          {isLoadingUsers ? "..." : (usersTotal ?? 0)}
        </p>
        <p className="text-[11px] text-emerald-400 font-medium">
          Registered business tenants &rarr;
        </p>
      </Card>

      {/* SubAdmin Moderators Stat Card (Clickable for SuperAdmin) */}
      <Card
        onClick={() => isSuperAdmin && onNavigateTab && onNavigateTab("subadmins")}
        className={`p-5 border-[#2C384E] bg-[#131B2A] space-y-2 transition-all duration-200 group ${
          isSuperAdmin ? "cursor-pointer hover:border-teal-500/50 hover:shadow-lg" : "opacity-90"
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
          <span className="group-hover:text-teal-400 transition-colors">SubAdmin Moderators</span>
          <Shield className="w-4 h-4 text-teal-400" />
        </div>
        <p className="font-heading text-3xl font-extrabold text-white">
          {isLoadingSubAdmins ? "..." : (subAdminsTotal ?? 0)}
        </p>
        <p className="text-[11px] text-teal-400 font-medium">
          {isSuperAdmin ? "Manage SubAdmins &rarr;" : "SuperAdmin privilege"}
        </p>
      </Card>

      {/* Business Categories Stat Card */}
      <Card
        onClick={() => onNavigateTab && onNavigateTab("categories")}
        className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 group"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
          <span className="group-hover:text-indigo-400 transition-colors">Business Categories</span>
          <FolderKanban className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="font-heading text-3xl font-extrabold text-white">
          {isLoadingCategories ? "..." : (categoriesTotal ?? 0)}
        </p>
        <p className="text-[11px] text-indigo-400 font-medium">
          Active industry tags &rarr;
        </p>
      </Card>
    </div>
  );
};
