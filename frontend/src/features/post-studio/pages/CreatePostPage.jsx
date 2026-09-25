import React, { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from '@/features/post-studio/api/post.api';
import { useTemplates } from '@/features/admin/templates/hooks/useTemplates';
import { useTemplateCategories } from '@/features/admin/template-categories/hooks/useTemplateCategories';
import { useFrames } from '@/features/admin/frames/hooks/useFrames';
import { useFestivals } from '@/features/calendar/hooks/useFestivals';
import { useBrandKit } from '@/features/brandkit/hooks/useBrandKit';
import { useCanvasCompositor } from '@/features/post-studio/hooks/useCanvasCompositor';
import { useSubscription } from '@/features/billing/hooks/useSubscription';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { QUERY_KEYS } from '@/shared/constants';
import { PostStudioEditorView } from "../components/PostStudioEditorView";
import { SocialPublisherModal } from "../components/SocialPublisherModal";
import { PlanSelectionModal } from "@/features/billing/components/PlanSelectionModal";
import { PaymentSuccessModal } from "@/features/billing/components/PaymentSuccessModal";

/**
 * CreatePostPage Component
 * Fullscreen Post Studio Route Page (/create-post).
 * Orchestrates multi-step post creation wizard, canvas compositor, branding overlays, and social publisher.
 */
export const CreatePostPage = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Subscription Hook for Quota Enforcement
  const {
    subscription,
    postsRemaining,
    isExpired,
    planName,
    isPlanModalOpen,
    openPlanModal,
    closePlanModal,
    successData,
    setSuccessData,
  } = useSubscription();

  const passedTemplate = location.state?.template;
  const reusePost = location.state?.reusePost;
  const isEditingScheduled = Boolean(location.state?.isEditingScheduled);
  const scheduledPostId = location.state?.scheduledPostId;
  const templateIdParam = searchParams.get("templateId");
  const festivalIdParam = searchParams.get("festivalId") || location.state?.festivalId || "";
  const initialBaseImage = location.state?.customBaseImage || null;

  // Wizard Active Step State (1: Template, 2: Frame, 3: Details, 4: Export)
  const [currentStep, setCurrentStep] = useState(isEditingScheduled ? 3 : 1);

  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    passedTemplate?.id ||
    reusePost?.templateId ||
    reusePost?.post?.templateId ||
    reusePost?.template?.id ||
    templateIdParam ||
    ""
  );
  const [customBaseImage, setCustomBaseImage] = useState(initialBaseImage);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);

  // Multi-Slide Manual Carousel State (Default: 1 Slide)
  const [slides, setSlides] = useState([
    {
      id: "slide-1",
      title: "Main Post Headline",
      text: "Enter your post text or caption explanation here.",
      customBaseImage: initialBaseImage,
      selectedFrame: null,
    },
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Carousel Handlers
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${slides.length + 1} Headline`,
      text: "Enter your slide explanation text here.",
      customBaseImage: null,
      selectedFrame: null,
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleRemoveSlide = (indexToRemove) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activeSlideIndex >= indexToRemove && activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
    }
  };

  const handleDuplicateSlide = (indexToDup) => {
    const slideToDup = slides[indexToDup];
    if (!slideToDup) return;
    const duplicated = {
      ...slideToDup,
      id: `slide-${Date.now()}`,
      title: `${slideToDup.title} (Copy)`,
    };
    const newSlides = [...slides];
    newSlides.splice(indexToDup + 1, 0, duplicated);
    setSlides(newSlides);
    setActiveSlideIndex(indexToDup + 1);
  };

  const handleMoveSlide = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSlides(updated);
    setActiveSlideIndex(targetIndex);
  };

  const handleUpdateActiveSlide = (key, value) => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [key]: value } : s))
    );
  };

  // Template Category & Festival Filter States
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFestival, setSelectedFestival] = useState(festivalIdParam);

  // Sync incoming router state
  useEffect(() => {
    if (festivalIdParam && festivalIdParam !== selectedFestival) {
      setSelectedFestival(festivalIdParam);
    }
    if (location.state?.customBaseImage && !customBaseImage) {
      setCustomBaseImage(location.state.customBaseImage);
    }
  }, [festivalIdParam, location.state]);

  // Template Search & Central Pagination State
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLimit, setTemplateLimit] = useState(8);
  const [templateSearch, setTemplateSearch] = useState("");
  const debouncedTemplateSearch = useDebounce(templateSearch, 300);

  // Canva Frames Central Pagination State
  const [framePage, setFramePage] = useState(1);
  const [frameLimit, setFrameLimit] = useState(8);
  const [frameSearch, setFrameSearch] = useState("");
  const debouncedFrameSearch = useDebounce(frameSearch, 300);

  // Auto-reset template page to 1 on search or filter change
  useEffect(() => {
    setTemplatePage(1);
  }, [debouncedTemplateSearch, selectedCategory, selectedFestival]);

  // Auto-reset frame page to 1 on frame search change
  useEffect(() => {
    setFramePage(1);
  }, [debouncedFrameSearch]);

  // Modular Hook for Graphic Templates
  const {
    templates,
    meta: templatesMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page: templatePage,
    limit: templateLimit,
    search: debouncedTemplateSearch,
    category: selectedCategory,
    templateCategoryId: selectedCategory,
    festivalId: selectedFestival,
  });

  // Modular Hook for Frames
  const {
    frames,
    meta: framesMeta,
    isLoading: isLoadingFrames,
  } = useFrames({
    page: framePage,
    limit: frameLimit,
    search: debouncedFrameSearch,
  });

  // Step 1 Category & Festival Server Pagination & Search
  const [catSearch, setCatSearch] = useState("");
  const [catPage, setCatPage] = useState(1);
  const debouncedCatSearch = useDebounce(catSearch, 300);

  const [festSearch, setFestSearch] = useState("");
  const [festPage, setFestPage] = useState(1);
  const debouncedFestSearch = useDebounce(festSearch, 300);

  useEffect(() => {
    setCatPage(1);
  }, [debouncedCatSearch]);

  useEffect(() => {
    setFestPage(1);
  }, [debouncedFestSearch]);

  const {
    categories: templateCategories = [],
    meta: categoryMeta,
    isLoading: isLoadingCategories,
  } = useTemplateCategories({
    page: catPage,
    limit: 8,
    search: debouncedCatSearch || undefined,
  });
  const categoriesList = templateCategories;

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

  // Fetch Active User BrandKit Details
  const { brandKit } = useBrandKit();

  // Determine current active base template
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    passedTemplate ||
    templates[0] ||
    null;

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (currentStep === 2) {
      setActiveSlideIndex(0);
    }
  }, [currentStep]);

  // Live Overrides for Business Details
  const [customDetails, setCustomDetails] = useState({
    businessName: "",
    phone: "",
    address: "",
    tagline: "",
    whatsapp: "",
    email: "",
    instagramHandle: "",
    facebookHandle: "",
    city: "",
    state: "",
    country: "",
    showLogo: true,
    showAvatar: true,
    showUpiQr: true,
    showPhone: true,
    showAddress: true,
    upiVpa: "",
    upiQrUrl: null,
  });

  const extractSampleText = (frame, slotName) => {
    if (!frame) return "";
    let rawConfig = frame.configJson || frame.blueprint || frame.layoutConfig || frame.jsonConfig || frame.config;
    if (typeof rawConfig === "string") {
      try {
        rawConfig = JSON.parse(rawConfig);
      } catch (e) {}
    }
    const elements = Array.isArray(rawConfig)
      ? rawConfig
      : (rawConfig?.elements && Array.isArray(rawConfig.elements) ? rawConfig.elements : []);
    const match = elements.find(
      (el) =>
        el.dynamicSlot === slotName ||
        (slotName === "TAGLINE" &&
          (el.dynamicSlot === "SLOGAN" || el.text?.toLowerCase().includes("slogan") || el.name?.toLowerCase().includes("slogan")))
    );
    return match?.text || match?.defaultText || "";
  };

  useEffect(() => {
    const frameBizName = extractSampleText(selectedFrame, "BUSINESS_NAME");
    const framePhone = extractSampleText(selectedFrame, "PHONE");
    const frameAddress = extractSampleText(selectedFrame, "ADDRESS");
    const frameTagline = extractSampleText(selectedFrame, "TAGLINE");

    setCustomDetails((prev) => ({
      ...prev,
      businessName: brandKit?.businessName || frameBizName || "Sunrise Real Estate",
      phone: brandKit?.phone || brandKit?.whatsapp || framePhone || "+91 98765 43210",
      whatsapp: brandKit?.whatsapp || framePhone || "+91 98765 43210",
      email: brandKit?.email || "contact@business.com",
      instagramHandle: brandKit?.instagramHandle || "@yourbrand",
      facebookHandle: brandKit?.facebookHandle || "yourbrand",
      address: brandKit?.address || frameAddress || "Business Park, MG Road, Mumbai",
      city: brandKit?.city || "Mumbai",
      state: brandKit?.state || "Maharashtra",
      country: brandKit?.country || "India",
      tagline: brandKit?.tagline || brandKit?.slogan || frameTagline || "Premium Luxury Homes & Commercial Spaces",
      slogan: brandKit?.slogan || brandKit?.tagline || frameTagline || "Premium Luxury Homes & Commercial Spaces",
      upiVpa: brandKit?.upiVpa || "",
      upiQrUrl: brandKit?.upiQrUrl || null,
      showUpiQr: prev.showUpiQr !== undefined ? prev.showUpiQr : true,
    }));
  }, [brandKit, selectedFrame]);

  const baseImageUrl =
    customBaseImage ||
    currentTemplate?.baseImageUrl ||
    currentTemplate?.imageUrl ||
    currentTemplate?.fileUrl ||
    currentTemplate?.bannerUrl;

  // HTML5 Canvas Compositor Engine Hook
  const { isRendering, dataUrl } = useCanvasCompositor(
    canvasRef,
    baseImageUrl,
    selectedFrame,
    brandKit,
    customDetails,
  );

  useEffect(() => {
    if (reusePost) {
      const templateId =
        reusePost.templateId ||
        reusePost.post?.templateId ||
        reusePost.template?.id;

      if (templateId) {
        setSelectedTemplateId(templateId);
        setCustomBaseImage(null);
      } else {
        const reuseImg =
          reusePost.graphicUrl ||
          reusePost.finalGraphicUrl ||
          reusePost.post?.finalGraphicUrl;
        if (reuseImg) {
          setCustomBaseImage(reuseImg);
        }
      }

      const frame = reusePost.frame || reusePost.post?.frame;
      if (frame) {
        setSelectedFrame(frame);
      }
    }
  }, [reusePost]);

  const publisherPayload = {
    templateId: currentTemplate?.id || reusePost?.templateId || null,
    festivalId: currentTemplate?.festivalId || reusePost?.festivalId || null,
    base64Graphic: dataUrl,
    finalGraphicUrl: customBaseImage || reusePost?.graphicUrl || reusePost?.finalGraphicUrl || null,
    occasionName: reusePost?.occasionName || reusePost?.post?.occasionName || currentTemplate?.title || "Branded Graphic Post",
    caption: reusePost?.captions?.[0]?.captionText || reusePost?.caption || "",
    userConfigJson: customDetails,
  };

  const [saveError, setSaveError] = useState("");
  const [createdPostId, setCreatedPostId] = useState(null);

  useEffect(() => {
    setCreatedPostId(null);
  }, [selectedTemplateId, selectedFrame?.id, customBaseImage, customDetails]);

  // Save Generated Post Mutation
  const savePostMutation = useMutation({
    mutationFn: (postData) => postApi.createPost(postData),
    onSuccess: (res) => {
      const newId = res?.data?.id || res?.data?.post?.id || res?.id || "saved";
      setCreatedPostId(newId);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.STATUS });
      setSaveError("");
      setSaveSuccess(
        "🎉 Composited post saved to Cloudinary & Vault! (1 Post Quota deducted)",
      );
      setTimeout(() => setSaveSuccess(""), 4000);
    },
    onError: (err) => {
      setSaveSuccess("");
      if (err?.response?.data?.code === "PLAN_EXPIRED" || err?.response?.status === 403) {
        openPlanModal();
      }
      setSaveError(
        err?.response?.data?.message || err?.message || "Failed to save post to Vault."
      );
      setTimeout(() => setSaveError(""), 5000);
    },
  });

  // In-Place Update Scheduled Post Graphic Mutation
  const updatePostGraphicMutation = useMutation({
    mutationFn: ({ postId, payload }) => postApi.updatePostGraphic(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setSaveError("");
      setSaveSuccess(
        "🎉 Scheduled post graphic updated with latest BrandKit! (0 post credits deducted)",
      );
      setTimeout(() => setSaveSuccess(""), 4000);
    },
    onError: (err) => {
      setSaveSuccess("");
      setSaveError(
        err?.response?.data?.message || err?.message || "Failed to update scheduled post graphic."
      );
      setTimeout(() => setSaveError(""), 5000);
    },
  });

  const handleSaveToDb = () => {
    if (isEditingScheduled) {
      const targetPostId = reusePost?.id || reusePost?.post?.id;
      if (!targetPostId) {
        setSaveError("Scheduled post identifier missing.");
        return;
      }

      if (!dataUrl) {
        setSaveError("Canvas graphic is still rendering. Please wait a moment and try again.");
        setTimeout(() => setSaveError(""), 4000);
        return;
      }

      if (updatePostGraphicMutation.isPending) return;

      const sanitizedConfig = { ...customDetails };
      Object.keys(sanitizedConfig).forEach((k) => {
        if (typeof sanitizedConfig[k] === "string" && sanitizedConfig[k].startsWith("data:image/")) {
          delete sanitizedConfig[k];
        }
      });

      updatePostGraphicMutation.mutate({
        postId: targetPostId,
        payload: {
          base64Graphic: dataUrl,
          userConfigJson: sanitizedConfig,
        },
      });
      return;
    }

    if (isExpired || postsRemaining <= 0) {
      openPlanModal();
      return;
    }

    if (!dataUrl) {
      setSaveError("Canvas graphic is still rendering. Please wait a moment and try again.");
      setTimeout(() => setSaveError(""), 4000);
      return;
    }

    if (createdPostId) {
      setSaveSuccess("🎉 Post draft is already saved in your Vault!");
      setTimeout(() => setSaveSuccess(""), 4000);
      return;
    }

    if (savePostMutation.isPending) return;

    const sanitizedConfig = { ...customDetails };
    Object.keys(sanitizedConfig).forEach((k) => {
      if (typeof sanitizedConfig[k] === "string" && sanitizedConfig[k].startsWith("data:image/")) {
        delete sanitizedConfig[k];
      }
    });

    savePostMutation.mutate({
      templateId: currentTemplate?.id || null,
      festivalId: currentTemplate?.festivalId || null,
      frameId: selectedFrame?.id || null,
      occasionName: currentTemplate?.title || selectedFrame?.title || "Branded Graphic Post",
      base64Graphic: dataUrl,
      userConfigJson: sanitizedConfig,
      status: "DRAFT",
    });
  };

  const handleDownloadHD = () => {
    if (isExpired || postsRemaining <= 0) {
      openPlanModal();
      return;
    }

    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `${currentTemplate?.title || "BrandFlow-Post"}-1080x1080.png`;
    link.href = dataUrl;
    link.click();

    if (!createdPostId && !savePostMutation.isPending) {
      handleSaveToDb();
    }
  };

  const handleOpenPublisher = () => {
    if (isExpired || postsRemaining <= 0) {
      openPlanModal();
      return;
    }
    setIsPublisherModalOpen(true);
  };

  return (
    <>
      <PostStudioEditorView
        canvasRef={canvasRef}
        navigate={navigate}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        selectedFrame={selectedFrame}
        setSelectedFrame={setSelectedFrame}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
        customBaseImage={customBaseImage}
        setCustomBaseImage={setCustomBaseImage}
        saveSuccess={saveSuccess}
        saveError={saveError}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFestival={selectedFestival}
        setSelectedFestival={setSelectedFestival}
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
        templates={templates}
        templatesMeta={templatesMeta}
        isLoadingTemplates={isLoadingTemplates}
        templateSearch={templateSearch}
        setTemplateSearch={setTemplateSearch}
        templatePage={templatePage}
        setTemplatePage={setTemplatePage}
        templateLimit={templateLimit}
        setTemplateLimit={setTemplateLimit}
        frames={frames}
        framesMeta={framesMeta}
        isLoadingFrames={isLoadingFrames}
        frameSearch={frameSearch}
        setFrameSearch={setFrameSearch}
        framePage={framePage}
        setFramePage={setFramePage}
        frameLimit={frameLimit}
        setFrameLimit={setFrameLimit}
        customDetails={customDetails}
        setCustomDetails={setCustomDetails}
        brandKit={brandKit}
        currentTemplate={currentTemplate}
        isRendering={isRendering}
        savePostMutation={savePostMutation}
        isEditingScheduled={isEditingScheduled}
        isUpdatingGraphic={updatePostGraphicMutation.isPending}
        handleSaveToDb={handleSaveToDb}
        handleDownloadHD={handleDownloadHD}
        onOpenPublisherModal={handleOpenPublisher}
        slides={slides}
        activeSlideIndex={activeSlideIndex}
        setActiveSlideIndex={setActiveSlideIndex}
        onAddSlide={handleAddSlide}
        onRemoveSlide={handleRemoveSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onMoveSlide={handleMoveSlide}
        onUpdateActiveSlide={handleUpdateActiveSlide}
        subscription={subscription}
        postsRemaining={postsRemaining}
        isExpired={isExpired}
        planName={planName}
        openPlanModal={openPlanModal}
      />

      <SocialPublisherModal
        isOpen={isPublisherModalOpen}
        onClose={() => setIsPublisherModalOpen(false)}
        postData={publisherPayload}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.STATUS });
        }}
      />

      <PlanSelectionModal
        isOpen={isPlanModalOpen}
        onClose={closePlanModal}
        currentPlan={planName}
        postsRemaining={postsRemaining}
        onSuccess={(data) => {
          setSuccessData(data);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.STATUS });
        }}
      />

      <PaymentSuccessModal
        isOpen={!!successData}
        onClose={() => setSuccessData(null)}
        data={successData}
      />
    </>
  );
};

export { CreatePostPage as PostStudioContainer };
export default CreatePostPage;
