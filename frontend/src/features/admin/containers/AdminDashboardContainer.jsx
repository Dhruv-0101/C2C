import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../hooks/useAuth";
import { useCategories } from "../../../hooks/useCategories";
import { useSubAdmins } from "../../../hooks/useSubAdmins";
import { useUsers } from "../../../hooks/useUsers";
import { authApi } from "../../../services/auth.api";
import { categoryApi } from "../../../services/category.api";
import { subAdminSchema } from "../../../validations/auth.validation";
import { useFeedbackModal } from "../../../hooks/useFeedbackModal";
import { AdminDashboardView } from "../components/AdminDashboardView";

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
  const requestedTab = searchParams.get("tab") || "templates";
  const activeTab =
    isSuperAdmin
      ? requestedTab
      : userAllowedTabs.length > 0 && userAllowedTabs.includes(requestedTab)
      ? requestedTab
      : userAllowedTabs[0] || "templates";

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const { modalProps, showSuccess, showError } = useFeedbackModal();

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

  const {
    subAdmins,
    meta: subAdminMeta,
    isLoading: isLoadingSubAdmins,
    error: subAdminFetchError,
  } = useSubAdmins(
    { page: subAdminPage, limit: subAdminLimit, search: subAdminSearch },
    { enabled: isSuperAdmin && (activeTab === "subadmins" || isModalOpen || editingSubAdmin !== null) },
  );

  // 2. Registered Users Directory Query
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
    { enabled: activeTab === "users" },
  );

  // 3. Master Business Categories Query
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(5);
  const [categorySearch, setCategorySearch] = useState("");

  const {
    categories,
    meta: categoryMeta,
    isLoading: isLoadingCategories,
    error: categoriesFetchError,
  } = useCategories({
    page: categoryPage,
    limit: categoryLimit,
    search: categorySearch,
  });

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
      allowedTabs: ["templates", "festivals", "frames", "styles", "categories", "users"],
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
      createCategoryMutation={createCategoryMutation}
      deleteCategoryMutation={deleteCategoryMutation}
      createSubAdminMutation={createSubAdminMutation}
      updateSubAdminMutation={updateSubAdminMutation}
      deleteSubAdminMutation={deleteSubAdminMutation}
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
  );
};
