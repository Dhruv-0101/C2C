import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useSubAdmins } from '@/features/admin/sub-admins/hooks/useSubAdmins';
import { authApi } from '@/features/auth/api/auth.api';
import { subAdminSchema } from '@/features/auth/validations/auth.validation';
import { useFeedbackModal, FeedbackModal } from '@/components/feedback/FeedbackModal';
import { QUERY_KEYS, SUBADMIN_PERMITTED_TABS } from '@/shared/constants';
import { AdminSubAdminsTab } from '@/features/admin/sub-admins/AdminSubAdminsTab';
import { CreateSubAdminModal } from '@/features/admin/sub-admins/components/CreateSubAdminModal';
import { EditSubAdminModal } from '@/features/admin/sub-admins/components/EditSubAdminModal';

/**
 * AdminSubAdminsPage Component
 * Dedicated route page for SuperAdmin SubAdmin Accounts Management (/admin/subadmins).
 */
export const AdminSubAdminsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'ADMIN';

  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);

  const [subAdminPage, setSubAdminPage] = useState(1);
  const [subAdminLimit, setSubAdminLimit] = useState(5);
  const [subAdminSearch, setSubAdminSearch] = useState('');
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
    { enabled: isSuperAdmin }
  );

  // Create SubAdmin Mutation
  const createSubAdminMutation = useMutation({
    mutationFn: (data) => authApi.createSubAdmin(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_ADMINS.ALL });
      setIsModalOpen(false);
      reset();
      showSuccess(
        'SubAdmin Created! 🛡️',
        `SubAdmin account "${variables.fullName}" has been created with assigned RBAC tab permissions.`
      );
    },
    onError: (err) => {
      showError(
        'SubAdmin Creation Failed ⚠️',
        err.message || 'Failed to create SubAdmin account.'
      );
    },
  });

  // Update SubAdmin Permissions Mutation
  const updateSubAdminMutation = useMutation({
    mutationFn: ({ id, data }) => authApi.updateSubAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_ADMINS.ALL });
      setEditingSubAdmin(null);
      showSuccess(
        'Permissions Updated! 🛡️',
        'SubAdmin allowed tab permissions have been updated successfully.'
      );
    },
    onError: (err) => {
      showError(
        'Update Failed ⚠️',
        err.message || 'Failed to update SubAdmin permissions.'
      );
    },
  });

  // Delete SubAdmin Mutation
  const deleteSubAdminMutation = useMutation({
    mutationFn: (id) => authApi.deleteSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUB_ADMINS.ALL });
      showSuccess(
        'SubAdmin Access Revoked 🗑️',
        'SubAdmin account has been removed from database.'
      );
    },
    onError: (err) => {
      showError('Revoke Error ⚠️', err.message || 'Failed to revoke SubAdmin.');
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
      fullName: '',
      email: '',
      password: '',
      allowedTabs: [...SUBADMIN_PERMITTED_TABS],
    },
  });

  const selectedTabs = watch('allowedTabs') || [];

  const handleTabToggle = (tabId) => {
    if (selectedTabs.includes(tabId)) {
      setValue(
        'allowedTabs',
        selectedTabs.filter((t) => t !== tabId),
        { shouldValidate: true }
      );
    } else {
      setValue('allowedTabs', [...selectedTabs, tabId], {
        shouldValidate: true,
      });
    }
  };

  const onCreateSubAdmin = (data) => {
    createSubAdminMutation.mutate(data);
  };

  const handleNavigateTab = (tabId) => {
    navigate(`/admin/${tabId}`);
  };

  // Render modal dialogs when active
  if (isModalOpen) {
    return (
      <>
        <CreateSubAdminModal
          onClose={() => setIsModalOpen(false)}
          handleSubmit={handleSubmit}
          onCreateSubAdmin={onCreateSubAdmin}
          register={register}
          errors={errors}
          selectedTabs={selectedTabs}
          handleTabToggle={handleTabToggle}
          isPending={createSubAdminMutation.isPending}
        />
        <FeedbackModal {...modalProps} />
      </>
    );
  }

  if (editingSubAdmin) {
    return (
      <>
        <EditSubAdminModal
          subAdmin={editingSubAdmin}
          onClose={() => setEditingSubAdmin(null)}
          updateSubAdminMutation={updateSubAdminMutation}
        />
        <FeedbackModal {...modalProps} />
      </>
    );
  }

  return (
    <>
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
        onNavigateTab={handleNavigateTab}
      />
      <FeedbackModal {...modalProps} />
    </>
  );
};

export default AdminSubAdminsPage;
