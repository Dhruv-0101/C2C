import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useCategories } from '@/features/admin/categories/hooks/useCategories';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { categoryApi } from '@/features/admin/categories/api/category.api';
import { useFeedbackModal } from '@/components/feedback/FeedbackModal';
import { QUERY_KEYS } from '@/shared/constants';
import { AdminCategoriesTab } from '../categories/AdminCategoriesTab';

/**
 * AdminCategoriesPage Component
 * Canonical route page for Master Business Categories (/admin/categories).
 */
export const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(10);
  const [categorySearch, setCategorySearch] = useState('');
  const debouncedCategorySearch = useDebounce(categorySearch, 300);
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');

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

  const createCategoryMutation = useMutation({
    mutationFn: (categoryData) => categoryApi.createCategory(categoryData),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      setNewCategory('');
      setCategoryError('');
      const catName = typeof variables === 'string' ? variables : variables.name;
      showSuccess(
        'Category Created! 🎉',
        `Business category "${catName}" has been added successfully.`
      );
    },
    onError: (err) => {
      setCategoryError(err.message || 'Failed to create category.');
      showError('Action Failed ⚠️', err.message || 'Could not create category.');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      setCategoryError('');
      showSuccess(
        'Category Updated! ✏️',
        `Category "${variables.data.name || 'item'}" has been updated successfully.`
      );
    },
    onError: (err) => {
      setCategoryError(err.message || 'Failed to update category.');
      showError('Update Failed ⚠️', err.message || 'Could not update category.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      showSuccess('Category Deleted 🗑️', 'Category removed successfully from database.');
    },
    onError: (err) => {
      setCategoryError(err.message || 'Failed to delete category.');
      showError('Delete Failed ⚠️', err.message || 'Could not delete category.');
    },
  });

  const handleAddCategory = (e) => {
    e?.preventDefault();
    if (!newCategory.trim()) {
      setCategoryError('Category name is required');
      return;
    }
    createCategoryMutation.mutate({ name: newCategory.trim() });
  };

  return (
    <AdminCategoriesTab
      categories={categories}
      categoryMeta={categoryMeta}
      isLoadingCategories={isLoadingCategories}
      categoryError={categoryError || categoriesFetchError?.message}
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
  );
};

export default AdminCategoriesPage;
