import React, { useState, useRef, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandKitApi } from "../../../services/brandkit.api";
import { postApi } from "../../../services/post.api";
import { useTemplates } from "../../../hooks/useTemplates";
import { useFrames } from "../../../hooks/useFrames";
import { useCanvasCompositor } from "../../../hooks/useCanvasCompositor";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { PostStudioEditorView } from "../components/PostStudioEditorView";
import { SocialPublisherModal } from "../components/SocialPublisherModal";

/**
 * PostStudioContainer
 * Container component managing wizard state, template/frame query hooks,
 * canvas compositor integration, post publishing/scheduling modal, and post saving/downloading logic.
 */
export const PostStudioContainer = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const passedTemplate = location.state?.template;
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

  // Template Search & Central Pagination State
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLimit, setTemplateLimit] = useState(6);
  const [templateSearch, setTemplateSearch] = useState("");

  // Canva Frames Central Pagination State
  const [framePage, setFramePage] = useState(1);
  const [frameLimit, setFrameLimit] = useState(6);
  const [frameSearch, setFrameSearch] = useState("");

  // Modular Hook for Graphic Templates
  const {
    templates,
    meta: templatesMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page: templatePage,
    limit: templateLimit,
    search: templateSearch,
  });

  // Modular Hook for Canva Frames
  const {
    frames,
    meta: framesMeta,
    isLoading: isLoadingFrames,
  } = useFrames({
    page: framePage,
    limit: frameLimit,
    search: frameSearch,
  });

  // Fetch User's BrandKit from DB
  const { data: brandKitResponse } = useQuery({
    queryKey: ["brandKit"],
    queryFn: () => brandKitApi.getBrandKit(),
  });

  const brandKit = brandKitResponse?.data?.brandKit;

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

  // Default select first frame when frames load
  useEffect(() => {
    if (frames.length > 0 && !selectedFrame) {
      setSelectedFrame(frames[0]);
    }
  }, [frames, selectedFrame]);

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

  // Populate customDetails whenever brandKit or selectedFrame loads
  useEffect(() => {
    const newDetails = {};

    if (brandKit?.businessName) newDetails.businessName = brandKit.businessName;
    if (brandKit?.phone || brandKit?.whatsapp)
      newDetails.phone = brandKit.phone || brandKit.whatsapp;
    if (brandKit?.whatsapp) newDetails.whatsapp = brandKit.whatsapp;
    if (brandKit?.email) newDetails.email = brandKit.email;
    if (brandKit?.instagramHandle)
      newDetails.instagramHandle = brandKit.instagramHandle;
    if (brandKit?.facebookHandle)
      newDetails.facebookHandle = brandKit.facebookHandle;
    if (brandKit?.address) newDetails.address = brandKit.address;
    if (brandKit?.city) newDetails.city = brandKit.city;
    if (brandKit?.state) newDetails.state = brandKit.state;
    if (brandKit?.country) newDetails.country = brandKit.country;
    if (brandKit?.websiteUrl) newDetails.websiteUrl = brandKit.websiteUrl;
    if (brandKit?.tagline) newDetails.tagline = brandKit.tagline;

    setCustomDetails((prev) => ({
      ...prev,
      ...newDetails,
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

  // Save Generated Post Mutation
  const savePostMutation = useMutation({
    mutationFn: (postData) => postApi.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setSaveSuccess(
        "🎉 Final composited post saved to Cloudinary, DB & Vault!",
      );
      setTimeout(() => setSaveSuccess(""), 4000);
    },
  });

  // Handle Save Post to DB
  const handleSaveToDb = () => {
    if (!dataUrl) return;
    savePostMutation.mutate({
      templateId: currentTemplate?.id || null,
      festivalId: currentTemplate?.festivalId || null,
      frameId: selectedFrame?.id || null,
      base64Graphic: dataUrl,
      userConfigJson: customDetails,
      status: "DRAFT",
    });
  };

  // Handle Download HD PNG & Save to Cloud/DB
  const handleDownloadHD = () => {
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `${currentTemplate?.title || "BrandFlow-Post"}-1080x1080.png`;
    link.href = dataUrl;
    link.click();

    handleSaveToDb();
  };

  const publisherPayload = {
    templateId: currentTemplate?.id || null,
    festivalId: currentTemplate?.festivalId || null,
    base64Graphic: dataUrl,
    occasionName: currentTemplate?.title || "Branded Graphic Post",
    customText: customDetails?.tagline || customDetails?.businessName,
    userConfigJson: customDetails,
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
        currentTemplate={currentTemplate}
        isRendering={isRendering}
        savePostMutation={savePostMutation}
        handleSaveToDb={handleSaveToDb}
        handleDownloadHD={handleDownloadHD}
        onOpenPublisherModal={() => setIsPublisherModalOpen(true)}
      />

      <SocialPublisherModal
        isOpen={isPublisherModalOpen}
        onClose={() => setIsPublisherModalOpen(false)}
        postData={publisherPayload}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
        }}
      />
    </>
  );
};
