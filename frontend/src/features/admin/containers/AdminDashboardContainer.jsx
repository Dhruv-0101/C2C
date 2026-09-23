import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../hooks/useAuth";
import { useDebounce } from "../../../hooks/useDebounce";
import { useCategories } from "../../../hooks/useCategories";
import { useSubAdmins } from "../../../hooks/useSubAdmins";
import { useUsers } from "../../../hooks/useUsers";
import { useAdminPosts, useAdminPostAnalytics } from "../../../hooks/useAdminPosts";
import { useFrames } from "../../../hooks/useFrames";
import { useTemplateCategories } from "../../../hooks/useTemplates";
import { useFestivals } from "../../../hooks/useFestivals";
import { authApi } from "../../../services/auth.api";
import { categoryApi } from "../../../services/category.api";
import { billingApi } from "../../../services/billing.api";
import { subAdminSchema } from "../../../validations/auth.validation";
import { useFeedbackModal } from "../../../hooks/useFeedbackModal";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { AdminDashboardView } from "../components/AdminDashboardView";
import { CelebrationWelcomeModal } from "../../../components/common/CelebrationWelcomeModal";

/**
 * AdminDashboardContainer
 * Container component handling queries, mutations, state management, RBAC allowedTabs permissions,
 * and form validation logic for SuperAdmin & SubAdmin users.
 */
export const AdminDashboardContainer = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin || user?.role === "ADMIN";
  const userAllowedTabs = user?.allowedTabs || [];

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Enforce SubAdmin RBAC tab access: if requested tab is unpermitted, auto-select first allowed tab
  const requestedTab = searchParams.get("tab") || "dashboard";
  const activeTab =
    isSuperAdmin
      ? requestedTab
      : userAllowedTabs.length > 0 && userAllowedTabs.includes(requestedTab)
        ? requestedTab
        : userAllowedTabs[0] || "dashboard";

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const { modalProps, showSuccess, showError } = useFeedbackModal();

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // 1. SubAdmins Directory Query (SuperAdmin Only)
  const [subAdminPage, setSubAdminPage] = useState(1);
  const [subAdminLimit, setSubAdminLimit] = useState(5);
  const [subAdminSearch, setSubAdminSearch] = useState("");
  const debouncedSubAdminSearch = useDebounce(subAdminSearch, 300);

  useEffect(() => {
    setSubAdminPage(1);
  }, [debouncedSubAdminSearch]);

  const {
    subAdmins,
    meta: subAdminMeta,
    isLoading: isLoadingSubAdmins,
    error: subAdminFetchError,
  } = useSubAdmins(
    { page: subAdminPage, limit: subAdminLimit, search: debouncedSubAdminSearch },
    { enabled: isSuperAdmin },
  );

  // 2. Registered Users Directory Query
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [userSearch, setUserSearch] = useState("");
  const debouncedUserSearch = useDebounce(userSearch, 300);

  useEffect(() => {
    setUserPage(1);
  }, [debouncedUserSearch]);

  const {
    users,
    meta: userMeta,
    isLoading: isLoadingUsers,
    error: usersFetchError,
  } = useUsers(
    { page: userPage, limit: userLimit, search: debouncedUserSearch },
    { enabled: true },
  );

  // 3. Master Business Categories Query
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(10);
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch, 300);

  useEffect(() => {
    setCategoryPage(1);
  }, [debouncedCategorySearch]);

  const {
    categories,
    meta: categoryMeta,
    isLoading: isLoadingCategories,
    error: categoriesFetchError,
  } = useCategories({
    page: categoryPage,
    limit: categoryLimit,
    search: debouncedCategorySearch,
  });

  // 4. Generated Posts Audit Query (with Multi-Filters)
  const [postPage, setPostPage] = useState(1);
  const [postLimit, setPostLimit] = useState(10);
  const [postSearch, setPostSearch] = useState("");
  const debouncedPostSearch = useDebounce(postSearch, 300);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [frameFilter, setFrameFilter] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState("");
  const [festivalFilter, setFestivalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setPostPage(1);
  }, [debouncedPostSearch, categoryFilter, frameFilter, templateCategoryFilter, festivalFilter, statusFilter]);

  const {
    posts,
    meta: postMeta,
    isLoading: isLoadingPosts,
    error: postsFetchError,
  } = useAdminPosts({
    page: postPage,
    limit: postLimit,
    search: debouncedPostSearch,
    categoryId: categoryFilter,
    frameId: frameFilter,
    templateCategoryId: templateCategoryFilter,
    festivalId: festivalFilter,
    status: statusFilter,
  });

  const {
    analytics: postAnalytics,
    isLoading: isLoadingPostAnalytics,
  } = useAdminPostAnalytics();

  // Auxiliary dropdown collections for filters
  const { frames: allFrames } = useFrames({ limit: 100 });
  const { categories: allTemplateCategories } = useTemplateCategories();
  const { festivals: allFestivals } = useFestivals({ limit: 100 });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data) =>
      typeof data === "string"
        ? categoryApi.createCategory({ name: data })
        : categoryApi.createCategory(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
      setCategoryPage(1);
      setNewCategory("");
      setCategoryError("");
      const catName = typeof variables === "string" ? variables : variables.name;
      showSuccess(
        "Category Added! 🎉",
        `Master category "${catName}" has been created successfully.`,
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

  // Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
      setCategoryError("");
      showSuccess(
        "Category Updated! ✏️",
        `Business category "${variables.data.name || "item"}" has been updated successfully.`,
      );
    },
    onError: (err) => {
      showError(
        "Update Failed ⚠️",
        err.message || "Failed to update business category.",
      );
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
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

  // Update SubAdmin Permissions Mutation
  const updateSubAdminMutation = useMutation({
    mutationFn: ({ id, data }) => authApi.updateSubAdmin(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(["subAdmins"]);
      setEditingSubAdmin(null);
      showSuccess(
        "Permissions Updated! 🛡️",
        "SubAdmin allowed tab permissions have been updated successfully.",
      );
    },
    onError: (err) => {
      showError(
        "Update Failed ⚠️",
        err.message || "Failed to update SubAdmin permissions.",
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

  // Toggle User Active Account Status Mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }) => authApi.toggleUserStatus(userId, isActive),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(["users"]);
      if (variables.isActive) {
        showSuccess("Account Activated! 🟢", "User account has been activated successfully.");
      } else {
        showSuccess(
          "Account Deactivated! 🚫",
          "User account deactivated. All post creation & publishing capabilities have been blocked for this user.",
        );
      }
    },
    onError: (err) => {
      showError("Action Failed ⚠️", err.message || "Failed to update user account status.");
    },
  });

  // Admin Quota Top-Up Mutation
  const topUpUserQuotaMutation = useMutation({
    mutationFn: ({ userId, bonusPosts }) => billingApi.adminTopUpQuota(userId, bonusPosts),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["subscription"]);
      showSuccess(
        "Quota Top-Up Granted! 🎉",
        `Successfully granted +${variables.bonusPosts || 10} bonus post quota to user.`,
      );
    },
    onError: (err) => {
      showError("Top-Up Failed ⚠️", err.message || "Failed to grant bonus post quota.");
    },
  });

  // React Hook Form for SubAdmin Creation
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
      allowedTabs: ["festivals", "categories", "frames", "templates", "posts"],
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
    <>
      <AdminDashboardView
        user={user}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        modalProps={modalProps}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingSubAdmin={editingSubAdmin}
        setEditingSubAdmin={setEditingSubAdmin}
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        isMetricsOpen={isMetricsOpen}
        setIsMetricsOpen={setIsMetricsOpen}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        categoryError={categoryError}
        subAdminPage={subAdminPage}
        setSubAdminPage={setSubAdminPage}
        subAdminLimit={subAdminLimit}
        setSubAdminLimit={setSubAdminLimit}
        subAdminSearch={subAdminSearch}
        setSubAdminSearch={setSubAdminSearch}
        subAdmins={subAdmins}
        subAdminMeta={subAdminMeta}
        isLoadingSubAdmins={isLoadingSubAdmins}
        subAdminFetchError={subAdminFetchError}
        userPage={userPage}
        setUserPage={setUserPage}
        userLimit={userLimit}
        setUserLimit={setUserLimit}
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        users={users}
        userMeta={userMeta}
        isLoadingUsers={isLoadingUsers}
        usersFetchError={usersFetchError}
        categoryPage={categoryPage}
        setCategoryPage={setCategoryPage}
        categoryLimit={categoryLimit}
        setCategoryLimit={setCategoryLimit}
        categorySearch={categorySearch}
        setCategorySearch={setCategorySearch}
        categories={categories}
        categoryMeta={categoryMeta}
        isLoadingCategories={isLoadingCategories}
        categoriesFetchError={categoriesFetchError}
        // Generated Posts Audit Props
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
        allCategories={categories}
        allFrames={allFrames}
        allTemplateCategories={allTemplateCategories}
        allFestivals={allFestivals}
        postAnalytics={postAnalytics}
        isLoadingPostAnalytics={isLoadingPostAnalytics}
        createCategoryMutation={createCategoryMutation}
        updateCategoryMutation={updateCategoryMutation}
        deleteCategoryMutation={deleteCategoryMutation}
        createSubAdminMutation={createSubAdminMutation}
        updateSubAdminMutation={updateSubAdminMutation}
        deleteSubAdminMutation={deleteSubAdminMutation}
        toggleUserStatusMutation={toggleUserStatusMutation}
        topUpUserQuotaMutation={topUpUserQuotaMutation}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        selectedTabs={selectedTabs}
        handleTabToggle={handleTabToggle}
        handleAddCategory={handleAddCategory}
        onCreateSubAdmin={onCreateSubAdmin}
        queryClient={queryClient}
        showSuccess={showSuccess}
      />
      <CelebrationWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        authType={welcomeAuthType}
        user={user}
      />
    </>
  );
};
