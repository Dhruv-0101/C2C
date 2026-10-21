import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  FileCode2,
  Calendar,
  Layers,
  FolderKanban,
  FolderTree,
  Users,
  Shield,
  CreditCard,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUsers } from "@/features/admin/users/hooks/useUsers";
import { useSubAdmins } from "@/features/admin/sub-admins/hooks/useSubAdmins";
import { useCategories } from "@/features/admin/categories/hooks/useCategories";
import { ADMIN_TABS } from "@/shared/constants";
import { AdminStatsHeader } from "../components/AdminStatsHeader";
import { CelebrationWelcomeModal } from "@/features/welcome/components/CelebrationWelcomeModal";

/**
 * AdminDashboardPage Component
 * Dedicated Executive Overview page (/admin and /admin/dashboard).
 * Provides system metrics, summary counts, quick-launch navigation modules,
 * and automatic redirect for SubAdmins or legacy query-param links.
 */
export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const isSuperAdmin = Boolean(
    user?.isSuperAdmin || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  );
  const userAllowedTabs = Array.isArray(user?.allowedTabs) ? user.allowedTabs : [];

  // 1. Backwards Compatibility: Auto-redirect legacy "?tab=..." query params to clean sub-routes
  const legacyTab = searchParams.get("tab");
  useEffect(() => {
    if (legacyTab && legacyTab !== ADMIN_TABS.DASHBOARD) {
      navigate(`/admin/${legacyTab}`, { replace: true });
    }
  }, [legacyTab, navigate]);

  // 2. SubAdmin Guard: If a SubAdmin has no dashboard permission, redirect to first allowed tab
  useEffect(() => {
    if (
      !isSuperAdmin &&
      userAllowedTabs.length > 0 &&
      !userAllowedTabs.includes(ADMIN_TABS.DASHBOARD)
    ) {
      navigate(`/admin/${userAllowedTabs[0]}`, { replace: true });
    }
  }, [isSuperAdmin, userAllowedTabs, navigate]);

  // Welcome modal on first authentication
  const [welcomeAuthType, setWelcomeAuthType] = useState(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    const justAuth = sessionStorage.getItem("just_authenticated");
    if (justAuth) {
      setWelcomeAuthType(justAuth);
      setIsWelcomeModalOpen(true);
      sessionStorage.removeItem("just_authenticated");
    }
  }, []);

  // Lightweight summary queries (limit: 1 for ultra-fast load time)
  const { meta: userMeta, isLoading: isLoadingUsers } = useUsers(
    { page: 1, limit: 1 },
    { enabled: true }
  );

  const { meta: subAdminMeta, isLoading: isLoadingSubAdmins } = useSubAdmins(
    { page: 1, limit: 1 },
    { enabled: isSuperAdmin }
  );

  const { meta: categoryMeta, isLoading: isLoadingCategories } = useCategories(
    { page: 1, limit: 1 },
    { enabled: isSuperAdmin }
  );

  const handleNavigateTab = (tabId) => {
    navigate(`/admin/${tabId}`);
  };

  // Console Feature Navigation Modules
  const FEATURE_MODULES = [
    {
      id: ADMIN_TABS.USERS,
      label: "Business Users Directory",
      desc: "Registered business accounts, payment plans & tenant monitoring",
      icon: Users,
      color: "text-blue-400",
      borderColor: "hover:border-blue-500/50",
      superAdminOnly: false,
    },
    {
      id: ADMIN_TABS.SUB_ADMINS,
      label: "SubAdmin Accounts",
      desc: "SuperAdmin governance, staff management & RBAC privileges",
      icon: Shield,
      color: "text-amber-400",
      borderColor: "hover:border-amber-500/50",
      superAdminOnly: true,
    },
    {
      id: ADMIN_TABS.SUB_ADMIN_ACTIVITY,
      label: "SubAdmin Activity Feed",
      desc: "Real-time audit log of templates, frames, events & categories created",
      icon: Activity,
      color: "text-purple-400",
      borderColor: "hover:border-purple-500/50",
      superAdminOnly: true,
    },
    {
      id: ADMIN_TABS.FINANCE,
      label: "Finance & Revenue",
      desc: "Executive MRR/ARR, total revenue & transaction ledger",
      icon: CreditCard,
      color: "text-emerald-400",
      borderColor: "hover:border-emerald-500/50",
      superAdminOnly: true,
    },
    {
      id: ADMIN_TABS.TEMPLATES,
      label: "Graphic Templates",
      desc: "Master templates library, promotional designs & AI layouts",
      icon: FileCode2,
      color: "text-cyan-400",
      borderColor: "hover:border-cyan-500/50",
      superAdminOnly: false,
    },
    {
      id: ADMIN_TABS.TEMPLATE_CATEGORIES,
      label: "Template Categories",
      desc: "Organize visual themes, promotional styles & design classifications",
      icon: FolderTree,
      color: "text-teal-400",
      borderColor: "hover:border-teal-500/50",
      superAdminOnly: false,
    },
    {
      id: ADMIN_TABS.FESTIVALS,
      label: "Festival Calendar",
      desc: "Configure upcoming cultural events & marketing days",
      icon: Calendar,
      color: "text-rose-400",
      borderColor: "hover:border-rose-500/50",
      superAdminOnly: false,
    },
    {
      id: ADMIN_TABS.FRAMES,
      label: "Brand Frames Studio",
      desc: "Manage brand overlays, headers, footers & border styles",
      icon: Layers,
      color: "text-sky-400",
      borderColor: "hover:border-sky-500/50",
      superAdminOnly: false,
    },
    {
      id: ADMIN_TABS.CATEGORIES,
      label: "Business Categories",
      desc: "Industry taxonomy, commercial niches & keyword taxonomies",
      icon: FolderKanban,
      color: "text-orange-400",
      borderColor: "hover:border-orange-500/50",
      superAdminOnly: true,
    },
    {
      id: ADMIN_TABS.POSTS,
      label: "Generated Posts Audit",
      desc: "Audit & track posts by category, frame, template & festival",
      icon: Sparkles,
      color: "text-indigo-400",
      borderColor: "hover:border-indigo-500/50",
      superAdminOnly: false,
    },
  ];

  const visibleModules = FEATURE_MODULES.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (isSuperAdmin) return true;
    return userAllowedTabs.includes(item.id);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* Dashboard Welcome Header */}
      <div className="p-4 sm:p-6 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Statistics & Overview</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Admin Console Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time system metrics, registered tenant statistics, and quick navigation modules.
          </p>
        </div>
      </div>

      {/* Interactive Real-Time Statistics Header Cards */}
      <AdminStatsHeader
        usersTotal={userMeta?.totalItems ?? 0}
        subAdminsTotal={subAdminMeta?.totalItems ?? 0}
        categoriesTotal={categoryMeta?.totalItems ?? 0}
        isLoadingUsers={isLoadingUsers}
        isLoadingSubAdmins={isLoadingSubAdmins}
        isLoadingCategories={isLoadingCategories}
        onNavigateTab={handleNavigateTab}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Platform Quick Access Modules Grid */}
      <div className="space-y-4 pt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Console Feature Modules</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleModules.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                onClick={() => handleNavigateTab(item.id)}
                className={`p-5 bg-[#131B2A] border-[#2C384E] cursor-pointer transition-all duration-200 group ${item.borderColor} hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <CelebrationWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        authType={welcomeAuthType}
        user={user}
      />
    </div>
  );
};

export default AdminDashboardPage;
