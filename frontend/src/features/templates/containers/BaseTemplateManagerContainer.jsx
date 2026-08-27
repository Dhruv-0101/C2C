import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "../../../services/template.api";
import { festivalApi } from "../../../services/festival.api";
import { useTemplates } from "../../../hooks/useTemplates";
import { useFeedbackModal } from "../../../hooks/useFeedbackModal";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { readImageAsBase64 } from "../../../utils/file.utils";
import { BaseTemplateManagerView } from "../components/BaseTemplateManagerView";

import { TemplateCreateView } from "../components/TemplateCreateView";

/**
 * BaseTemplateManagerContainer
 * Container component handling base graphic templates queries, image upload readers, and full-screen view switching.
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
    category: "GENERAL",
    festivalId: "",
    baseImageUrl: "",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState("");
  const [selectedFestival, setSelectedFestival] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    templates,
    meta: templateMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page,
    limit,
    search,
    festivalId: selectedFestival,
    category: selectedCategory,
  });

  const { data: festivalResponse } = useQuery({
    queryKey: QUERY_KEYS.FESTIVALS.ALL,
    queryFn: () => festivalApi.getFestivals(),
  });

  const { data: categoryResponse } = useQuery({
    queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES,
    queryFn: () => templateApi.getTemplateCategories(),
  });

  const festivals = festivalResponse?.data?.festivals || [];
  const categoriesList = categoryResponse?.data?.categories || [];

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
      setIsModalOpen(false);
      setViewMode("list");
      resetForm();
      showSuccess(
        "Base Template Published! 🎨",
        `Graphic background blueprint "${variables.title}" uploaded to Cloudinary and saved to database.`,
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
        "Base graphic blueprint removed from database.",
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
      festivalId: "",
      baseImageUrl: "",
    });
    setErrorMsg("");
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
      ...formData,
      category: formData.category === "NEW" ? formData.newCategoryName.trim() : formData.category,
      newCategoryName: formData.category === "NEW" ? formData.newCategoryName.trim() : undefined,
    };

    createTemplateMutation.mutate(payload);
  };

  if (viewMode === "create") {
    return (
      <TemplateCreateView
        onBack={() => {
          setViewMode("list");
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        handleFileChange={handleFileChange}
        handleFormSubmit={handleFormSubmit}
        errorMsg={errorMsg}
        categoriesList={categoriesList}
        festivals={festivals}
        isUploading={createTemplateMutation.isPending}
      />
    );
  }

  return (
    <BaseTemplateManagerView
      onOpenCreate={() => setViewMode("create")}
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
      categoriesList={categoriesList}
      handleFileChange={handleFileChange}
      createTemplateMutation={createTemplateMutation}
      deleteTemplateMutation={deleteTemplateMutation}
      handleFormSubmit={handleFormSubmit}
    />
  );
};
