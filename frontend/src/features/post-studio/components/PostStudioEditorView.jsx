import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Eye,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { AiCaptionGeneratorModal } from "./AiCaptionGeneratorModal";
import { useTheme } from "@/shared/hooks";

// Extracted Modular Step Components
import { Step1VisualSelector } from "./steps/Step1VisualSelector";
import { Step2FrameSelector } from "./steps/Step2FrameSelector";
import { Step3BrandDetails } from "./steps/Step3BrandDetails";
import { Step4ExportPublisher } from "./steps/Step4ExportPublisher";
import { StudioLivePreview } from "./preview/StudioLivePreview";
import { ZoomedFrameModal } from "./preview/ZoomedFrameModal";

/**
 * PostStudioEditorView
 * Thin Parent Orchestrator rendering the 4-step wizard workflow and persistent Live Canvas stage.
 */
export const PostStudioEditorView = ({
  canvasRef,
  navigate,
  currentStep,
  setCurrentStep,
  selectedFrame,
  setSelectedFrame,
  selectedTemplateId,
  setSelectedTemplateId,
  customBaseImage,
  setCustomBaseImage,
  activeVideo,
  setActiveVideo,
  saveSuccess,
  saveError,
  selectedCategory,
  setSelectedCategory,
  selectedFestival,
  setSelectedFestival,
  categoriesList = [],
  categoryMeta,
  catSearch = "",
  setCatSearch,
  catPage = 1,
  setCatPage,
  isLoadingCategories = false,
  festivals = [],
  festivalMeta,
  festSearch = "",
  setFestSearch,
  festPage = 1,
  setFestPage,
  isLoadingFestivals = false,
  templates = [],
  templatesMeta,
  isLoadingTemplates = false,
  templateSearch = "",
  setTemplateSearch,
  templatePage = 1,
  setTemplatePage,
  templateLimit = 8,
  setTemplateLimit,
  frames = [],
  framesMeta,
  isLoadingFrames = false,
  frameSearch = "",
  setFrameSearch,
  framePage = 1,
  setFramePage,
  frameLimit = 8,
  setFrameLimit,
  customDetails,
  setCustomDetails,
  brandKit,
  currentTemplate,
  isRendering,
  savePostMutation,
  isEditingScheduled = false,
  isUpdatingGraphic = false,
  handleSaveToDb,
  handleDownloadHD,
  onOpenPublisherModal,
  subscription,
  postsRemaining = 0,
  isExpired = false,
  planName = "FREE",
  openPlanModal,
  activateFreeMutation,
  isCreditAlreadyPaid = false,
  setIsCreditAlreadyPaid,
}) => {
  const { isDark } = useTheme();
  const customFileInputRef = useRef(null);

  // Step 4 Export Sub-Tab State ('schedule' | 'download')
  const [exportTab, setExportTab] = useState("schedule");
  const [isDownloading, setIsDownloading] = useState(false);

  // Step 1 Category & Festival Dropdowns
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFestivalDropdownOpen, setIsFestivalDropdownOpen] = useState(false);

  const catTotalPages = categoryMeta?.totalPages || 1;
  const festTotalPages = festivalMeta?.totalPages || 1;
  const selectedFestivalObj = festivals.find((f) => f.id === selectedFestival);

  // Zoomed Frame Lightbox Modal State
  const [zoomedFrame, setZoomedFrame] = useState(null);

  // Custom Upload Lightbox Preview & Drag-and-drop State
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Mobile Studio View Switcher State ('editor' | 'preview')
  const [mobileStudioTab, setMobileStudioTab] = useState("editor");

  // Step 1 Creative Workflow Mode ('AI' | 'TEMPLATES' | 'UPLOAD' | 'REEL')
  const [step1Mode, setStep1Mode] = useState(activeVideo?.videoUrl ? "REEL" : "AI");

  // AI Caption Modal State
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);

  // Live Reel Simulator Playback & Audio Control
  const livePreviewVideoRef = useRef(null);
  const [isSimulatorPlaying, setIsSimulatorPlaying] = useState(true);
  const [isSimulatorMuted, setIsSimulatorMuted] = useState(true);

  // Sync simulator playback state when videoUrl changes
  useEffect(() => {
    if (activeVideo?.videoUrl) {
      setIsSimulatorPlaying(true);
    }
  }, [activeVideo?.videoUrl]);

  const handleToggleSimulatorPlayback = () => {
    const video = livePreviewVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsSimulatorPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsSimulatorPlaying(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBaseImage(reader.result);
      if (setIsCreditAlreadyPaid) {
        setIsCreditAlreadyPaid(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomImage = () => {
    setCustomBaseImage(null);
    if (customFileInputRef.current) {
      customFileInputRef.current.value = "";
    }
    if (setIsCreditAlreadyPaid) {
      setIsCreditAlreadyPaid(false);
    }
  };

  // Lock body & document scroll completely when Zoom Lightbox Modal is open
  useEffect(() => {
    if (zoomedFrame) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [zoomedFrame]);

  const steps = [
    { num: 1, title: "Select Base Graphic" },
    { num: 2, title: "Choose Brand Frame" },
    { num: 3, title: selectedFrame ? "BrandKit Details" : "BrandKit Details (Optional)" },
    { num: 4, title: "Publish & Export" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Wizard Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-3.5 sm:p-5 rounded-2xl shadow-xl">
        <div className="min-w-0">
          <h1 className="font-heading font-extrabold text-lg sm:text-xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="truncate">Post Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 truncate sm:text-clip">
            Create branded posts with custom frames & BrandKit.
          </p>
        </div>

        {/* Wizard Stepper Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 custom-scrollbar">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer min-h-[38px] ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-glow"
                    : isCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-[#0B0F17] text-slate-400 border border-[#2C384E]"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-extrabold shrink-0">
                  {isCompleted ? "✓" : step.num}
                </span>
                <span className="whitespace-nowrap">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {saveSuccess && <Alert variant="success" message={saveSuccess} />}
      {saveError && <Alert variant="danger" message={saveError} />}

      {/* Mobile-only View Switcher */}
      <div className="lg:hidden flex items-center p-1 bg-[#131B2A] border border-[#2C384E] rounded-xl text-xs font-bold shadow-md">
        <button
          type="button"
          onClick={() => setMobileStudioTab("editor")}
          className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer min-h-[40px] ${
            mobileStudioTab === "editor"
              ? "bg-amber-500 text-slate-950 font-extrabold shadow-glow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Step {currentStep} Editor</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStudioTab("preview")}
          className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer min-h-[40px] ${
            mobileStudioTab === "preview"
              ? "bg-amber-500 text-slate-950 font-extrabold shadow-glow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Live Canvas ({activeVideo?.videoUrl ? "Reel" : "HD"})</span>
        </button>
      </div>

      {/* Main Studio Viewport (Left Controls, Right Live Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (6 Cols): Wizard Controls */}
        <div className={`lg:col-span-6 flex flex-col min-h-[500px] lg:min-h-[570px] ${mobileStudioTab === "preview" ? "hidden lg:flex" : "flex"}`}>
          {/* STEP 1: SELECT BASE GRAPHIC */}
          {currentStep === 1 && (
            <Step1VisualSelector
              setCurrentStep={setCurrentStep}
              subscription={subscription}
              postsRemaining={postsRemaining}
              planName={planName}
              openPlanModal={openPlanModal}
              activateFreeMutation={activateFreeMutation}
              step1Mode={step1Mode}
              setStep1Mode={setStep1Mode}
              customBaseImage={customBaseImage}
              setCustomBaseImage={setCustomBaseImage}
              setIsCreditAlreadyPaid={setIsCreditAlreadyPaid}
              handleRemoveCustomImage={handleRemoveCustomImage}
              brandKit={brandKit}
              setIsCaptionModalOpen={setIsCaptionModalOpen}
              isExpired={isExpired}
              activeVideo={activeVideo}
              setActiveVideo={setActiveVideo}
              isDraggingOver={isDraggingOver}
              setIsDraggingOver={setIsDraggingOver}
              handleFileUpload={handleFileUpload}
              customFileInputRef={customFileInputRef}
              setPreviewLightboxUrl={setPreviewLightboxUrl}
              isCategoryDropdownOpen={isCategoryDropdownOpen}
              setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categoryMeta={categoryMeta}
              categoriesList={categoriesList}
              catSearch={catSearch}
              setCatSearch={setCatSearch}
              catPage={catPage}
              setCatPage={setCatPage}
              catTotalPages={catTotalPages}
              isLoadingCategories={isLoadingCategories}
              isFestivalDropdownOpen={isFestivalDropdownOpen}
              setIsFestivalDropdownOpen={setIsFestivalDropdownOpen}
              selectedFestival={selectedFestival}
              setSelectedFestival={setSelectedFestival}
              selectedFestivalObj={selectedFestivalObj}
              festivalMeta={festivalMeta}
              festivals={festivals}
              festSearch={festSearch}
              setFestSearch={setFestSearch}
              festPage={festPage}
              setFestPage={setFestPage}
              festTotalPages={festTotalPages}
              isLoadingFestivals={isLoadingFestivals}
              templateSearch={templateSearch}
              setTemplateSearch={setTemplateSearch}
              templatePage={templatePage}
              setTemplatePage={setTemplatePage}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
              currentTemplate={currentTemplate}
              templates={templates}
              templatesMeta={templatesMeta}
              isLoadingTemplates={isLoadingTemplates}
              setTemplateLimit={setTemplateLimit}
            />
          )}

          {/* STEP 2: CHOOSE BRAND FRAME */}
          {currentStep === 2 && (
            <Step2FrameSelector
              setCurrentStep={setCurrentStep}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              frames={frames}
              framesMeta={framesMeta}
              isLoadingFrames={isLoadingFrames}
              frameSearch={frameSearch}
              setFrameSearch={setFrameSearch}
              framePage={framePage}
              setFramePage={setFramePage}
              frameLimit={frameLimit}
              setFrameLimit={setFrameLimit}
              setZoomedFrame={setZoomedFrame}
            />
          )}

          {/* STEP 3: BRANDKIT OVERRIDES */}
          {currentStep === 3 && (
            <Step3BrandDetails
              selectedFrame={selectedFrame}
              setCurrentStep={setCurrentStep}
              customDetails={customDetails}
              setCustomDetails={setCustomDetails}
              brandKit={brandKit}
            />
          )}

          {/* STEP 4: EXPORT & PUBLISH */}
          {currentStep === 4 && (
            <Step4ExportPublisher
              setCurrentStep={setCurrentStep}
              selectedFrame={selectedFrame}
              exportTab={exportTab}
              setExportTab={setExportTab}
              isDownloading={isDownloading}
              setIsDownloading={setIsDownloading}
              isExpired={isExpired}
              planName={planName}
              postsRemaining={postsRemaining}
              isCreditAlreadyPaid={isCreditAlreadyPaid}
              openPlanModal={openPlanModal}
              isRendering={isRendering}
              activeVideo={activeVideo}
              onOpenPublisherModal={onOpenPublisherModal}
              currentTemplate={currentTemplate}
              customBaseImage={customBaseImage}
              savePostMutation={savePostMutation}
              isEditingScheduled={isEditingScheduled}
              handleSaveToDb={handleSaveToDb}
              handleDownloadHD={handleDownloadHD}
            />
          )}
        </div>

        {/* RIGHT COLUMN (6 Cols): Persistent Live Real-Time Preview Stage */}
        <StudioLivePreview
          mobileStudioTab={mobileStudioTab}
          activeVideo={activeVideo}
          livePreviewVideoRef={livePreviewVideoRef}
          isSimulatorPlaying={isSimulatorPlaying}
          isSimulatorMuted={isSimulatorMuted}
          setIsSimulatorMuted={setIsSimulatorMuted}
          handleToggleSimulatorPlayback={handleToggleSimulatorPlayback}
          brandKit={brandKit}
          customDetails={customDetails}
          canvasRef={canvasRef}
          isRendering={isRendering}
        />
      </div>

      {/* ZOOMED FRAME LIGHTBOX MODAL */}
      <ZoomedFrameModal
        zoomedFrame={zoomedFrame}
        setZoomedFrame={setZoomedFrame}
        setSelectedFrame={setSelectedFrame}
        isDark={isDark}
      />

      {/* Lightbox for previewing uploaded custom graphic */}
      <ImageLightbox
        isOpen={Boolean(previewLightboxUrl)}
        imageUrl={previewLightboxUrl}
        item={{ title: "Your Custom Uploaded Graphic", occasionName: "Master Background Image" }}
        onClose={() => setPreviewLightboxUrl(null)}
      />

      {/* Mobile Floating Action Toggle Pill */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setMobileStudioTab((prev) => (prev === "editor" ? "preview" : "editor"))}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/30 border border-amber-300/50 active:scale-95 transition cursor-pointer"
        >
          {mobileStudioTab === "editor" ? (
            <>
              <Eye className="w-4 h-4" />
              <span>View Canvas</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Back to Editor</span>
            </>
          )}
        </button>
      </div>

      {/* AI Caption Generator Modal */}
      <AiCaptionGeneratorModal
        isOpen={isCaptionModalOpen}
        onClose={() => setIsCaptionModalOpen(false)}
        initialTopic={currentTemplate?.name || brandKit?.businessName || "Special Social Media Campaign"}
        openPlanModal={openPlanModal}
        onSelectCaption={() => {
          setIsCaptionModalOpen(false);
        }}
      />
    </div>
  );
};

export default PostStudioEditorView;
