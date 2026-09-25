import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from './api/template.api';
import { useTemplates } from './hooks/useTemplates';
import { useTemplateCategories } from '@/features/admin/template-categories/hooks/useTemplateCategories';
import { useFestivals } from '@/features/calendar/hooks/useFestivals';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useFeedbackModal } from '@/components/feedback/FeedbackModal';
import { QUERY_KEYS } from '@/shared/constants';
import { createImagePreview } from '@/shared/utils/file.util';
import { BaseTemplateManagerView } from './components/BaseTemplateManagerView';
import { TemplateCreateModal } from './components/TemplateCreateModal';

/**
 * AdminTemplatesTab Component
 * Canonical orchestrator tab for managing AI base graphic templates and upload modal.
 */
export const AdminTemplatesTab = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();

  // Modal & View State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fullscreenTemplate, setFullscreenTemplate] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for Template Creation
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templateCategoryId: '',
    category: 'General Business',
    selectedCategoryObj: null,
    festivalId: '',
    selectedFestivalObj: null,
    newCategoryName: '',
    baseImageUrl: '',
    imageFile: null,
  });

  // Templates Grid Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedFestival, setSelectedFestival] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedFestival, selectedCategory]);

  // Main Templates Query Hook
  const {
    templates,
    meta: templateMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page,
    limit,
    search: debouncedSearch || undefined,
    festivalId: selectedFestival || undefined,
    category: selectedCategory || undefined,
    templateCategoryId: selectedCategory || undefined,
  });

  // Server-Side Category Selector State (8 per page)
  const [catPage, setCatPage] = useState(1);
  const [catSearch, setCatSearch] = useState('');
  const debouncedCatSearch = useDebounce(catSearch, 300);

  useEffect(() => {
    setCatPage(1);
  }, [debouncedCatSearch]);

  const {
    categories: categoriesList = [],
    meta: categoryMeta,
    isLoading: isLoadingCategories,
  } = useTemplateCategories({
    page: catPage,
    limit: 8,
    search: debouncedCatSearch || undefined,
  });

  // Server-Side Festival Selector State (8 per page)
  const [festPage, setFestPage] = useState(1);
  const [festSearch, setFestSearch] = useState('');
  const debouncedFestSearch = useDebounce(festSearch, 300);

  useEffect(() => {
    setFestPage(1);
  }, [debouncedFestSearch]);

  const {
    festivals = [],
    meta: festivalMeta,
    isLoading: isLoadingFestivals,
  } = useFestivals({
    page: festPage,
    limit: 8,
    search: debouncedFestSearch || undefined,
    includeInactive: true,
  });

  // Reset Form Helper
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      templateCategoryId: '',
      category: 'General Business',
      selectedCategoryObj: null,
      newCategoryName: '',
      festivalId: '',
      selectedFestivalObj: null,
      baseImageUrl: '',
      imageFile: null,
    });
    setErrorMsg('');
  };

  // Image Upload File Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg('');
      const previewUrl = createImagePreview(file, 10);
      setFormData((prev) => ({ ...prev, baseImageUrl: previewUrl, imageFile: file }));
    } catch (err) {
      setErrorMsg(err.message || 'Failed to read image file.');
    }
  };

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: (data) => templateApi.createTemplate(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATE_CATEGORIES.ALL });
      setIsCreateModalOpen(false);
      resetForm();
      showSuccess(
        'Base Template Published! 🎨',
        `Graphic background template "${variables?.title || formData.title || 'Template'}" uploaded to Cloudinary and saved to database.`
      );
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save system template.');
      showError('Upload Failed ⚠️', err.message || 'Failed to upload base template.');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => templateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATE_CATEGORIES.ALL });
      showSuccess('Template Deleted 🗑️', 'Base graphic template removed from database.');
    },
    onError: (err) => {
      showError('Delete Failed ⚠️', err.message || 'Failed to delete template.');
    },
  });

  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title.trim() || !formData.imageFile) {
      setErrorMsg('Please enter a template title and upload an image from your computer.');
      return;
    }
    if (formData.category === 'NEW' && !formData.newCategoryName?.trim()) {
      setErrorMsg('Please enter a name for your custom category.');
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    if (formData.description?.trim()) fd.append('description', formData.description.trim());
    if (formData.festivalId) fd.append('festivalId', formData.festivalId);
    if (formData.category !== 'NEW' && formData.templateCategoryId) {
      fd.append('templateCategoryId', formData.templateCategoryId);
    }
    const categoryVal = formData.category === 'NEW' ? formData.newCategoryName.trim() : formData.category;
    if (categoryVal) {
      fd.append('category', categoryVal);
    }
    if (formData.category === 'NEW' && formData.newCategoryName?.trim()) {
      fd.append('newCategoryName', formData.newCategoryName.trim());
    }
    fd.append('image', formData.imageFile);
    createTemplateMutation.mutate(fd);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full">
      {/* Templates Directory View */}
      <BaseTemplateManagerView
        onOpenCreate={() => {
          resetForm();
          setIsCreateModalOpen(true);
        }}
        modalProps={modalProps}
        isModalOpen={isCreateModalOpen}
        setIsModalOpen={setIsCreateModalOpen}
        fullscreenTemplate={fullscreenTemplate}
        setFullscreenTemplate={setFullscreenTemplate}
        errorMsg={errorMsg}
        formData={formData}
        setFormData={setFormData}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        selectedFestival={selectedFestival}
        setSelectedFestival={setSelectedFestival}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        templates={templates}
        templateMeta={templateMeta}
        isLoadingTemplates={isLoadingTemplates}
        festivals={festivals}
        festivalMeta={festivalMeta}
        festSearch={festSearch}
        setFestSearch={setFestSearch}
        festPage={festPage}
        setFestPage={setFestPage}
        isLoadingFestivals={isLoadingFestivals}
        categoriesList={categoriesList}
        categoryMeta={categoryMeta}
        catSearch={catSearch}
        setCatSearch={setCatSearch}
        catPage={catPage}
        setCatPage={setCatPage}
        isLoadingCategories={isLoadingCategories}
        handleFileChange={handleFileChange}
        createTemplateMutation={createTemplateMutation}
        deleteTemplateMutation={deleteTemplateMutation}
        handleFormSubmit={handleFormSubmit}
      />

      {/* Upload & Create Base Graphic Modal */}
      <TemplateCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        handleFileChange={handleFileChange}
        handleFormSubmit={handleFormSubmit}
        errorMsg={errorMsg}
        categoriesList={categoriesList}
        categoryMeta={categoryMeta}
        catSearch={catSearch}
        setCatSearch={setCatSearch}
        catPage={catPage}
        setCatPage={setCatPage}
        isLoadingCategories={isLoadingCategories}
        festivals={festivals}
        festivalMeta={festivalMeta}
        festSearch={festSearch}
        setFestSearch={setFestSearch}
        festPage={festPage}
        setFestPage={setFestPage}
        isLoadingFestivals={isLoadingFestivals}
        isUploading={createTemplateMutation.isPending}
      />
    </div>
  );
};

export default AdminTemplatesTab;
