import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShieldAlert,
  Users,
  Server,
  Activity,
  UserPlus,
  Trash2,
  CheckCircle2,
  Shield,
  Plus,
  FileCode2,
  Sparkles,
  Layers,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/auth.api';
import { categoryApi } from '../services/category.api';
import { subAdminSchema } from '../validations/auth.validation';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { FestivalCalendarView } from '../features/calendar/components/FestivalCalendarView';
import { DesignStylesManager } from '../components/admin/DesignStylesManager';
import { BaseTemplateManager } from '../components/admin/BaseTemplateManager';
import { AdminTemplateUploadModal } from '../components/admin/AdminTemplateUploadModal';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // 1. Fetch SubAdmins using TanStack Query (Only when SubAdmin directory tab or modal is active)
  const {
    data: subAdminResponse,
    isLoading: isLoadingSubAdmins,
    error: subAdminFetchError,
  } = useQuery({
    queryKey: ['subAdmins'],
    queryFn: () => authApi.getSubAdmins(),
    enabled: activeTab === 'subadmins' || isModalOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const subAdmins = subAdminResponse?.data?.subAdmins || [];

  // 2. Fetch Master Business Categories from Backend Database
  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    error: categoriesFetchError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const categories = categoriesResponse?.data?.categories || [];

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: (name) => categoryApi.createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setNewCategory('');
      setCategoryError('');
    },
    onError: (err) => {
      setCategoryError(err.message || 'Failed to create business category.');
    },
  });

  // Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
    },
  });

  // Create SubAdmin Mutation
  const createSubAdminMutation = useMutation({
    mutationFn: (data) => authApi.createSubAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subAdmins']);
      setIsModalOpen(false);
      reset();
    },
  });

  // Delete SubAdmin Mutation
  const deleteSubAdminMutation = useMutation({
    mutationFn: (id) => authApi.deleteSubAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['subAdmins']);
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
      fullName: '',
      email: '',
      password: '',
      allowedTabs: ['users', 'analytics'],
    },
  });

  const selectedTabs = watch('allowedTabs') || [];

  const handleTabToggle = (tabId) => {
    if (selectedTabs.includes(tabId)) {
      setValue('allowedTabs', selectedTabs.filter((t) => t !== tabId), { shouldValidate: true });
    } else {
      setValue('allowedTabs', [...selectedTabs, tabId], { shouldValidate: true });
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    setCategoryError('');
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
          <h1 className="font-heading font-extrabold text-3xl text-white tracking-tight">Admin Console</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure the master system assets that power all SMB workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Sparkles} onClick={() => setIsUploadModalOpen(true)}>
            Upload Base Template (Cloudinary)
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={() => setIsModalOpen(true)}>
            Add SubAdmin
          </Button>
        </div>
      </div>

      {/* 4 Top Metric Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <p className="text-xs font-semibold text-slate-400">Active businesses</p>
          <p className="font-heading text-3xl font-extrabold text-white">1,284</p>
          <p className="text-xs font-semibold text-teal-400">+8.7% vs last month</p>
        </Card>

        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <p className="text-xs font-semibold text-slate-400">Posts generated</p>
          <p className="font-heading text-3xl font-extrabold text-white">94,120</p>
          <p className="text-xs font-semibold text-teal-400">+12.4% vs last month</p>
        </Card>

        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <p className="text-xs font-semibold text-slate-400">Templates live</p>
          <p className="font-heading text-3xl font-extrabold text-white">312</p>
          <p className="text-xs font-semibold text-teal-400">+6 vs last month</p>
        </Card>

        <Card className="p-5 border-[#2C384E] bg-[#131B2A] space-y-2">
          <p className="text-xs font-semibold text-slate-400">Publish success rate</p>
          <p className="font-heading text-3xl font-extrabold text-white">99.1%</p>
          <p className="text-xs font-semibold text-teal-400">+0.3% vs last month</p>
        </Card>
      </div>

      {/* Navigation Sub-Tabs Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2C384E]">
        {[
          { id: 'categories', label: `Categories (${categories.length})` },
          { id: 'festivals', label: 'Festivals & Days' },
          { id: 'templates', label: 'Base Templates' },
          { id: 'styles', label: 'Design Styles' },
          { id: 'subadmins', label: subAdmins.length > 0 ? `SubAdmins (${subAdmins.length})` : 'SubAdmins' },
          { id: 'users', label: 'Users' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-[#131B2A] text-slate-400 hover:text-white border border-[#2C384E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Tab (Live Database Business Categories) */}
      {activeTab === 'categories' && (
        <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
          {categoryError && <Alert variant="error" message={categoryError} />}
          {categoriesFetchError && <Alert variant="error" message={categoriesFetchError.message} />}

          {/* Form Bar */}
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-center gap-3">
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

          {/* Tag Pills List fetched from PostgreSQL */}
          {isLoadingCategories ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#2C384E] rounded-xl text-slate-400 text-sm">
              No categories created yet. Add one above!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 pt-2">
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
          )}
        </Card>
      )}

      {/* Festivals & Days Calendar */}
      {activeTab === 'festivals' && <FestivalCalendarView />}

      {/* Base Templates & AI Studio Manager */}
      {activeTab === 'templates' && <BaseTemplateManager />}

      {/* Master Design Styles & Color Palettes */}
      {activeTab === 'styles' && <DesignStylesManager />}

      {/* SubAdmins Tab Directory */}
      {activeTab === 'subadmins' && (
        <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>SubAdmin Accounts Directory</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">SuperAdmin exclusive privilege to create and revoke SubAdmin tab access.</p>
            </div>

            <Button variant="primary" icon={UserPlus} size="sm" onClick={() => setIsModalOpen(true)}>
              Create SubAdmin
            </Button>
          </div>

          {subAdminFetchError && <Alert variant="error" message={subAdminFetchError.message} />}

          {isLoadingSubAdmins ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading SubAdmin directory...</div>
          ) : subAdmins.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl space-y-3">
              <Shield className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold text-sm">No SubAdmin accounts created yet.</p>
            </div>
          ) : (
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
                      <td className="py-3.5 px-4 font-semibold text-white">{subAdmin.fullName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{subAdmin.email}</td>
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
                          onClick={() => deleteSubAdminMutation.mutate(subAdmin.id)}
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
          )}
        </Card>
      )}

      {/* Users / Templates / Festivals Tabs Placeholder */}
      {activeTab !== 'categories' && activeTab !== 'subadmins' && (
        <Card className="border-[#2C384E] bg-[#131B2A] p-8 text-center space-y-3">
          <Building2 className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">{activeTab} Management</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Configured master assets for {activeTab} are operating live across all SMB tenant accounts.
          </p>
        </Card>
      )}

      {/* Add SubAdmin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create New SubAdmin</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onCreateSubAdmin)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Jane Smith"
                {...register('fullName')}
                error={errors.fullName?.message}
              />

              <Input
                label="SubAdmin Email"
                type="email"
                placeholder="subadmin@brandflow.com"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                {...register('password')}
                error={errors.password?.message}
              />

              {/* Tab Permissions Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Assign Allowed Tabs</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'users', label: 'Users' },
                    { id: 'analytics', label: 'Analytics' },
                    { id: 'templates', label: 'Templates' },
                    { id: 'posts', label: 'Posts Queue' },
                    { id: 'billing', label: 'Billing' },
                  ].map((tab) => {
                    const isSelected = selectedTabs.includes(tab.id);
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabToggle(tab.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition border flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
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
        </div>
      )}

      {/* Admin Cloudinary Template Upload Modal */}
      <AdminTemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries(['festivals']);
          queryClient.invalidateQueries(['templates']);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
