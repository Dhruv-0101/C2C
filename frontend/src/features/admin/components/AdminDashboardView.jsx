import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Shield,
  FolderKanban,
  FileCode2,
  Palette,
  LayoutDashboard,
  Plus,
  Trash2,
  Pencil,
  UserPlus,
  X,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import { ADMIN_TABS } from "../../../constants/theme.constants";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";
import { SearchBar } from "../../../components/common/SearchBar";
import { FrameManager } from "../../../components/admin/FrameManager";
import { DesignStylesManager } from "../../../components/admin/DesignStylesManager";
import { BaseTemplateManager } from "../../../components/admin/BaseTemplateManager";
import { FestivalCalendarView } from "../../../components/admin/FestivalCalendarView";
import { AdminTemplateUploadModal } from "../../../components/admin/AdminTemplateUploadModal";

/**
 * EditSubAdminModal Component
 * Industry standard RBAC permission manager dialog allowing SuperAdmin to update SubAdmin tab permissions.
 */
const EditSubAdminModal = ({ subAdmin, onClose, updateSubAdminMutation }) => {
  const [editTabs, setEditTabs] = useState(subAdmin.allowedTabs || []);
  const [fullName, setFullName] = useState(subAdmin.fullName || "");
  const [email, setEmail] = useState(subAdmin.email || "");

  const handleToggle = (tabId) => {
    if (editTabs.includes(tabId)) {
      setEditTabs(editTabs.filter((t) => t !== tabId));
    } else {
      setEditTabs([...editTabs, tabId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSubAdminMutation.mutate({
      id: subAdmin.id,
      data: {
        fullName: fullName.trim(),
        email: email.trim(),
        allowedTabs: editTabs,
      },
    });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-amber-400" />
            <span>Update SubAdmin Permissions</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-2 pt-2 border-t border-[#2C384E]">
            <label className="text-xs font-bold text-white block">
              Permitted Admin Console Tabs:
            </label>
            <p className="text-[11px] text-slate-400">
              Only checked tabs will be visible to this SubAdmin upon login.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { id: "templates", label: "AI Base Templates" },
                { id: "festivals", label: "Festival Calendar" },
                { id: "frames", label: "Canva Vector Frames" },
                { id: "styles", label: "Design System & Palettes" },
                { id: "categories", label: "Business Categories" },
                { id: "users", label: "SMB User Directory" },
              ].map((tab) => {
                const isChecked = editTabs.includes(tab.id);
                return (
                  <label
                    key={tab.id}
                    onClick={() => handleToggle(tab.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                      isChecked
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isChecked
                          ? "bg-amber-500 border-amber-500 text-slate-950"
                          : "border-slate-600 bg-slate-900"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2C384E]">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={updateSubAdminMutation.isPending}
            >
              Save Permissions
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * AdminDashboardView
 * Pure Presentational Component rendering SuperAdmin & SubAdmin tabs, metrics banners, directories, and creation dialogs.
 */
export const AdminDashboardView = ({
  user,
  activeTab,
  handleTabChange,
  modalProps,
  isModalOpen,
  setIsModalOpen,
  editingSubAdmin,
  setEditingSubAdmin,
  isUploadModalOpen,
  setIsUploadModalOpen,
  isMetricsOpen,
  setIsMetricsOpen,
  newCategory,
  setNewCategory,
  categoryError,
  subAdminPage,
  setSubAdminPage,
  subAdminLimit,
  setSubAdminLimit,
  subAdminSearch,
  setSubAdminSearch,
  subAdmins,
  subAdminMeta,
  isLoadingSubAdmins,
  subAdminFetchError,
  userPage,
  setUserPage,
  userLimit,
  setUserLimit,
  userSearch,
  setUserSearch,
  users,
  userMeta,
  isLoadingUsers,
  usersFetchError,
  categoryPage,
  setCategoryPage,
  categoryLimit,
  setCategoryLimit,
  categorySearch,
  setCategorySearch,
  categories,
  categoryMeta,
  isLoadingCategories,
  categoriesFetchError,
  createCategoryMutation,
  deleteCategoryMutation,
  createSubAdminMutation,
  updateSubAdminMutation,
  deleteSubAdminMutation,
  register,
  handleSubmit,
  errors,
  selectedTabs = [],
  handleTabToggle,
  handleAddCategory,
  onCreateSubAdmin,
  queryClient,
  showSuccess,
}) => {
  const isSuperAdmin = user?.isSuperAdmin || user?.role === "ADMIN";

  // Filter visible tabs based on SubAdmin RBAC permissions
  const visibleTabs = isSuperAdmin
    ? ADMIN_TABS
    : ADMIN_TABS.filter(
        (tab) =>
          tab.id !== "subadmins" &&
          Array.isArray(user?.allowedTabs) &&
          user.allowedTabs.includes(tab.id)
      );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Stat Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>SMB Workspace Tenants</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-white">
            {userMeta?.totalItems || 1248}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">
            Registered business tenants
          </p>
        </Card>

        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>SubAdmin Moderators</span>
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-white">
            {subAdminMeta?.totalItems || 8}
          </p>
          <p className="text-[11px] text-teal-400 font-medium">
            RBAC access granted
          </p>
        </Card>

        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Business Categories</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="font-heading text-3xl font-extrabold text-white">
            {categoryMeta?.totalItems || 24}
          </p>
          <p className="text-[11px] text-indigo-400 font-medium">
            Active industry tags
          </p>
        </Card>

        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Server Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-heading text-2xl font-extrabold text-emerald-400">
            99.98%
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Compositor workers healthy
          </p>
        </Card>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3 overflow-x-auto">
        {visibleTabs.map((tab) => {
          const isActive =
            activeTab === tab.id ||
            (tab.id === "festivals" && activeTab === "calendar");
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-glow font-extrabold"
                  : "bg-[#0B0F17] text-slate-400 hover:text-white border border-[#2C384E]"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Full-Width Module Viewport */}
      <div className="w-full space-y-6 pt-2">
        {/* AI Base Graphic Templates View */}
        {activeTab === "templates" && (
          <div className="animate-in fade-in duration-200 w-full">
            <BaseTemplateManager />
          </div>
        )}

        {/* Interactive Festival Calendar View */}
        {(activeTab === "festivals" || activeTab === "calendar") && (
          <div className="animate-in fade-in duration-200 w-full">
            <FestivalCalendarView isAdmin={true} />
          </div>
        )}

        {/* Canva Vector Frames Studio View */}
        {activeTab === "frames" && (
          <div className="animate-in fade-in duration-200 w-full">
            <FrameManager />
          </div>
        )}

        {/* Design System & Color Tokens View */}
        {activeTab === "styles" && (
          <div className="animate-in fade-in duration-200 w-full">
            <DesignStylesManager />
          </div>
        )}

        {/* Master Business Categories View */}
        {activeTab === "categories" && (
          <div className="animate-in fade-in duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-amber-400" />
                  <span>Master Business Categories</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage system-wide industry categories used for template filtering.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SearchBar
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setCategoryPage(1);
                  }}
                  placeholder="Search categories..."
                  className="max-w-sm"
                />

                <form
                  onSubmit={handleAddCategory}
                  className="flex flex-col sm:flex-row items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    isLoading={createCategoryMutation.isPending}
                    className="shrink-0"
                  >
                    Add Category
                  </Button>
                </form>
              </div>
            </div>

            {categoryError && <Alert variant="error" message={categoryError} />}

            {isLoadingCategories ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-sm">
                No categories found.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <Card
                      key={cat.id}
                      className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center justify-between group hover:border-amber-500/50 transition"
                    >
                      <div>
                        <p className="font-bold text-sm text-white">{cat.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          slug: {cat.slug}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  ))}
                </div>

                <Pagination
                  meta={categoryMeta}
                  currentPage={categoryPage}
                  totalPages={categoryMeta?.totalPages || 1}
                  onPageChange={setCategoryPage}
                  onLimitChange={(newLimit) => {
                    setCategoryLimit(newLimit);
                    setCategoryPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* SubAdmin Accounts Directory View (SuperAdmin Only) */}
        {activeTab === "subadmins" && isSuperAdmin && (
          <div className="animate-in fade-in duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>SubAdmin Accounts Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  SuperAdmin exclusive privilege to create, edit permissions, and revoke SubAdmin tab access.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SearchBar
                  value={subAdminSearch}
                  onChange={(e) => {
                    setSubAdminSearch(e.target.value);
                    setSubAdminPage(1);
                  }}
                  placeholder="Search subadmins..."
                  className="max-w-sm"
                />

                <Button
                  variant="primary"
                  icon={UserPlus}
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
                  No SubAdmin accounts created yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-[#2C384E] bg-[#131B2A]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-bold border-b border-[#2C384E]">
                      <tr>
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Allowed Admin Tabs</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C384E]">
                      {subAdmins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {admin.fullName || "SubAdmin"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {admin.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {admin.allowedTabs?.map((t) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingSubAdmin(admin)}
                                className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                                title="Edit SubAdmin Permissions"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteSubAdminMutation.mutate(admin.id)
                                }
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                                title="Revoke SubAdmin Access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  meta={subAdminMeta}
                  currentPage={subAdminPage}
                  totalPages={subAdminMeta?.totalPages || 1}
                  onPageChange={setSubAdminPage}
                  onLimitChange={(newLimit) => {
                    setSubAdminLimit(newLimit);
                    setSubAdminPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* SMB User Directory View */}
        {activeTab === "users" && (
          <div className="animate-in fade-in duration-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>SMB User Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Directory of registered small business tenants operating with active BrandKits.
                </p>
              </div>

              <SearchBar
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search registered tenants..."
                className="max-w-sm"
              />
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
                <div className="overflow-x-auto rounded-xl border border-[#2C384E] bg-[#131B2A]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0F17] text-slate-400 uppercase tracking-wider font-bold border-b border-[#2C384E]">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Business Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C384E]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                              {u.fullName?.charAt(0) || "U"}
                            </div>
                            <span>{u.fullName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4 text-amber-400 font-semibold">
                            {u.brandKit?.businessName || "Not Setup"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase font-bold">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  meta={userMeta}
                  currentPage={userPage}
                  totalPages={userMeta?.totalPages || 1}
                  onPageChange={setUserPage}
                  onLimitChange={(newLimit) => {
                    setUserLimit(newLimit);
                    setUserPage(1);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* SubAdmin Creation Modal with Tab Permission Checkboxes */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>Create SubAdmin Account</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onCreateSubAdmin)}
                className="space-y-4"
              >
                <Input
                  label="Full Name *"
                  placeholder="SubAdmin Name"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />

                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="subadmin@company.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Input
                  label="Password *"
                  type="password"
                  placeholder="At least 6 characters"
                  error={errors.password?.message}
                  {...register("password")}
                />

                {/* Tab Permissions Section */}
                <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                  <label className="text-xs font-bold text-white block">
                    Granted Admin Console Tab Access:
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Check the Admin Console tabs that this SubAdmin is permitted to manage.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {[
                      { id: "templates", label: "AI Base Templates" },
                      { id: "festivals", label: "Festival Calendar" },
                      { id: "frames", label: "Canva Vector Frames" },
                      { id: "styles", label: "Design System & Palettes" },
                      { id: "categories", label: "Business Categories" },
                      { id: "users", label: "SMB User Directory" },
                    ].map((tab) => {
                      const isChecked = selectedTabs.includes(tab.id);
                      return (
                        <label
                          key={tab.id}
                          onClick={() => handleTabToggle(tab.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                            isChecked
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                              : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? "bg-amber-500 border-amber-500 text-slate-950"
                                : "border-slate-600 bg-slate-900"
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#2C384E]">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={createSubAdminMutation.isPending}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Edit SubAdmin Permissions Modal */}
      {editingSubAdmin &&
        createPortal(
          <EditSubAdminModal
            subAdmin={editingSubAdmin}
            onClose={() => setEditingSubAdmin(null)}
            updateSubAdminMutation={updateSubAdminMutation}
          />,
          document.body
        )}
    </div>
  );
};
