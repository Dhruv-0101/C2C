import React from "react";
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
  Clock,
  CheckCircle2,
  CreditCard,
  Activity,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { ADMIN_TABS } from "../../../constants/tabs.constants";

// Extracted Sub-Components & Standardized Tabs
import { AdminStatsHeader } from "./AdminStatsHeader";
import { AdminFinanceTab } from "./tabs/AdminFinanceTab";
import { AdminTemplatesTab } from "./tabs/AdminTemplatesTab";
import { AdminFestivalsTab } from "./tabs/AdminFestivalsTab";
import { AdminFramesTab } from "./tabs/AdminFramesTab";
import { AdminCategoriesTab } from "./tabs/AdminCategoriesTab";
import { AdminTemplateCategoriesTab } from "./tabs/AdminTemplateCategoriesTab";
import { AdminUsersTab } from "./tabs/AdminUsersTab";
import { AdminPostsTab } from "./tabs/AdminPostsTab";
import { AdminSubAdminsTab } from "./tabs/AdminSubAdminsTab";
import { AdminSubAdminActivityTab } from "./tabs/AdminSubAdminActivityTab";
import { CreateSubAdminScreen } from "./screens/CreateSubAdminScreen";
import { EditSubAdminScreen } from "./screens/EditSubAdminScreen";

/**
 * AdminDashboardView Component
 * High-level orchestrator view rendering Dashboard Overview with statistics,
 * active tab viewports without top clutter, and inline full-screen management panels.
 */
export const AdminDashboardView = ({
  user,
  activeTab,
  handleTabChange,
  isModalOpen,
  setIsModalOpen,
  editingSubAdmin,
  setEditingSubAdmin,
  newCategory,
  setNewCategory,
  categoryError,
  subAdminPage,
  setSubAdminPage,
  subAdminLimit,
  setSubAdminLimit,
  subAdminSearch,
  setSubAdminSearch,
  subAdmins = [],
  subAdminMeta,
  isLoadingSubAdmins,
  subAdminFetchError,
  userPage,
  setUserPage,
  userLimit,
  setUserLimit,
  userSearch,
  setUserSearch,
  users = [],
  userMeta,
  isLoadingUsers,
  usersFetchError,
  categoryPage,
  setCategoryPage,
  categoryLimit,
  setCategoryLimit,
  categorySearch,
  setCategorySearch,
  categories = [],
  categoryMeta,
  isLoadingCategories,
  // Master Template Categories Props
  templateCategories = [],
  templateCategoryMeta,
  isLoadingTemplateCategories,
  templateCategoryError,
  templateCategorySearch,
  setTemplateCategorySearch,
  templateCategoryPage,
  setTemplateCategoryPage,
  setTemplateCategoryLimit,
  createTemplateCategoryMutation,
  updateTemplateCategoryMutation,
  deleteTemplateCategoryMutation,
  createCategoryMutation,
  updateCategoryMutation,
  deleteCategoryMutation,
  createSubAdminMutation,
  updateSubAdminMutation,
  deleteSubAdminMutation,
  toggleUserStatusMutation,
  topUpUserQuotaMutation,
  register,
  handleSubmit,
  errors,
  selectedTabs = [],
  handleTabToggle,
  handleAddCategory,
  onCreateSubAdmin,
  // Generated Posts Audit Props
  posts = [],
  postMeta,
  isLoadingPosts,
  postsFetchError,
  postPage,
  setPostPage,
  setPostLimit,
  categoryFilter,
  setCategoryFilter,
  frameFilter,
  setFrameFilter,
  templateCategoryFilter,
  setTemplateCategoryFilter,
  festivalFilter,
  setFestivalFilter,
  statusFilter,
  setStatusFilter,
  postSearch,
  setPostSearch,
  allCategories = [],
  allFrames = [],
  allTemplateCategories = [],
  allFestivals = [],
  postAnalytics,
  isLoadingPostAnalytics,
}) => {
  const isSuperAdmin = user?.isSuperAdmin || user?.role === "ADMIN";

  // Render in-page full-screen screens when active
  if (isModalOpen) {
    return (
      <CreateSubAdminScreen
        onBack={() => setIsModalOpen(false)}
        handleSubmit={handleSubmit}
        onCreateSubAdmin={onCreateSubAdmin}
        register={register}
        errors={errors}
        selectedTabs={selectedTabs}
        handleTabToggle={handleTabToggle}
        isPending={createSubAdminMutation.isPending}
      />
    );
  }

  if (editingSubAdmin) {
    return (
      <EditSubAdminScreen
        subAdmin={editingSubAdmin}
        onBack={() => setEditingSubAdmin(null)}
        updateSubAdminMutation={updateSubAdminMutation}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* Dynamic Tab Module Viewports */}
      <div className="w-full space-y-6">
        {/* 0. Main Executive Statistics Dashboard Tab */}
        {activeTab === ADMIN_TABS.DASHBOARD && (
          <div className="space-y-6">
            {/* Dashboard Welcome Header */}
            <div className="p-6 rounded-2xl border border-[#2C384E] bg-gradient-to-r from-[#131B2A] via-[#1a2538] to-[#0B0F17] flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              usersTotal={userMeta?.totalItems ?? users?.length}
              subAdminsTotal={subAdminMeta?.totalItems ?? subAdmins?.length}
              categoriesTotal={categoryMeta?.totalItems ?? categories?.length}
              isLoadingUsers={isLoadingUsers}
              isLoadingSubAdmins={isLoadingSubAdmins}
              isLoadingCategories={isLoadingCategories}
              onNavigateTab={handleTabChange}
              isSuperAdmin={isSuperAdmin}
            />

            {/* Platform Quick Access Modules Grid */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Console Feature Modules</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: ADMIN_TABS.USERS,
                    label: "Business Users Directory",
                    desc: "Registered business accounts, payment plans & tenant monitoring",
                    icon: Users,
                    color: "text-blue-400",
                    borderColor: "hover:border-blue-500/50",
                  },
                  {
                    id: ADMIN_TABS.SUB_ADMINS,
                    label: "SubAdmin Accounts",
                    desc: "SuperAdmin governance, staff management & RBAC privileges",
                    icon: Shield,
                    color: "text-amber-400",
                    borderColor: "hover:border-amber-500/50",
                  },
                  {
                    id: ADMIN_TABS.SUB_ADMIN_ACTIVITY,
                    label: "SubAdmin Activity Feed",
                    desc: "Real-time audit log of templates, frames, events & categories created",
                    icon: Activity,
                    color: "text-purple-400",
                    borderColor: "hover:border-purple-500/50",
                  },
                  {
                    id: ADMIN_TABS.FINANCE,
                    label: "Finance & Revenue",
                    desc: "Executive MRR/ARR, total revenue & transaction ledger",
                    icon: CreditCard,
                    color: "text-emerald-400",
                    borderColor: "hover:border-emerald-500/50",
                  },
                  {
                    id: ADMIN_TABS.POSTS,
                    label: "Generated Posts Audit",
                    desc: "Audit & track posts by category, frame, template & festival",
                    icon: Sparkles,
                    color: "text-indigo-400",
                    borderColor: "hover:border-indigo-500/50",
                  },
                  {
                    id: ADMIN_TABS.TEMPLATE_CATEGORIES,
                    label: "Template Categories",
                    desc: "Organize visual themes, promotional styles & design classifications",
                    icon: FolderTree,
                    color: "text-teal-400",
                    borderColor: "hover:border-teal-500/50",
                  },
                  {
                    id: ADMIN_TABS.FESTIVALS,
                    label: "Festival Calendar",
                    desc: "Configure upcoming cultural events & marketing days",
                    icon: Calendar,
                    color: "text-teal-400",
                    borderColor: "hover:border-teal-500/50",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`p-5 bg-[#131B2A] border-[#2C384E] cursor-pointer transition-all duration-200 group ${item.borderColor} hover:shadow-lg`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.desc}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Executive Finance & Revenue Management Tab */}
        {activeTab === ADMIN_TABS.FINANCE && <AdminFinanceTab />}

        {/* 1. AI Base Graphic Templates Tab */}
        {activeTab === ADMIN_TABS.TEMPLATES && <AdminTemplatesTab />}

        {/* Master Template Categories Tab */}
        {activeTab === ADMIN_TABS.TEMPLATE_CATEGORIES && (
          <AdminTemplateCategoriesTab
            templateCategories={templateCategories}
            templateCategoryMeta={templateCategoryMeta}
            isLoadingTemplateCategories={isLoadingTemplateCategories}
            templateCategoryError={templateCategoryError}
            templateCategorySearch={templateCategorySearch}
            setTemplateCategorySearch={setTemplateCategorySearch}
            templateCategoryPage={templateCategoryPage}
            setTemplateCategoryPage={setTemplateCategoryPage}
            setTemplateCategoryLimit={setTemplateCategoryLimit}
            createTemplateCategoryMutation={createTemplateCategoryMutation}
            updateTemplateCategoryMutation={updateTemplateCategoryMutation}
            deleteTemplateCategoryMutation={deleteTemplateCategoryMutation}
          />
        )}

        {/* 2. Festival & Special Days Manager Tab */}
        {(activeTab === ADMIN_TABS.FESTIVALS || activeTab === "calendar") && (
          <AdminFestivalsTab />
        )}

        {/* 3. Brand Frames Studio Tab */}
        {activeTab === ADMIN_TABS.FRAMES && <AdminFramesTab />}

        {/* 4. Master Business Categories Tab */}
        {activeTab === ADMIN_TABS.CATEGORIES && (
          <AdminCategoriesTab
            categories={categories}
            categoryMeta={categoryMeta}
            isLoadingCategories={isLoadingCategories}
            categoryError={categoryError}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            categoryPage={categoryPage}
            setCategoryPage={setCategoryPage}
            setCategoryLimit={setCategoryLimit}
            handleAddCategory={handleAddCategory}
            createCategoryMutation={createCategoryMutation}
            updateCategoryMutation={updateCategoryMutation}
            deleteCategoryMutation={deleteCategoryMutation}
          />
        )}

        {/* 5. Generated Posts Audit Tab */}
        {activeTab === ADMIN_TABS.POSTS && (
          <AdminPostsTab
            posts={posts}
            postMeta={postMeta}
            isLoadingPosts={isLoadingPosts}
            postsFetchError={postsFetchError}
            postPage={postPage}
            setPostPage={setPostPage}
            setPostLimit={setPostLimit}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            frameFilter={frameFilter}
            setFrameFilter={setFrameFilter}
            templateCategoryFilter={templateCategoryFilter}
            setTemplateCategoryFilter={setTemplateCategoryFilter}
            festivalFilter={festivalFilter}
            setFestivalFilter={setFestivalFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            postSearch={postSearch}
            setPostSearch={setPostSearch}
            categoriesList={allCategories}
            framesList={allFrames}
            templateCategoriesList={allTemplateCategories}
            festivalsList={allFestivals}
            analytics={postAnalytics}
            isLoadingAnalytics={isLoadingPostAnalytics}
          />
        )}

        {/* 6. SubAdmin Directory Tab (SuperAdmin Only) */}
        {activeTab === ADMIN_TABS.SUB_ADMINS && isSuperAdmin && (
          <AdminSubAdminsTab
            subAdmins={subAdmins}
            subAdminMeta={subAdminMeta}
            isLoadingSubAdmins={isLoadingSubAdmins}
            subAdminFetchError={subAdminFetchError}
            subAdminSearch={subAdminSearch}
            setSubAdminSearch={setSubAdminSearch}
            subAdminPage={subAdminPage}
            setSubAdminPage={setSubAdminPage}
            setSubAdminLimit={setSubAdminLimit}
            setIsModalOpen={setIsModalOpen}
            setEditingSubAdmin={setEditingSubAdmin}
            deleteSubAdminMutation={deleteSubAdminMutation}
            onNavigateTab={handleTabChange}
          />
        )}

        {/* 7. SubAdmin Activity & Creations Audit Tab (SuperAdmin Only) */}
        {activeTab === ADMIN_TABS.SUB_ADMIN_ACTIVITY && isSuperAdmin && (
          <AdminSubAdminActivityTab onNavigateTab={handleTabChange} />
        )}

        {/* 8. Business User Directory Tab */}
        {activeTab === ADMIN_TABS.USERS && (
          <AdminUsersTab
            users={users}
            userMeta={userMeta}
            isLoadingUsers={isLoadingUsers}
            usersFetchError={usersFetchError}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            userPage={userPage}
            setUserPage={setUserPage}
            setUserLimit={setUserLimit}
            toggleUserStatusMutation={toggleUserStatusMutation}
            topUpUserQuotaMutation={topUpUserQuotaMutation}
          />
        )}
      </div>
    </div>
  );
};
