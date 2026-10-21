import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTemplateCategories } from '@/features/admin/template-categories/hooks/useTemplateCategories';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { templateCategoryApi } from '@/features/admin/template-categories/api/templateCategory.api';
import { useFeedbackModal } from '@/components/feedback/FeedbackModal';
import { QUERY_KEYS } from '@/shared/constants';
import { AdminTemplateCategoriesTab } from '../template-categories/AdminTemplateCategoriesTab';

/**
 * AdminTemplateCategoriesPage Component
 * Canonical route page for Template Categories (/admin/template-categories).
 */
export const AdminTemplateCategoriesPage = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  const [templateCategoryPage, setTemplateCategoryPage] = useState(1);
  const [templateCategoryLimit, setTemplateCategoryLimit] = useState(10);
  const [templateCategorySearch, setTemplateCategorySearch] = useState('');
  const [templateCategoryError, setTemplateCategoryError] = useState('');
  const debouncedTemplateCategorySearch = useDebounce(templateCategorySearch, 300);

  useEffect(() => {
    setTemplateCategoryPage(1);
  }, [debouncedTemplateCategorySearch]);

  const {
    templateCategories,
    meta: templateCategoryMeta,
    isLoading: isLoadingTemplateCategories,
    error: templateCategoriesFetchError,
  } = useTemplateCategories({
    page: templateCategoryPage,
    limit: templateCategoryLimit,
    search: debouncedTemplateCategorySearch,
  });

  const createTemplateCategoryMutation = useMutation({
    mutationFn: (categoryData) => templateCategoryApi.createTemplateCategory(categoryData),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATE_CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
      setTemplateCategoryPage(1);
      setTemplateCategoryError('');
      const catName = typeof variables === 'string' ? variables : variables.name;
      showSuccess(
        'Template Category Added! 🎉',
        `Master template category "${catName}" has been created successfully.`
      );
    },
    onError: (err) => {
      setTemplateCategoryError(err.message || 'Failed to create template category.');
      showError(
        'Template Category Error ⚠️',
        err.message || 'Could not create template category. Please try again.'
      );
    },
  });

  const updateTemplateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => templateCategoryApi.updateTemplateCategory(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATE_CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
      setTemplateCategoryError('');
      showSuccess(
        'Template Category Updated! ✏️',
        `Template category "${variables.data.name || 'item'}" has been updated successfully.`
      );
    },
    onError: (err) => {
      setTemplateCategoryError(err.message || 'Failed to update template category.');
      showError('Update Error ⚠️', err.message || 'Failed to update template category.');
    },
  });

  const deleteTemplateCategoryMutation = useMutation({
    mutationFn: (id) => templateCategoryApi.deleteTemplateCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATE_CATEGORIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.ALL });
      showSuccess('Category Deleted 🗑️', 'Template category removed successfully.');
    },
    onError: (err) => {
      setTemplateCategoryError(err.message || 'Failed to delete template category.');
      showError('Delete Error ⚠️', err.message || 'Failed to delete template category.');
    },
  });

  return (
    <AdminTemplateCategoriesTab
      templateCategories={templateCategories}
      templateCategoryMeta={templateCategoryMeta}
      isLoadingTemplateCategories={isLoadingTemplateCategories}
      templateCategoryError={templateCategoryError || templateCategoriesFetchError?.message}
      templateCategorySearch={templateCategorySearch}
      setTemplateCategorySearch={setTemplateCategorySearch}
      templateCategoryPage={templateCategoryPage}
      setTemplateCategoryPage={setTemplateCategoryPage}
      setTemplateCategoryLimit={setTemplateCategoryLimit}
      createTemplateCategoryMutation={createTemplateCategoryMutation}
      updateTemplateCategoryMutation={updateTemplateCategoryMutation}
      deleteTemplateCategoryMutation={deleteTemplateCategoryMutation}
    />
  );
};

export default AdminTemplateCategoriesPage;
