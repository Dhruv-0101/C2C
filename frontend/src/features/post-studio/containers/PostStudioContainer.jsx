import React, { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandKitApi } from "../../../services/brandkit.api";
import { templateApi } from "../../../services/template.api";
import { festivalApi } from "../../../services/festival.api";
import { postApi } from "../../../services/post.api";
import { useTemplates, useTemplateCategories } from "../../../hooks/useTemplates";
import { useFrames } from "../../../hooks/useFrames";
import { useCategories } from "../../../hooks/useCategories";
import { useFestivals } from "../../../hooks/useFestivals";
import { useBrandKit } from "../../../hooks/useBrandKit";
import { useCanvasCompositor } from "../../../hooks/useCanvasCompositor";
import { useSubscription } from "../../../hooks/useSubscription";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { PostStudioEditorView } from "../components/PostStudioEditorView";
import { SocialPublisherModal } from "../components/SocialPublisherModal";
import PlanSelectionModal from "../../billing/components/PlanSelectionModal";
import PaymentSuccessModal from "../../billing/components/PaymentSuccessModal";

/**
 * PostStudioContainer
 * Container component managing wizard state, template/frame query hooks,
 * canvas compositor integration, post publishing/scheduling modal, subscription quotas, and post saving/downloading logic.
 */
export const PostStudioContainer = () => {
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
  const templateIdParam = searchParams.get("templateId");

  // Wizard Active Step State (1: Template, 2: Frame, 3: Details, 4: Export)
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    passedTemplate?.id || templateIdParam || "",
  );
  const [customBaseImage, setCustomBaseImage] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isPublisherModalOpen, setIsPublisherModalOpen] = useState(false);

  // Multi-Slide Manual Carousel State (Default: 1 Slide)
  const [slides, setSlides] = useState([
    {
      id: "slide-1",
      title: "Main Post Headline",
      text: "Enter your post text or caption explanation here.",
      customBaseImage: null,
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
      setActiveSlideIndex(activeSlideIndex - 1);
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
  const [selectedFestival, setSelectedFestival] = useState("");

  // Template Search & Central Pagination State
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLimit, setTemplateLimit] = useState(3);
  const [templateSearch, setTemplateSearch] = useState("");

  // Canva Frames Central Pagination State
  const [framePage, setFramePage] = useState(1);
  const [frameLimit, setFrameLimit] = useState(3);
  const [frameSearch, setFrameSearch] = useState("");

  // Modular Hook for Graphic Templates (Combined category + festival filtering)
  const {
    templates,
    meta: templatesMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page: templatePage,
    limit: templateLimit,
    search: templateSearch,
    category: selectedCategory,
    templateCategoryId: selectedCategory,
    festivalId: selectedFestival,
  });

  // Modular Hook for Frames (Search + Pagination)
  const {
    frames,
    meta: framesMeta,
    isLoading: isLoadingFrames,
  } = useFrames({
    page: framePage,
    limit: frameLimit,
    search: frameSearch,
  });

  // Fetch Categories List for Filter Bar (Prefer Template Categories, fallback to Business)
  const { categories: templateCategories } = useTemplateCategories();
  const { categories: masterCategories } = useCategories();
  const categoriesList = templateCategories.length > 0 ? templateCategories : masterCategories;

  // Fetch Upcoming Festivals List for Filter Bar
  const { festivals = [] } = useFestivals();

  // Fetch Active User BrandKit Details
  const { brandKit } = useBrandKit();

  // Determine current active base template
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    passedTemplate ||
    templates[0] ||
    null;

  // Auto-select initial template ID if none selected
  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  // Default selectedFrame is null (No Frame selected by default)

  // Ensure active slide defaults to Slide 1 (index 0) when entering Step 2
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
    websiteUrl: "",
    showLogo: true,
    showAvatar: true,
    showPhone: true,
    showAddress: true,
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

  // Populate customDetails whenever brandKit or selectedFrame loads
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
      websiteUrl: brandKit?.websiteUrl || "https://yourbusiness.com",
      tagline: brandKit?.tagline || brandKit?.slogan || frameTagline || "Premium Luxury Homes & Commercial Spaces",
      slogan: brandKit?.slogan || brandKit?.tagline || frameTagline || "Premium Luxury Homes & Commercial Spaces",
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
      const reuseImg = reusePost.graphicUrl || reusePost.finalGraphicUrl || reusePost.post?.finalGraphicUrl;
      if (reuseImg) {
        setCustomBaseImage(reuseImg);
      }
    }
  }, [reusePost]);

  const publisherPayload = {
    templateId: currentTemplate?.id || reusePost?.templateId || null,
    festivalId: currentTemplate?.festivalId || reusePost?.festivalId || null,
    base64Graphic: dataUrl,
    finalGraphicUrl: customBaseImage || reusePost?.graphicUrl || reusePost?.finalGraphicUrl || null,
    occasionName: reusePost?.occasionName || reusePost?.post?.occasionName || currentTemplate?.title || "Branded Graphic Post",
    customText: reusePost?.customText || reusePost?.post?.customText || customDetails?.tagline || customDetails?.businessName,
    caption: reusePost?.customText || reusePost?.post?.customText || "",
    userConfigJson: customDetails,
  };

  const [saveError, setSaveError] = useState("");
  const [createdPostId, setCreatedPostId] = useState(null);

  // Reset createdPostId session lock whenever user modifies graphic design
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
      queryClient.invalidateQueries({ queryKey: ['subscription', 'status'] });
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

  // Handle Save Post to DB (Deducts 1 Post Quota)
  const handleSaveToDb = () => {
    if (isExpired || postsRemaining <= 0) {
      openPlanModal();
      return;
    }

    if (!dataUrl) {
      setSaveError("Canvas graphic is still rendering. Please wait a moment and try again.");
      setTimeout(() => setSaveError(""), 4000);
      return;
    }

    // If this graphic design was already saved in this session, show message without deducting quota again
    if (createdPostId) {
      setSaveSuccess("🎉 Post draft is already saved in your Vault!");
      setTimeout(() => setSaveSuccess(""), 4000);
      return;
    }

    if (savePostMutation.isPending) return;

    // Sanitize userConfigJson so large image data URLs are not duplicated in request body
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
      customText: customDetails?.tagline || customDetails?.businessName || "Custom Graphic Post",
      base64Graphic: dataUrl,
      userConfigJson: sanitizedConfig,
      status: "DRAFT",
    });
  };

  // Handle Download HD PNG (Deducts 1 Post Quota on new graphic design)
  const handleDownloadHD = () => {
    if (isExpired || postsRemaining <= 0) {
      openPlanModal();
      return;
    }

    if (!dataUrl) return;

    // Trigger HD PNG browser file download
    const link = document.createElement("a");
    link.download = `${currentTemplate?.title || "BrandFlow-Post"}-1080x1080.png`;
    link.href = dataUrl;
    link.click();

    // Deduct 1 post quota & save to DB/Vault if this new design hasn't consumed quota yet
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
        festivals={festivals}
        templates={templates}
        templatesMeta={templatesMeta}
        isLoadingTemplates={isLoadingTemplates}
        templateSearch={templateSearch}
        setTemplateSearch={setTemplateSearch}
        setTemplatePage={setTemplatePage}
        setTemplateLimit={setTemplateLimit}
        frames={frames}
        framesMeta={framesMeta}
        isLoadingFrames={isLoadingFrames}
        setFramePage={setFramePage}
        setFrameLimit={setFrameLimit}
        customDetails={customDetails}
        setCustomDetails={setCustomDetails}
        brandKit={brandKit}
        currentTemplate={currentTemplate}
        isRendering={isRendering}
        savePostMutation={savePostMutation}
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
          queryClient.invalidateQueries({ queryKey: ['subscription', 'status'] });
        }}
      />

      <PlanSelectionModal
        isOpen={isPlanModalOpen}
        onClose={closePlanModal}
        currentPlan={planName}
        postsRemaining={postsRemaining}
        onSuccess={(data) => {
          setSuccessData(data);
          queryClient.invalidateQueries({ queryKey: ['subscription', 'status'] });
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
