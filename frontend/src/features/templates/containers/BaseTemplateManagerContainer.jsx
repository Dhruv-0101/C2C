import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "../../../services/template.api";
import { useTemplates, useTemplateCategories } from "../../../hooks/useTemplates";
import { useFestivals } from "../../../hooks/useFestivals";
import { useDebounce } from "../../../hooks/useDebounce";
import { useFeedbackModal } from "../../../hooks/useFeedbackModal";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { readImageAsBase64 } from "../../../utils/file.utils";
import { BaseTemplateManagerView } from "../components/BaseTemplateManagerView";

import { TemplateCreateView } from "../components/TemplateCreateView";

/**
 * BaseTemplateManagerContainer
 * Container component handling base graphic templates queries, image upload readers, and full-screen view switching.
 * Integrates True Server-Side Search & Pagination for Categories and Festivals at infinite scale.
 */
export const BaseTemplateManagerContainer = () => {
  const queryClient = useQueryClient();
  const { modalProps, showSuccess, showError } = useFeedbackModal();
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'create'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullscreenTemplate, setFullscreenTemplate] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    templateCategoryId: "",
    category: "General Business",
    selectedCategoryObj: null,
    festivalId: "",
    selectedFestivalObj: null,
    newCategoryName: "",
    baseImageUrl: "",
  });

  // Templates Grid server pagination & filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedFestival, setSelectedFestival] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Reset page to 1 whenever debounced search or filter selection changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedFestival, selectedCategory]);

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
  const [catSearch, setCatSearch] = useState("");
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
  const [festSearch, setFestSearch] = useState("");
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg("");
      const base64 = await readImageAsBase64(file, 5);
      setFormData((prev) => ({ ...prev, baseImageUrl: base64 }));
    } catch (err) {
      setErrorMsg(err.message || "Failed to read image file.");
    }
  };

  const createTemplateMutation = useMutation({
    mutationFn: (data) => templateApi.createTemplate(data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES.ALL });
      setIsModalOpen(false);
      setViewMode("list");
      resetForm();
      showSuccess(
        "Base Template Published! 🎨",
        `Graphic background template "${variables.title}" uploaded to Cloudinary and saved to database.`,
      );
    },
    onError: (err) => {
      setErrorMsg(err.message || "Failed to save system template.");
      showError(
        "Upload Failed ⚠️",
        err.message || "Failed to upload base template.",
      );
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => templateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.ALL });
      showSuccess(
        "Template Deleted 🗑️",
        "Base graphic template removed from database.",
      );
    },
    onError: (err) => {
      showError(
        "Delete Failed ⚠️",
        err.message || "Failed to delete template.",
      );
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      templateCategoryId: "",
      category: "General Business",
      selectedCategoryObj: null,
      newCategoryName: "",
      festivalId: "",
      selectedFestivalObj: null,
      baseImageUrl: "",
    });
    setErrorMsg("");
  };

  const handleOpenCreate = () => {
    setViewMode("create");
    setCatSearch("");
    setCatPage(1);
    setFestSearch("");
    setFestPage(1);
  };

  const handleBackToList = () => {
    setViewMode("list");
    resetForm();
    setCatSearch("");
    setCatPage(1);
    setFestSearch("");
    setFestPage(1);
  };

  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title.trim() || !formData.baseImageUrl) {
      setErrorMsg(
        "Please enter a template title and upload an image from your computer.",
      );
      return;
    }
    if (formData.category === "NEW" && !formData.newCategoryName?.trim()) {
      setErrorMsg("Please enter a name for your custom category.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      baseImageUrl: formData.baseImageUrl,
      festivalId: formData.festivalId || undefined,
      templateCategoryId: formData.category === "NEW" ? undefined : (formData.templateCategoryId || undefined),
      category: formData.category === "NEW" ? formData.newCategoryName.trim() : formData.category,
      newCategoryName: formData.category === "NEW" ? formData.newCategoryName.trim() : undefined,
    };

    createTemplateMutation.mutate(payload);
  };

  if (viewMode === "create") {
    return (
      <TemplateCreateView
        onBack={handleBackToList}
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
    );
  }

  return (
    <BaseTemplateManagerView
      onOpenCreate={handleOpenCreate}
      modalProps={modalProps}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
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
  );
};
