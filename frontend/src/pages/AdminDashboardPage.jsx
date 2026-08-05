import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldAlert,
  Users,
  UserPlus,
  Trash2,
  Shield,
  Plus,
  FileCode2,
  Sparkles,
  Layers,
  Building2,
  X,
  FolderKanban,
  Calendar,
  Palette,
  CheckCircle2,
  Activity,
  ChevronDown,
  Search,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCategories } from "../hooks/useCategories";
import { useSubAdmins } from "../hooks/useSubAdmins";
import { useUsers } from "../hooks/useUsers";
import Pagination from "../components/common/Pagination";
import { authApi } from "../services/auth.api";
import { categoryApi } from "../services/category.api";
import { subAdminSchema } from "../validations/auth.validation";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { FestivalCalendarView } from "../features/calendar/components/FestivalCalendarView";
import { DesignStylesManager } from "../components/admin/DesignStylesManager";
import { BaseTemplateManager } from "../components/admin/BaseTemplateManager";
import { AdminTemplateUploadModal } from "../components/admin/AdminTemplateUploadModal";
import { FrameManager } from "../components/admin/FrameManager";
import { FeedbackModal } from "../components/common/FeedbackModal";
import { useFeedbackModal } from "../hooks/useFeedbackModal";

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "categories";

  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // 1. Fetch SubAdmins using central modular hook
  const [subAdminPage, setSubAdminPage] = useState(1);
  const [subAdminLimit, setSubAdminLimit] = useState(5);
  const [subAdminSearch, setSubAdminSearch] = useState("");

  const {
    subAdmins,
    meta: subAdminMeta,
    isLoading: isLoadingSubAdmins,
    error: subAdminFetchError,
  } = useSubAdmins(
    { page: subAdminPage, limit: subAdminLimit, search: subAdminSearch },
    { enabled: activeTab === "subadmins" || isModalOpen }
  );

  // 2. Fetch Registered End-Users Directory using central modular hook
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [userSearch, setUserSearch] = useState("");

  const {
    users,
    meta: userMeta,
    isLoading: isLoadingUsers,
    error: usersFetchError,
  } = useUsers(
    { page: userPage, limit: userLimit, search: userSearch },
    { enabled: activeTab === "users" }
  );

  // 2. Fetch Master Business Categories from Backend Database using central modular hook
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(5);
  const [categorySearch, setCategorySearch] = useState("");

  const {
    categories,
    meta: categoryMeta,
    isLoading: isLoadingCategories,
    error: categoriesFetchError,
  } = useCategories({ page: categoryPage, limit: categoryLimit, search: categorySearch });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: (name) => categoryApi.createCategory({ name }),
    onSuccess: (res, name) => {
      queryClient.invalidateQueries(["categories"]);
      setNewCategory("");
      setCategoryError("");
      showSuccess(
        "Category Added! 🎉",
        `Master category "${name}" has been created successfully.`,
      );
    },
    onError: (err) => {
      setCategoryError(err.message || "Failed to create business category.");
      showError(
        "Category Error ⚠️",
        err.message || "Could not create business category. Please try again.",
      );
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      showSuccess(
        "Category Removed 🗑️",
        "Business category deleted successfully from database.",
      );
    },
    onError: (err) => {
      showError("Delete Error ⚠️", err.message || "Failed to delete category.");
    },
  });

  // Create SubAdmin Mutation
  const createSubAdminMutation = useMutation({
    mutationFn: (data) => authApi.createSubAdmin(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(["subAdmins"]);
      setIsModalOpen(false);
      reset();
      showSuccess(
        "SubAdmin Created! 🛡️",
        `SubAdmin account "${variables.fullName}" has been created with assigned RBAC tab permissions.`,
      );
    },
    onError: (err) => {
      showError(
        "SubAdmin Creation Failed ⚠️",
        err.message || "Failed to create SubAdmin account.",
      );
    },
  });

  // Delete SubAdmin Mutation
  const deleteSubAdminMutation = useMutation({
    mutationFn: (id) => authApi.deleteSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["subAdmins"]);
      showSuccess(
        "SubAdmin Access Revoked 🗑️",
        "SubAdmin account has been removed from database.",
      );
    },
    onError: (err) => {
      showError("Revoke Error ⚠️", err.message || "Failed to revoke SubAdmin.");
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subAdminSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      allowedTabs: ["users", "analytics"],
    },
  });

  const selectedTabs = watch("allowedTabs") || [];

  const handleTabToggle = (tabId) => {
    if (selectedTabs.includes(tabId)) {
      setValue(
        "allowedTabs",
        selectedTabs.filter((t) => t !== tabId),
        { shouldValidate: true },
      );
    } else {
      setValue("allowedTabs", [...selectedTabs, tabId], {
        shouldValidate: true,
      });
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    setCategoryError("");
    if (!newCategory.trim()) return;
    createCategoryMutation.mutate(newCategory.trim());
  };

  const onCreateSubAdmin = (data) => {
    createSubAdminMutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C384E] pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight">
            Admin Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure the master system assets that power all SMB workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Sparkles}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Base Template
          </Button>
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsModalOpen(true)}
          >
            Add SubAdmin
          </Button>
        </div>
      </div>

      {/* Collapsible System Performance Metrics Bar */}
      <div className="border border-[#2C384E] bg-[#131B2A] rounded-2xl p-4 transition-all duration-200 shadow-lg">
        <button
          onClick={() => setIsMetricsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <span>System Performance Metrics</span>
                {!isMetricsOpen && (
                  <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                    (1,284 Businesses • 94.1k Posts • 312 Templates • 99.1%
                    Success)
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isMetricsOpen
                  ? "Click to collapse metrics overview"
                  : "Click to expand detailed system analytics"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 group-hover:underline hidden sm:inline">
              {isMetricsOpen ? "Collapse Metrics" : "Expand Metrics"}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white">
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isMetricsOpen ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </button>

        {/* Expandable 4 Metric Cards Grid */}
        {isMetricsOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#2C384E] mt-4 animate-in fade-in duration-300">
            <Card className="p-4 border-[#2C384E] bg-[#0B0F17] space-y-1">
              <p className="text-xs font-semibold text-slate-400">
                Active businesses
              </p>
              <p className="font-heading text-2xl font-extrabold text-white">
                1,284
              </p>
              <p className="text-xs font-semibold text-teal-400">
                +8.7% vs last month
              </p>
            </Card>

            <Card className="p-4 border-[#2C384E] bg-[#0B0F17] space-y-1">
              <p className="text-xs font-semibold text-slate-400">
                Posts generated
              </p>
              <p className="font-heading text-2xl font-extrabold text-white">
                94,120
              </p>
              <p className="text-xs font-semibold text-teal-400">
                +12.4% vs last month
              </p>
            </Card>

            <Card className="p-4 border-[#2C384E] bg-[#0B0F17] space-y-1">
              <p className="text-xs font-semibold text-slate-400">
                Templates live
              </p>
              <p className="font-heading text-2xl font-extrabold text-white">
                312
              </p>
              <p className="text-xs font-semibold text-teal-400">
                +6 vs last month
              </p>
            </Card>

            <Card className="p-4 border-[#2C384E] bg-[#0B0F17] space-y-1">
              <p className="text-xs font-semibold text-slate-400">
                Publish success rate
              </p>
              <p className="font-heading text-2xl font-extrabold text-white">
                99.1%
              </p>
              <p className="text-xs font-semibold text-teal-400">
                +0.3% vs last month
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Full-Width Module Viewport */}
      <div className="w-full space-y-6 pt-2">
        {/* Master Categories View */}
        {activeTab === "categories" && (
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2C384E] pb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-400" />
                <span>Master Business Categories</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage system-wide industry categories used for template
                filtering.
              </p>
            </div>

            {categoryError && <Alert variant="error" message={categoryError} />}
            {categoriesFetchError && (
              <Alert variant="error" message={categoriesFetchError.message} />
            )}

            {/* Search and Add Category Action Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setCategoryPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>

              {/* Add Category Form */}
              <form
                onSubmit={handleAddCategory}
                className="flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="New category name (e.g. Real Estate)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon={Plus}
                  isLoading={createCategoryMutation.isPending}
                  isDisabled={!newCategory.trim()}
                >
                  Add category
                </Button>
              </form>
            </div>

            {/* Tag Pills List */}
            {isLoadingCategories ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-sm">
                No categories created yet. Add one above!
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-4 py-2 rounded-xl bg-[#1A2436] border border-[#2C384E] text-slate-200 font-semibold text-xs transition hover:border-amber-500/50 flex items-center gap-2 group"
                    >
                      <span>{cat.name}</span>
                      <button
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title={`Delete category ${cat.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Central Pagination Controls */}
                <Pagination
                  meta={categoryMeta}
                  onPageChange={(newPage) => setCategoryPage(newPage)}
                  onLimitChange={(newLimit) => {
                    setCategoryLimit(newLimit);
                    setCategoryPage(1);
                  }}
                />
              </div>
            )}
          </Card>
        )}

        {/* Festivals Calendar View */}
        {activeTab === "festivals" && (
          <div className="animate-in fade-in duration-200 w-full">
            <FestivalCalendarView />
          </div>
        )}

        {/* Base Templates View */}
        {activeTab === "templates" && (
          <div className="animate-in fade-in duration-200 w-full">
            <BaseTemplateManager />
          </div>
        )}

        {/* Canva Frames View */}
        {activeTab === "frames" && (
          <div className="animate-in fade-in duration-200 w-full">
            <FrameManager />
          </div>
        )}

        {/* Design Styles View */}
        {activeTab === "styles" && (
          <div className="animate-in fade-in duration-200 w-full">
            <DesignStylesManager />
          </div>
        )}

        {/* SubAdmins View */}
        {activeTab === "subadmins" && (
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-4 animate-in fade-in duration-200 w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>SubAdmin Accounts Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  SuperAdmin exclusive privilege to create and revoke SubAdmin
                  tab access.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search SubAdmins..."
                    value={subAdminSearch}
                    onChange={(e) => {
                      setSubAdminSearch(e.target.value);
                      setSubAdminPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                  />
                </div>

                <Button
                  variant="primary"
                  icon={UserPlus}
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  Create SubAdmin
                </Button>
              </div>
            </div>

            {subAdminFetchError && (
              <Alert variant="error" message={subAdminFetchError.message} />
            )}

            {isLoadingSubAdmins ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Loading SubAdmin directory...
              </div>
            ) : subAdmins.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl space-y-3">
                <Shield className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold text-sm">
                  No SubAdmin accounts found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider border-b border-[#2C384E]">
                      <tr>
                        <th className="py-3 px-4">SubAdmin Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Assigned Tabs</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C384E]">
                      {subAdmins.map((subAdmin) => (
                        <tr key={subAdmin.id} className="hover:bg-slate-900/40">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {subAdmin.fullName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {subAdmin.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {subAdmin.allowedTabs?.map((tab) => (
                                <span
                                  key={tab}
                                  className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-semibold uppercase"
                                >
                                  {tab}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() =>
                                deleteSubAdminMutation.mutate(subAdmin.id)
                              }
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                              title="Revoke SubAdmin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Central Pagination Controls */}
                <Pagination
                  meta={subAdminMeta}
                  onPageChange={(newPage) => setSubAdminPage(newPage)}
                  onLimitChange={(newLimit) => {
                    setSubAdminLimit(newLimit);
                    setSubAdminPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20]}
                />
              </div>
            )}
          </Card>
        )}

        {/* Registered Users Directory View */}
        {activeTab === "users" && (
          <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-4 animate-in fade-in duration-200 w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Registered Users Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Directory of registered small business tenants operating with active BrandKits.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            {usersFetchError && (
              <Alert variant="error" message={usersFetchError.message} />
            )}

            {isLoadingUsers ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Loading user directory...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl space-y-3">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-300 font-semibold text-sm">
                  No registered users found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider border-b border-[#2C384E]">
                      <tr>
                        <th className="py-3 px-4">User Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Business Name</th>
                        <th className="py-3 px-4">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C384E]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs shrink-0">
                              {u.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <span>{u.fullName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                          <td className="py-3.5 px-4 text-amber-400 font-medium">
                            {u.brandKit?.businessName || "Not Setup Yet"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Central Pagination Controls */}
                <Pagination
                  meta={userMeta}
                  onPageChange={(newPage) => setUserPage(newPage)}
                  onLimitChange={(newLimit) => {
                    setUserLimit(newLimit);
                    setUserPage(1);
                  }}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Add SubAdmin Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>Create New SubAdmin</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onCreateSubAdmin)}
                className="space-y-4"
              >
                <Input
                  label="Full Name"
                  placeholder="Jane Smith"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                />

                <Input
                  label="SubAdmin Email"
                  type="email"
                  placeholder="subadmin@brandflow.com"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  error={errors.password?.message}
                />

                {/* Tab Permissions Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Assign Allowed Tabs
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "users", label: "Users" },
                      { id: "analytics", label: "Analytics" },
                      { id: "templates", label: "Templates" },
                      { id: "posts", label: "Posts Queue" },
                      { id: "billing", label: "Billing" },
                    ].map((tab) => {
                      const isSelected = selectedTabs.includes(tab.id);
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabToggle(tab.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition border flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                              : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>{tab.label}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={createSubAdminMutation.isPending}
                  >
                    Create SubAdmin
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Admin Cloudinary Template Upload Modal */}
      <AdminTemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(["festivals"]);
          queryClient.invalidateQueries(["templates"]);
          showSuccess(
            "Template Uploaded! 🌄",
            "Base graphic background uploaded to Cloudinary successfully.",
          );
        }}
      />

      {/* Reusable Global Feedback Modal (DRY Principle) */}
      <FeedbackModal {...modalProps} />
    </div>
  );
};

export default AdminDashboardPage;
