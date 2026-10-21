import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Download,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  Upload,
  CheckCircle2,
  Zap,
  Share2,
  FolderKanban,
  FolderTree,
  Calendar,
  Search,
  ZoomIn,
  Maximize2,
  X,
  Trash2,
  Lock,
  Eye,
  Plus,
  ArrowLeft,
  ArrowRight,
  Copy,
  Loader2,
  CalendarClock,
  Send,
  Gift,
  AlertCircle,
  ArrowUpRight,
  ImageOff,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from '@/components/ui/Pagination';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { CanvasPreview } from './CanvasPreview';
import { NanoBananaAiGenerator } from './NanoBananaAiGenerator';
import { AiCaptionGeneratorModal } from './AiCaptionGeneratorModal';
import { CarouselSlideStrip } from './CarouselSlideStrip';
import { CarouselSlideEditor } from './CarouselSlideEditor';
import { useTheme } from '@/shared/hooks';

/**
 * PostStudioEditorView
 * Pure Presentational Component rendering the wizard steps (Templates, Canva Frames, Business Details, Export) and persistent Live Canvas stage.
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
  templates,
  templatesMeta,
  isLoadingTemplates,
  templateSearch,
  setTemplateSearch,
  templatePage = 1,
  setTemplatePage,
  templateLimit = 8,
  setTemplateLimit,
  frames,
  framesMeta,
  isLoadingFrames,
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
  postFormat = "SINGLE",
  setPostFormat,
  carouselSlides = [],
  activeSlideIndex = 0,
  setActiveSlideIndex,
  onAddSlide,
  onDeleteSlide,
  onMoveSlide,
  onUpdateActiveSlide,
  onOpenAiCarouselModal,
}) => {
  const { isDark } = useTheme();
  const customFileInputRef = useRef(null);


  // Step 4 Export Sub-Tab State ('schedule' | 'download')
  const [exportTab, setExportTab] = useState("schedule");
  const [isDownloading, setIsDownloading] = useState(false);

  // Step 1 Category & Festival Collapsible Dropdown States (default: false / closed)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isFestivalDropdownOpen, setIsFestivalDropdownOpen] = useState(false);

  // Step 1 Category/Festival Segmented Tab & Server Pagination
  const [activeFilterTab, setActiveFilterTab] = useState("CATEGORIES"); // 'CATEGORIES' | 'FESTIVALS'

  const catTotalPages = categoryMeta?.totalPages || 1;
  const paginatedCategories = categoriesList;

  const festTotalPages = festivalMeta?.totalPages || 1;
  const paginatedFestivals = festivals;
  const selectedFestivalObj = festivals.find((f) => f.id === selectedFestival);
  // Zoomed Frame Lightbox Modal State
  const [zoomedFrame, setZoomedFrame] = useState(null);

  // Custom Upload Lightbox Preview & Drag-and-drop State
  const [previewLightboxUrl, setPreviewLightboxUrl] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Mobile Studio View Switcher State ('editor' | 'preview')
  const [mobileStudioTab, setMobileStudioTab] = useState('editor');

  // Step 1 Creative Workflow Mode ('AI' | 'TEMPLATES' | 'UPLOAD' | 'CAROUSEL')
  const [step1Mode, setStep1Mode] = useState(postFormat === 'CAROUSEL' ? 'CAROUSEL' : 'AI');

  useEffect(() => {
    if (postFormat === 'CAROUSEL' && step1Mode !== 'CAROUSEL') {
      setStep1Mode('CAROUSEL');
    }
  }, [postFormat]);

  // AI Caption Modal State
  const [isCaptionModalOpen, setIsCaptionModalOpen] = useState(false);

  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomBaseImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomImage = () => {
    setCustomBaseImage(null);
    if (customFileInputRef.current) {
      customFileInputRef.current.value = "";
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
                className={`px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer min-h-[38px] ${isActive
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
          className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer relative min-h-[40px] ${
            mobileStudioTab === "preview"
              ? "bg-amber-500 text-slate-950 font-extrabold shadow-glow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Live Preview</span>
        </button>
      </div>

      {/* Main Studio Viewport (Left Controls, Right Live Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (6 Cols): Wizard Controls */}
        <div className={`lg:col-span-6 flex flex-col min-h-[500px] lg:min-h-[570px] ${mobileStudioTab === "preview" ? "hidden lg:flex" : "flex"}`}>
          {/* STEP 1: SELECT BASE GRAPHIC */}
          {currentStep === 1 && (
            <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:min-h-[570px] gap-3.5">
              {/* TOP CONTROLS SECTION */}
              <div className="space-y-2.5 shrink-0">
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5">
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Step 1: Graphic</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Select graphic template or custom upload.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Button variant="primary" size="sm" onClick={() => setCurrentStep(2)} className="shadow-lg font-bold min-h-[36px]">
                      <span>Next: Brand Frame</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Smart Plan Quota Alert Banner for Step 1 */}
                {(!subscription?.hasPlan || postsRemaining <= 0) ? (
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all ${
                    !subscription?.hasPlan
                      ? "bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/5 border-amber-500/40 text-amber-200"
                      : "bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-rose-500/5 border-rose-500/40 text-rose-200"
                  }`}>
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        !subscription?.hasPlan ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-300"
                      }`}>
                        {!subscription?.hasPlan ? <Gift className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {!subscription?.hasPlan
                            ? "No Active Plan - Claim Your 5 Free Posts!"
                            : "Post Quota Exhausted (0 Posts Left)"}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                          {!subscription?.hasPlan
                            ? "Activate your free starter tier to create AI visuals, custom graphics, and publish campaigns."
                            : "You have 0 posts remaining on your current plan. Upgrade to unlock more AI post creation."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                      {!subscription?.hasPlan && activateFreeMutation && (
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          onClick={() => activateFreeMutation.mutate()}
                          disabled={activateFreeMutation.isPending}
                          className="text-xs font-extrabold shadow-glow shrink-0 whitespace-nowrap min-h-[32px]"
                        >
                          {activateFreeMutation.isPending ? "Activating..." : "🚀 Claim 5 Free Posts"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={openPlanModal}
                        className="text-xs border-[#2C384E] text-slate-200 hover:text-white shrink-0 whitespace-nowrap min-h-[32px]"
                      >
                        <span>{!subscription?.hasPlan ? "View Plans" : "Upgrade Plan"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0B0F17]/80 border border-[#2C384E]/70 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-slate-400">Active Plan:</span>
                      <span className="font-bold text-amber-400 uppercase">{planName}</span>
                      <span className="text-slate-400">({postsRemaining} posts left)</span>
                    </div>
                    <button
                      type="button"
                      onClick={openPlanModal}
                      className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Upgrade / Top-up</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Step 1 Workflow Mode Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs font-bold overflow-x-auto pb-1 custom-scrollbar -mx-0.5 px-0.5">
                  <button
                    type="button"
                    onClick={() => setStep1Mode("AI")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[34px] ${
                      step1Mode === "AI"
                        ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🍌 Nano Banana 2.1 AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep1Mode("TEMPLATES")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[34px] ${
                      step1Mode === "TEMPLATES"
                        ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🎨 Festival & Templates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep1Mode("CAROUSEL");
                      if (setPostFormat) setPostFormat("CAROUSEL");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[34px] ${
                      step1Mode === "CAROUSEL"
                        ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🎠 Carousel Deck</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep1Mode("UPLOAD");
                      if (setPostFormat) setPostFormat("SINGLE");
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[34px] ${
                      step1Mode === "UPLOAD"
                        ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>📤 Custom Upload</span>
                  </button>
                </div>

                {/* 🎠 CAROUSEL STUDIO MODE */}
                {step1Mode === "CAROUSEL" && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Hero AI Deck Generator Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-[#131B2A] border border-amber-500/30 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                            Multi-Slide Carousel Deck
                          </span>
                          <h4 className="text-sm font-heading font-extrabold text-white">
                            Create a Viral Social Media Carousel
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Generate complete multi-slide swipeable guides (Hook, step-by-step content points, CTA slide) tailored for {brandKit?.businessName || 'your business'}.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          icon={Sparkles}
                          onClick={onOpenAiCarouselModal}
                          className="shrink-0 py-2 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer"
                        >
                          Generate with AI ✨
                        </Button>
                      </div>
                    </div>

                    {/* Active Slide Editor */}
                    <CarouselSlideEditor
                      activeSlide={carouselSlides[activeSlideIndex]}
                      activeSlideIndex={activeSlideIndex}
                      totalSlides={carouselSlides.length}
                      onChangeSlide={onUpdateActiveSlide}
                      onOpenAiGenerator={onOpenAiCarouselModal}
                    />
                  </div>
                )}

                {/* 1. NANO BANANA AI CREATOR MODE */}
                {step1Mode === "AI" && (
                  <NanoBananaAiGenerator
                    onSelectImage={(url) => setCustomBaseImage(url)}
                    activeImage={customBaseImage}
                    onClearImage={handleRemoveCustomImage}
                    brandKit={brandKit}
                    onOpenCaptionGenerator={() => setIsCaptionModalOpen(true)}
                    openPlanModal={openPlanModal}
                    subscription={subscription}
                    postsRemaining={postsRemaining}
                    isExpired={isExpired}
                    planName={planName}
                    activateFreeMutation={activateFreeMutation}
                  />
                )}

                {/* 2. CUSTOM UPLOAD MODE */}
                {step1Mode === "UPLOAD" && (
                  !customBaseImage ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                        const file = e.dataTransfer.files?.[0];
                        handleFileUpload(file);
                      }}
                      onClick={() => customFileInputRef.current?.click()}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${isDraggingOver
                          ? "border-amber-400 bg-amber-500/15 scale-[1.01]"
                          : "border-[#2C384E] hover:border-amber-500/50 bg-[#0B0F17]/80 hover:bg-[#0B0F17]"
                        }`}
                    >
                      <input
                        ref={customFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleFileUpload(file);
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Upload className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">Upload Custom Image</span>
                              <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20 shrink-0">
                                1080×1080
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              Drag & drop image or click to browse file
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="text-xs font-bold shrink-0 border-[#2C384E] text-slate-300 pointer-events-none"
                        >
                          Browse
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/10 via-[#131B2A] to-[#0B0F17] shadow-xl">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            onClick={() => setPreviewLightboxUrl(customBaseImage)}
                            className="relative group w-12 h-12 rounded-xl overflow-hidden border border-amber-500/50 bg-[#0B0F17] shrink-0 cursor-pointer shadow-md"
                            title="Click to preview fullscreen"
                          >
                            <img
                              src={customBaseImage}
                              alt="Custom Uploaded"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4 drop-shadow" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                              <h4 className="text-xs font-extrabold text-white truncate">Custom Upload Active</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              Applied as master background
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={Eye}
                            onClick={() => setPreviewLightboxUrl(customBaseImage)}
                            className="text-xs font-bold border-amber-500/30 text-amber-300 hover:text-white px-2.5 py-1 min-h-[32px]"
                          >
                            Preview
                          </Button>
                          <input
                            ref={customFileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleFileUpload(file);
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={Upload}
                            onClick={() => customFileInputRef.current?.click()}
                            className="text-xs font-bold border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 min-h-[32px]"
                          >
                            Replace
                          </Button>
                          <button
                            type="button"
                            onClick={handleRemoveCustomImage}
                            className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer min-h-[32px]"
                            title="Remove custom upload"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* 3. TEMPLATES MODE (Categories & Festivals) */}
                {step1Mode === "TEMPLATES" && (
                  <div className="space-y-2.5">
                {/* 1. Template Category Navigation Dropdown */}
                <div className="rounded-2xl bg-[#0B0F17] border border-[#2C384E] overflow-hidden transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                    className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#131B2A]/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <span className="font-heading font-extrabold text-xs text-white">
                        Template Category
                      </span>
                      {selectedCategory ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                          <span>{selectedCategory}</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory("");
                              setTemplatePage(1);
                            }}
                            className="hover:text-white cursor-pointer ml-0.5 text-xs font-black"
                            title="Clear category filter"
                          >
                            ×
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-full">
                          All Categories
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        ({categoryMeta?.totalItems ?? categoriesList.length} Categories)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        {isCategoryDropdownOpen ? "Hide Categories" : "Select Category"}
                      </span>
                      <div className={`p-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180 text-amber-400 border-amber-500/40" : ""}`}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="p-3.5 pt-1 border-t border-[#2C384E]/70 space-y-3 bg-[#131B2A]/40 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                        <div className="text-[11px] text-slate-400 font-medium">
                          Filter template graphics by industry niche:
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Template Category Search */}
                          <div className="relative">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              placeholder="Search categories..."
                              value={catSearch}
                              onChange={(e) => {
                                if (setCatSearch) setCatSearch(e.target.value);
                                if (setCatPage) setCatPage(1);
                              }}
                              className="pl-7 pr-2 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-40 sm:w-48"
                            />
                          </div>

                          {/* Template Category Pagination Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={catPage <= 1}
                              onClick={() => setCatPage && setCatPage((p) => Math.max(1, p - 1))}
                              className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition text-xs flex items-center gap-1 cursor-pointer"
                              title="Previous Template Categories"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Prev</span>
                            </button>
                            <span className="text-[10px] text-slate-400 px-1 font-mono">
                              {catPage}/{catTotalPages}
                            </span>
                            <button
                              type="button"
                              disabled={catPage >= catTotalPages}
                              onClick={() => setCatPage && setCatPage((p) => Math.min(catTotalPages, p + 1))}
                              className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition text-xs flex items-center gap-1 cursor-pointer"
                              title="Next Template Categories"
                            >
                              <span className="hidden sm:inline text-[11px]">Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Template Category Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 custom-scrollbar">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory("");
                            setTemplatePage(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${!selectedCategory
                              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                              : "bg-[#0B0F17] text-slate-300 border border-[#2C384E] hover:border-slate-500 hover:text-white"
                            }`}
                        >
                          <span>All Categories</span>
                        </button>

                        {isLoadingCategories && (
                          <span className="text-xs text-slate-400 animate-pulse px-2">
                            Loading categories...
                          </span>
                        )}

                        {!isLoadingCategories && categoriesList.length === 0 && catSearch && (
                          <span className="text-xs text-slate-400 italic px-2">
                            No categories matching "{catSearch}"
                          </span>
                        )}

                        {categoriesList.map((cat) => {
                          const isSelected = selectedCategory === cat.name || selectedCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.name);
                                setTemplatePage(1);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${isSelected
                                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                                  : "bg-[#0B0F17] text-slate-300 border border-[#2C384E] hover:border-slate-500 hover:text-white"
                                }`}
                            >
                              <span>{cat.icon || "🎨"}</span>
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Festival Navigation Dropdown */}
                <div className="rounded-2xl bg-[#0B0F17] border border-[#2C384E] overflow-hidden transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => setIsFestivalDropdownOpen((prev) => !prev)}
                    className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#131B2A]/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="font-heading font-extrabold text-xs text-white">
                        Festivals Navigation
                      </span>
                      {selectedFestival ? (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                          <span>{selectedFestivalObj ? selectedFestivalObj.name : "Active Festival"}</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFestival("");
                              setTemplatePage(1);
                            }}
                            className="hover:text-white cursor-pointer ml-0.5 text-xs font-black"
                            title="Clear festival filter"
                          >
                            ×
                          </span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-full">
                          All Festivals
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        ({festivalMeta?.totalItems ?? festivals.length} Festivals)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        {isFestivalDropdownOpen ? "Hide Festivals" : "Browse Festivals"}
                      </span>
                      <div className={`p-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 transition-transform duration-200 ${isFestivalDropdownOpen ? "rotate-180 text-emerald-400 border-emerald-500/40" : ""}`}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>

                  {isFestivalDropdownOpen && (
                    <div className="p-3.5 pt-1 border-t border-[#2C384E]/70 space-y-3 bg-[#131B2A]/40 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                        <div className="text-[11px] text-slate-400 font-medium">
                          Filter templates by 365-day Indian & global festival occasions:
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Festival Search */}
                          <div className="relative">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              placeholder="Search festivals..."
                              value={festSearch}
                              onChange={(e) => {
                                if (setFestSearch) setFestSearch(e.target.value);
                                if (setFestPage) setFestPage(1);
                              }}
                              className="pl-7 pr-2 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-40 sm:w-48"
                            />
                          </div>

                          {/* Festival Pagination Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={festPage <= 1}
                              onClick={() => setFestPage && setFestPage((p) => Math.max(1, p - 1))}
                              className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition text-xs flex items-center gap-1 cursor-pointer"
                              title="Previous Festivals"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Prev</span>
                            </button>
                            <span className="text-[10px] text-slate-400 px-1 font-mono">
                              {festPage}/{festTotalPages}
                            </span>
                            <button
                              type="button"
                              disabled={festPage >= festTotalPages}
                              onClick={() => setFestPage && setFestPage((p) => Math.min(festTotalPages, p + 1))}
                              className="px-2 py-1 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition text-xs flex items-center gap-1 cursor-pointer"
                              title="Next Festivals"
                            >
                              <span className="hidden sm:inline text-[11px]">Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Festival Pills */}
                      <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 custom-scrollbar">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFestival("");
                            setTemplatePage(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${!selectedFestival
                              ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                              : "bg-[#0B0F17] text-slate-300 border border-[#2C384E] hover:border-slate-500 hover:text-white"
                            }`}
                        >
                          <span>All Festivals</span>
                        </button>

                        {isLoadingFestivals && (
                          <span className="text-xs text-slate-400 animate-pulse px-2">
                            Loading festivals...
                          </span>
                        )}

                        {!isLoadingFestivals && festivals.length === 0 && festSearch && (
                          <span className="text-xs text-slate-400 italic px-2">
                            No festivals matching "{festSearch}"
                          </span>
                        )}

                        {festivals.map((f) => {
                          const isSelected = selectedFestival === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => {
                                setSelectedFestival(f.id);
                                setTemplatePage(1);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${isSelected
                                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                                  : "bg-[#0B0F17] text-slate-300 border border-[#2C384E] hover:border-slate-500 hover:text-white"
                                }`}
                            >
                              <span>{f.targetRegion ? `📍 ${f.targetRegion}` : "🪔"}</span>
                              <span>{f.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Graphic Template Search Bar & Active Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search templates by title..."
                      value={templateSearch}
                      onChange={(e) => {
                        setTemplateSearch(e.target.value);
                        setTemplatePage(1);
                      }}
                      className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                    />
                    {templateSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setTemplateSearch("");
                          setTemplatePage(1);
                        }}
                        className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {(selectedCategory || selectedFestival) && (
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium">Active Filters:</span>
                      {selectedCategory && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                          <span>Category: {selectedCategory}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory("");
                              setTemplatePage(1);
                            }}
                            className="hover:text-white font-bold"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedFestival && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                          <span>Festival: {festivals.find((f) => f.id === selectedFestival)?.name || selectedFestival}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFestival("");
                              setTemplatePage(1);
                            }}
                            className="hover:text-white font-bold"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Graphic Background Templates Grid (Flex Fill Viewport Height - 100% Locked Card Height) */}
          {step1Mode === "TEMPLATES" && (
            <>
              {/* No Template Quick Toggle Option (Mirrors No Frame design) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] shrink-0 my-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1 rounded-full shrink-0 ${!selectedTemplateId && !customBaseImage ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {!selectedTemplateId && !customBaseImage ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ImageOff className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {!selectedTemplateId && !customBaseImage
                        ? "No Template Selected (Clean AI Canvas)"
                        : customBaseImage
                        ? "Custom Upload Active"
                        : `Selected: ${currentTemplate?.title || "Template Selected"}`}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {!selectedTemplateId && !customBaseImage
                        ? "Clean solid background for AI posts, carousels, or direct frame branding."
                        : "Graphic template active as canvas background."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTemplateId && !customBaseImage) {
                      if (templates.length > 0) setSelectedTemplateId(templates[0].id);
                    } else {
                      setSelectedTemplateId(null);
                      setCustomBaseImage(null);
                    }
                  }}
                  className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer min-h-[34px] ${
                    !selectedTemplateId && !customBaseImage
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {!selectedTemplateId && !customBaseImage ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No Template Active</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span>Remove Template</span>
                    </>
                  )}
                </button>
              </div>

              <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Option: No Template (Clean Canvas) Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(null);
                      setCustomBaseImage(null);
                    }}
                    className={`relative aspect-square rounded-xl border p-2 overflow-hidden transition group flex flex-col items-center justify-center text-center cursor-pointer ${
                      !selectedTemplateId && !customBaseImage
                        ? "border-amber-500 bg-gradient-to-b from-amber-500/20 to-[#131B2A] ring-2 ring-amber-500/50 shadow-glow"
                        : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                    }`}
                    title="Use clean canvas without template background"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
                      <ImageOff className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-200">No Template</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Clean AI Canvas</p>
                    {!selectedTemplateId && !customBaseImage && (
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500 text-slate-950 font-bold shadow-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Pinned Active Custom Upload Card */}
                  {customBaseImage && (
                    <div
                      className="relative aspect-square rounded-xl border-2 border-amber-500 bg-gradient-to-b from-amber-500/20 to-[#131B2A] ring-2 ring-amber-500/50 shadow-glow p-1.5 overflow-hidden group text-left cursor-pointer"
                    >
                      <img
                        src={customBaseImage}
                        alt="Your Custom Upload"
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow">
                        Your Upload
                      </div>
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500 text-slate-950 font-bold shadow-lg z-10">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>

                      <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 rounded-lg z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewLightboxUrl(customBaseImage);
                          }}
                          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg transition cursor-pointer"
                          title="Preview Fullscreen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomImage();
                          }}
                          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg transition cursor-pointer"
                          title="Remove Custom Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <p className="text-[11px] font-bold preserve-white-text truncate" style={{ color: '#FFFFFF' }}>Custom Uploaded Image</p>
                      </div>
                    </div>
                  )}

                  {isLoadingTemplates ? (
                    <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-semibold">Loading templates...</div>
                  ) : templates.length === 0 ? (
                    <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl font-medium">
                      No templates found for selected category/filter.
                    </div>
                  ) : (
                    templates.map((tpl) => {
                      const isSelected = selectedTemplateId === tpl.id && !customBaseImage;
                      const imgUrl = tpl.imageUrl || tpl.baseImageUrl || tpl.fileUrl || tpl.bannerUrl;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(tpl.id);
                            setCustomBaseImage(null);
                          }}
                          className={`relative aspect-square rounded-xl border p-1.5 overflow-hidden transition group text-left cursor-pointer ${isSelected
                              ? "border-amber-500 bg-gradient-to-b from-amber-500/20 to-[#131B2A] ring-2 ring-amber-500/50 shadow-glow"
                              : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                            }`}
                        >
                          <img
                            src={imgUrl}
                            alt={tpl.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-200"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                            <p className="text-[11px] font-bold preserve-white-text truncate" style={{ color: '#FFFFFF' }}>{tpl.title}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500 text-slate-950 font-bold shadow-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

            {/* Pagination */}
            {step1Mode === "TEMPLATES" && templatesMeta && (
              <div className="mt-auto pt-2 border-t border-[#2C384E] shrink-0">
                <Pagination
                  meta={templatesMeta}
                  currentPage={templatePage}
                  totalPages={templatesMeta?.totalPages || 1}
                  onPageChange={(p) => setTemplatePage(p)}
                  onLimitChange={(l) => {
                    setTemplateLimit(l);
                    setTemplatePage(1);
                  }}
                  pageSizeOptions={[6, 8, 12, 24]}
                  className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-3 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-slate-300 shadow-sm mt-1"
                />
              </div>
            )}
          </Card>
        )}

          {/* STEP 2: CHOOSE BRAND FRAME */}
          {currentStep === 2 && (
            <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:min-h-[570px] gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                    <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Step 2: Frame</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Choose brand overlay or template only.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="min-h-[36px]">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(selectedFrame ? 3 : 4)}
                    className="shadow-lg font-bold min-h-[36px]"
                  >
                    <span>{selectedFrame ? "Next: Details" : "Next: Export"}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* No Frame Quick Toggle Option (Saves grid space) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-1 rounded-full shrink-0 ${selectedFrame === null ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {selectedFrame === null ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {selectedFrame === null ? "No Frame Selected (Template Only)" : `Selected: ${selectedFrame.title}`}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {selectedFrame === null ? "Base graphic image will be exported without frame overlays." : "Brand overlay will be composited on graphic."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFrame(selectedFrame === null ? (frames[0] || null) : null)}
                  className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer min-h-[34px] ${selectedFrame === null
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                >
                  {selectedFrame === null ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No Frame Active</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 text-rose-400" />
                      <span>Remove Frame</span>
                    </>
                  )}
                </button>
              </div>

              {/* Brand Frame Search Bar */}
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search brand frames by title..."
                  value={frameSearch}
                  onChange={(e) => {
                    setFrameSearch && setFrameSearch(e.target.value);
                    setFramePage && setFramePage(1);
                  }}
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
                {frameSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setFrameSearch && setFrameSearch("");
                      setFramePage && setFramePage(1);
                    }}
                    className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Scrollable Frame Grid Viewport (Flex Fill Viewport Height - 100% Locked Card Height) */}
              <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {isLoadingFrames ? (
                    <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading brand frames...</div>
                  ) : frames.length === 0 ? (
                    <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                      {frameSearch ? `No custom brand frames matching "${frameSearch}".` : "No custom brand frames created yet."}
                    </div>
                  ) : (
                    frames.map((frame) => (
                      <div key={frame.id} className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFrame(frame);
                            setZoomedFrame(frame);
                          }}
                          className={`relative aspect-square rounded-xl border p-1.5 overflow-hidden transition group flex flex-col items-center justify-center ${selectedFrame?.id === frame.id
                            ? "border-amber-500 bg-gradient-to-b from-amber-500/20 to-[#131B2A] ring-2 ring-amber-500/50 shadow-glow"
                            : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                            }`}
                          title="Click to select and preview frame"
                        >
                          {/* Frame Image ONLY - 100% clean without any badges or text overlays */}
                          <div className="w-full h-full bg-[#0B0F17] overflow-hidden rounded-lg flex items-center justify-center">
                            {(frame.previewUrl || frame.overlayPngUrl) ? (
                              <img
                                src={frame.previewUrl || frame.overlayPngUrl}
                                alt={frame.title}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                                className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shadow-md">
                                  {frame.title?.substring(0, 2).toUpperCase() || "FR"}
                                </div>
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Complete Frame Details BELOW the frame image box */}
                        <div className="text-center px-1">
                          <p className="text-xs font-bold text-slate-200 truncate" title={frame.title}>
                            {frame.title}
                          </p>
                          {frame.description && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5" title={frame.description}>
                              {frame.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {framesMeta && (
                <div className="mt-auto pt-2 border-t border-[#2C384E] shrink-0">
                  <Pagination
                    meta={framesMeta}
                    currentPage={framePage}
                    totalPages={framesMeta?.totalPages || 1}
                    onPageChange={(p) => setFramePage(p)}
                    onLimitChange={(l) => {
                      setFrameLimit(l);
                      setFramePage(1);
                    }}
                    pageSizeOptions={[6, 8, 12, 24]}
                    className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-3 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-slate-300 shadow-sm mt-1"
                  />
                </div>
              )}
            </Card>
          )}

          {/* STEP 3: BRANDKIT OVERRIDES (100% DYNAMIC BASED ON FRAME CONFIGJSON) */}
          {currentStep === 3 && (() => {
            // Dynamically extract text input fields and image slot toggles configured in selectedFrame
            const getDynamicFrameFields = (frame) => {
              let rawConfig = frame?.configJson || frame?.blueprint || frame?.layoutConfig || frame?.jsonConfig || frame?.config;
              if (typeof rawConfig === "string") {
                try {
                  rawConfig = JSON.parse(rawConfig);
                } catch (e) { }
              }
              let elements = Array.isArray(rawConfig)
                ? rawConfig
                : (rawConfig?.elements && Array.isArray(rawConfig.elements) ? rawConfig.elements : []);

              if (!elements || elements.length === 0) {
                elements = [
                  { id: "el-logo-box", type: "RECTANGLE", slotCategory: "IMAGE_SLOT", dynamicSlot: "LOGO_BOX", name: "Brand Logo" },
                  { id: "el-avatar-circle", type: "CIRCLE", slotCategory: "IMAGE_SLOT", dynamicSlot: "AVATAR_CIRCLE", customLabel: "Profile Photo", name: "Profile Photo" },
                  { id: "el-business-name", type: "TEXT", slotCategory: "TEXT_INPUT", dynamicSlot: "BUSINESS_NAME", name: "Business Name", text: "SUNRISE REAL ESTATE" },
                  { id: "el-phone-badge", type: "TEXT", slotCategory: "TEXT_INPUT", dynamicSlot: "PHONE", name: "Phone Number", text: "+91 98765 43210" },
                  { id: "el-address-text", type: "TEXT", slotCategory: "TEXT_INPUT", dynamicSlot: "ADDRESS", name: "Address / Location", text: "Business Park, MG Road, Mumbai" },
                ];
              }

              const textFields = [];
              const imageToggles = [];
              const customImageSlots = [];
              const seenKeys = new Set();

              elements.forEach((el) => {
                const slot = el.dynamicSlot;
                const isImageCategory = el.slotCategory === "IMAGE_SLOT" || el.slotCategory === "DYNAMIC_IMAGE" || el.type === "IMAGE_SLOT";

                if (
                  isImageCategory ||
                  slot === "LOGO_BOX" ||
                  slot === "AVATAR_CIRCLE" ||
                  slot === "UPI_QR" ||
                  slot === "CUSTOM_IMAGE" ||
                  slot === "MANUAL_INPUT"
                ) {
                  const isPrimaryAvatar = slot === "AVATAR_CIRCLE" || el.fieldKey === "avatarUrl";
                  const isPrimaryLogo = slot === "LOGO_BOX" || el.fieldKey === "logoUrl";
                  const isPrimaryUpi = slot === "UPI_QR" || el.fieldKey === "upiQrUrl";

                  if (isPrimaryAvatar) {
                    const fieldKey = "showAvatar";
                    if (!seenKeys.has(fieldKey)) {
                      seenKeys.add(fieldKey);
                      imageToggles.push({
                        id: el.id,
                        key: "showAvatar",
                        label: el.customLabel || el.name || "Render Profile Photo",
                        type: "AVATAR",
                        fieldKey,
                        rawElement: el,
                        previewUrl: customDetails.avatarUrl || brandKit?.avatarUrl,
                      });
                    }
                  } else if (isPrimaryLogo) {
                    const fieldKey = "showLogo";
                    if (!seenKeys.has(fieldKey)) {
                      seenKeys.add(fieldKey);
                      imageToggles.push({
                        id: el.id,
                        key: "showLogo",
                        label: el.customLabel || el.name || "Render Brand Logo",
                        type: "LOGO",
                        fieldKey,
                        rawElement: el,
                        previewUrl: customDetails.logoUrl || brandKit?.logoUrl,
                      });
                    }
                  } else if (isPrimaryUpi) {
                    const fieldKey = "showUpiQr";
                    if (!seenKeys.has(fieldKey)) {
                      seenKeys.add(fieldKey);
                      imageToggles.push({
                        id: el.id,
                        key: "showUpiQr",
                        label: el.customLabel || el.name || "Render UPI Payment QR",
                        type: "UPI_QR",
                        fieldKey,
                        rawElement: el,
                        previewUrl: customDetails.upiQrUrl || brandKit?.upiQrUrl,
                      });
                    }
                  } else {
                    const fieldKey = el.fieldKey || el.id || `custom_img_${el.type || 'slot'}`;
                    const label = el.customLabel || el.name || `Upload Image for ${el.type || 'Shape'} Slot`;
                    if (!seenKeys.has(fieldKey)) {
                      seenKeys.add(fieldKey);
                      customImageSlots.push({ id: el.id, key: fieldKey, label, type: "CUSTOM", fieldKey, rawElement: el });
                    }
                  }
                } else if (
                  el.type === "TEXT" ||
                  el.type === "DYNAMIC_TEXT" ||
                  el.slotCategory === "TEXT_INPUT" ||
                  (slot && slot !== "NONE" && slot !== "STATIC")
                ) {
                  let fieldKey = "businessName";
                  let label = "Business Name";

                  if (slot === "BUSINESS_NAME") {
                    fieldKey = "businessName";
                    label = "Business Name";
                  } else if (slot === "PHONE") {
                    fieldKey = "phone";
                    label = "Phone / WhatsApp Number";
                  } else if (slot === "WHATSAPP") {
                    fieldKey = "whatsapp";
                    label = "WhatsApp Number";
                  } else if (slot === "ADDRESS") {
                    fieldKey = "address";
                    label = "Address / Location";
                  } else if (
                    slot === "TAGLINE" ||
                    slot === "SLOGAN" ||
                    el.text?.toLowerCase().includes("slogan") ||
                    el.name?.toLowerCase().includes("slogan")
                  ) {
                    fieldKey = "tagline";
                    label = "Tagline / Slogan";
                  } else if (slot === "EMAIL") {
                    fieldKey = "email";
                    label = "Email Address";
                  } else if (slot === "WEBSITE") {
                    fieldKey = "websiteUrl";
                    label = "Website URL";
                  } else if (slot === "INSTAGRAM") {
                    fieldKey = "instagramHandle";
                    label = "Instagram Handle";
                  } else if (slot === "FACEBOOK") {
                    fieldKey = "facebookHandle";
                    label = "Facebook Handle";
                  } else if (slot === "CITY") {
                    fieldKey = "city";
                    label = "City";
                  } else if (slot === "STATE") {
                    fieldKey = "state";
                    label = "State";
                  } else if (slot === "COUNTRY") {
                    fieldKey = "country";
                    label = "Country";
                  } else if (slot === "UPI_VPA") {
                    fieldKey = "upiVpa";
                    label = "UPI Payment ID / VPA";
                  } else {
                    fieldKey = el.fieldKey || el.id || (el.name ? el.name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "custom_text_field");
                    label = el.customLabel || el.name || el.text || "Custom Text Field";
                  }

                  if (!seenKeys.has(fieldKey)) {
                    seenKeys.add(fieldKey);
                    textFields.push({ id: el.id, fieldKey, label, placeholder: el.text || el.defaultText || "", rawElement: el });
                  }
                }
              });

              return { textFields, imageToggles, customImageSlots };
            };

            if (!selectedFrame) {
              return (
                <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:h-[570px] lg:min-h-[570px] lg:max-h-[570px] overflow-hidden shrink-0 gap-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">Step 3: Details</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Template only (No frame selected).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="min-h-[34px]">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="shadow-lg font-bold min-h-[34px]">
                        <span>Next: Export</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-3 my-auto">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
                      ✨
                    </div>
                    <h4 className="font-heading font-extrabold text-white text-base">No Frame Selected</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      You are creating a post with the base graphic template only. Frame details (such as logo, phone, or location overlays) are not needed when no frame is selected.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="min-h-[36px]">
                        <Layers className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        Choose a Brand Frame
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="min-h-[36px]">
                        <span>Proceed to Publish & Export</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            const { textFields, imageToggles, customImageSlots } = getDynamicFrameFields(selectedFrame);

            return (
              <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:h-[570px] lg:min-h-[570px] lg:max-h-[570px] overflow-hidden shrink-0 gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Step 3: Details</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Edit text fields & image toggles.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...customDetails };
                        textFields.forEach((tf) => {
                          const fk = tf.fieldKey;
                          if (fk === "businessName") updated.businessName = brandKit?.businessName || tf.placeholder || "Sunrise Real Estate";
                          else if (fk === "phone") updated.phone = brandKit?.phone || brandKit?.whatsapp || tf.placeholder || "+91 98765 43210";
                          else if (fk === "whatsapp") updated.whatsapp = brandKit?.whatsapp || tf.placeholder || "+91 98765 43210";
                          else if (fk === "address") updated.address = brandKit?.address || tf.placeholder || "Business Park, MG Road, Mumbai";
                          else if (fk === "tagline") {
                            updated.tagline = brandKit?.tagline || brandKit?.slogan || tf.placeholder || "Premium Luxury Homes & Commercial Spaces";
                            updated.slogan = brandKit?.slogan || brandKit?.tagline || tf.placeholder || "Premium Luxury Homes & Commercial Spaces";
                          }
                          else if (fk === "email") updated.email = brandKit?.email || tf.placeholder || "contact@business.com";
                          else if (fk === "websiteUrl") updated.websiteUrl = tf.placeholder || "https://yourbusiness.com";
                          else if (fk === "instagramHandle") updated.instagramHandle = brandKit?.instagramHandle || tf.placeholder || "@yourbrand";
                          else if (fk === "facebookHandle") updated.facebookHandle = brandKit?.facebookHandle || tf.placeholder || "yourbrand";
                          else if (fk === "city") updated.city = brandKit?.city || tf.placeholder || "Mumbai";
                          else if (fk === "state") updated.state = brandKit?.state || tf.placeholder || "Maharashtra";
                          else if (fk === "country") updated.country = brandKit?.country || tf.placeholder || "India";
                          else if (fk === "upiVpa") updated.upiVpa = brandKit?.upiVpa || tf.placeholder || "";
                          else updated[fk] = brandKit?.[fk] || tf.placeholder || "Sample Text";
                        });
                        if (brandKit?.upiQrUrl) {
                          updated.upiQrUrl = brandKit.upiQrUrl;
                          updated.showUpiQr = true;
                        }
                        if (brandKit?.upiVpa) {
                          updated.upiVpa = brandKit.upiVpa;
                        }
                        setCustomDetails(updated);
                      }}
                      className="px-2 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1 shrink-0 cursor-pointer min-h-[34px]"
                      title="Auto fill fields from your active BrandKit"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>BrandKit</span>
                    </button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="min-h-[34px]">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="shadow-lg font-bold min-h-[34px]">
                      <span>Next: Export</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* DYNAMIC FORM BODY CONTAINER (Flex Fill Scrollable Viewport) */}
                <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1 space-y-4">
                  {/* DYNAMIC TEXT INPUT FIELDS BASED ON FRAME CONFIGJSON */}
                  <div className="space-y-4">
                    {textFields.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-400 text-xs text-center font-medium">
                        This frame has no dynamic text elements configured.
                      </div>
                    ) : (
                      textFields.map((tf) => (
                        <Input
                          key={tf.fieldKey}
                          label={tf.label}
                          placeholder={tf.placeholder}
                          value={customDetails[tf.fieldKey] !== undefined ? customDetails[tf.fieldKey] : tf.placeholder}
                          onChange={(e) =>
                            setCustomDetails((prev) => ({
                              ...prev,
                              [tf.fieldKey]: e.target.value,
                            }))
                          }
                        />
                      ))
                    )}
                  </div>

                  {/* DYNAMIC IMAGE TOGGLES & CUSTOM UPLOADERS BASED ON FRAME CONFIGJSON */}
                  {imageToggles.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Live Canvas Image & Badge Toggles
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {imageToggles.map((it) => (
                          <div
                            key={it.fieldKey}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:border-slate-500 transition"
                          >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={customDetails[it.fieldKey] !== undefined ? customDetails[it.fieldKey] : true}
                                onChange={(e) =>
                                  setCustomDetails((prev) => ({
                                    ...prev,
                                    [it.fieldKey]: e.target.checked,
                                  }))
                                }
                                className="rounded accent-amber-500 shrink-0"
                              />
                              <span className="font-semibold truncate">{it.label}</span>
                            </label>
                            {it.previewUrl ? (
                              <img
                                src={it.previewUrl}
                                alt={it.label}
                                className="w-7 h-7 rounded-md object-contain bg-slate-900 border border-[#2C384E] shrink-0 ml-2"
                                title="Auto-filled from BrandKit"
                              />
                            ) : (
                              <span className="text-[10px] text-amber-400/80 font-medium px-1.5 py-0.5 rounded bg-amber-500/10 shrink-0 ml-2 border border-amber-500/20">
                                {it.type === 'UPI_QR' ? 'No QR in BrandKit' : 'Default'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CUSTOM IMAGE SLOT UPLOADERS (e.g. Star Shape Image Slot or Custom Photo Slot) */}
                  {customImageSlots.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-[#2C384E]">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Custom Image Slots (Upload Graphic for Shapes / Frame Slots)
                      </label>
                      {customImageSlots.map((cis) => (
                        <div key={cis.fieldKey} className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                            <span>{cis.label}</span>
                            {customDetails[cis.fieldKey] && (
                              <button
                                type="button"
                                onClick={() => setCustomDetails((prev) => ({ ...prev, [cis.fieldKey]: null }))}
                                className="text-[10px] text-red-400 hover:underline"
                              >
                                Clear Image
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {customDetails[cis.fieldKey] ? (
                              <img
                                src={customDetails[cis.fieldKey]}
                                alt={cis.label}
                                className="w-12 h-12 rounded-lg object-cover border border-[#2C384E]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#131B2A] border border-dashed border-[#2C384E] flex items-center justify-center text-slate-500 text-xs">
                                🖼️
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    setCustomDetails((prev) => ({
                                      ...prev,
                                      [cis.fieldKey]: evt.target.result,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* STEP 4: EXPORT & PUBLISH */}
          {currentStep === 4 && (
            <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:h-[570px] lg:min-h-[570px] lg:max-h-[570px] overflow-hidden shrink-0 gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Step 4: Export & Publish</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Schedule post to social platforms or download HD PNG.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(selectedFrame ? 3 : 2)} className="min-h-[34px]">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                </div>
              </div>

              {/* Step 4 Sub-Tabs Ribbon */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0F17] rounded-xl border border-[#2C384E] shrink-0">
                <button
                  type="button"
                  onClick={() => setExportTab("schedule")}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                    exportTab === "schedule"
                      ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Schedule Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab("download")}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                    exportTab === "download"
                      ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Download HD</span>
                </button>
              </div>

              {/* Scrollable Step 4 Body (Flex Fill Viewport Height) */}
              <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1 space-y-3">
                {/* Active Plan Quota Box */}
                <div
                  className={`p-3 rounded-xl border space-y-1.5 text-xs ${
                    isExpired
                      ? "bg-red-500/10 border-red-500/40 text-red-300"
                      : "bg-[#0B0F17] border-[#2C384E]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Active Plan:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase">
                      {planName} PLAN
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Posts Quota Remaining:</span>
                    <span
                      className={`font-mono font-extrabold ${
                        isExpired ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {postsRemaining} Posts Left
                    </span>
                  </div>
                  {isExpired && (
                    <div className="pt-2 border-t border-red-500/30 flex items-center justify-between">
                      <span className="text-[11px] text-red-400 font-bold">⚠️ Plan Quota Exhausted</span>
                      <button
                        type="button"
                        onClick={openPlanModal}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
                      >
                        Purchase Plan
                      </button>
                    </div>
                  )}
                </div>

                {/* Compositing Loading Overlay / Banner */}
                {isRendering && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                    <span>Compositing 1080×1080 HD graphic... Please wait.</span>
                  </div>
                )}

                {/* TAB 1: SCHEDULE POST */}
                {exportTab === "schedule" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <CalendarClock className="w-4 h-4" />
                        <span>Automated Queue Publishing</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">
                        Schedule this graphic to publish automatically at peak audience engagement times or upcoming festival dates.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      icon={isExpired ? Lock : (isRendering ? Loader2 : CalendarClock)}
                      disabled={isRendering || isExpired}
                      onClick={() => onOpenPublisherModal && onOpenPublisherModal("SCHEDULE")}
                      className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 border-0 shadow-lg min-h-[44px] ${
                        isExpired
                          ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950"
                      }`}
                    >
                      {isRendering ? "Rendering HD Graphic..." : isExpired ? "🔒 Upgrade Plan to Schedule" : "📅 Schedule Post for Later"}
                    </Button>
                  </div>
                )}

                {/* TAB 2: DOWNLOAD HD */}
                {exportTab === "download" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Resolution & Specs:</span>
                        <span className="text-emerald-400 font-bold font-mono">1080 × 1080 Square PNG</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Base Graphic:</span>
                        <span className="text-white font-bold truncate max-w-[200px] text-right">
                          {currentTemplate?.title || (customBaseImage ? "Custom Graphic" : "No Template (Clean Canvas)")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Brand Overlay:</span>
                        <span className="text-amber-400 font-bold truncate max-w-[200px] text-right">
                          {selectedFrame?.title || "No Frame"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        variant="primary"
                        icon={isExpired && !isEditingScheduled ? Lock : (isDownloading || savePostMutation.isPending || isRendering ? Loader2 : Download)}
                        disabled={isRendering || isDownloading || savePostMutation.isPending || (isExpired && !isEditingScheduled)}
                        onClick={async () => {
                          if (isExpired && !isEditingScheduled && postsRemaining <= 0) {
                            openPlanModal && openPlanModal();
                            return;
                          }
                          if (isEditingScheduled) {
                            handleSaveToDb();
                            return;
                          }
                          setIsDownloading(true);
                          try {
                            await handleDownloadHD();
                          } finally {
                            setTimeout(() => setIsDownloading(false), 800);
                          }
                        }}
                        className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 border-0 shadow-lg cursor-pointer min-h-[44px] ${
                          isExpired && !isEditingScheduled
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950"
                        }`}
                      >
                        {isRendering
                          ? "Rendering 1080×1080 Graphic..."
                          : isDownloading || savePostMutation.isPending
                            ? "Downloading & Saving to Vault..."
                            : isEditingScheduled
                              ? "Update Scheduled Post Graphic"
                              : isExpired
                                ? "🔒 Upgrade Plan to Download"
                                : "Download HD PNG & Save to Vault"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2C384E] shrink-0 mt-auto">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(selectedFrame ? 3 : 2)} className="min-h-[34px]">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (6 Cols): Persistent Live Real-Time Preview Stage */}
        <div className={`lg:col-span-6 flex flex-col gap-3.5 ${mobileStudioTab === "editor" ? "hidden lg:flex" : "flex"}`}>
          <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between shrink-0 gap-2.5 shadow-2xl">
            {/* Header matching Left Wizard Steps */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="truncate">Live Preview</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {postFormat === "CAROUSEL"
                    ? `Slide ${activeSlideIndex + 1} of ${carouselSlides.length} • 1080×1080 HD`
                    : "1080×1080 HD composited view."}
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Format Toggle Pill */}
                <div className="flex items-center bg-[#0B0F17] p-0.5 rounded-xl border border-[#2C384E]">
                  <button
                    type="button"
                    onClick={() => {
                      if (setPostFormat) setPostFormat("SINGLE");
                      setStep1Mode("AI");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      postFormat === "SINGLE"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (setPostFormat) setPostFormat("CAROUSEL");
                      setStep1Mode("CAROUSEL");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      postFormat === "CAROUSEL"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>🎠 Carousel</span>
                    <span className="px-1 py-0.2 rounded-full bg-slate-900/50 text-[9px]">
                      {carouselSlides?.length || 5}
                    </span>
                  </button>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-extrabold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1080×1080 HD</span>
                </span>
              </div>
            </div>

            {/* Center Canvas Box (Fixed 370px size - Zero Shrink Between Steps) */}
            <CanvasPreview canvasRef={canvasRef} isRendering={isRendering} />

            {/* Live Preview Canvas Footer Status Bar */}
            <div className="mt-auto shrink-0 pt-2 border-t border-[#2C384E] w-full flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">
                  {postFormat === "CAROUSEL"
                    ? `Carousel Slide ${activeSlideIndex + 1}`
                    : "Live HD Compositor"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">1080×1080 • Square PNG</span>
            </div>
          </Card>

          {/* Carousel Slide Strip placed right below the Canvas Card */}
          {postFormat === "CAROUSEL" && (
            <div className="w-full">
              <CarouselSlideStrip
                slides={carouselSlides}
                activeSlideIndex={activeSlideIndex}
                onSelectSlide={(idx) => setActiveSlideIndex && setActiveSlideIndex(idx)}
                onAddSlide={onAddSlide}
                onDeleteSlide={onDeleteSlide}
                onMoveSlide={onMoveSlide}
                onOpenAiGenerator={onOpenAiCarouselModal}
              />
            </div>
          )}
        </div>
      </div>

      {/* ZOOMED FRAME LIGHTBOX MODAL (Matching Admin ImageLightbox High-Res Layout & Amber Border) */}
      {zoomedFrame &&
        createPortal(
          <div
            onClick={() => setZoomedFrame(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none overflow-hidden touch-none cursor-zoom-out"
          >
            {/* Top Header Controls Bar */}
            <div className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0 z-10 pointer-events-auto">
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xl"
                style={{
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                }}
              >
                <Maximize2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>High-Res 1080x1080 Graphic Preview</span>
              </div>

              <button
                onClick={() => setZoomedFrame(null)}
                className="p-2.5 rounded-full border transition cursor-pointer shadow-xl min-w-[36px] min-h-[36px] flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  color: isDark ? "#CBD5E1" : "#475569",
                }}
                title="Close Lightbox (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Center Image Container - 100% Edge-to-Edge with Gold Amber Border (Exact Match to Admin Lightbox) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 w-full flex items-center justify-center p-3 sm:p-4 cursor-default overflow-hidden"
            >
              <img
                src={zoomedFrame.previewUrl || zoomedFrame.overlayPngUrl}
                alt={zoomedFrame.title}
                className="max-h-full max-w-full aspect-square rounded-2xl shadow-2xl border-2 border-amber-500/80 object-contain block shrink-0 select-none"
                style={{
                  backgroundColor: isDark ? "#0B0F17" : "#FFFFFF",
                }}
              />
            </div>

            {/* Lightbox Complete Frame Details & Actions Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl mx-auto z-10 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border shadow-2xl space-y-2.5 shrink-0 cursor-default"
              style={{
                backgroundColor: isDark ? "rgba(19, 27, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
                borderColor: isDark ? "#2C384E" : "#CBD5E1",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="truncate pr-2">
                  <h3
                    className="font-heading font-extrabold text-sm sm:text-base truncate"
                    style={{
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    }}
                  >
                    {zoomedFrame.title}
                  </h3>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{
                      color: isDark ? "#94A3B8" : "#64748B",
                    }}
                  >
                    {zoomedFrame.description || "Customizable Brand Frame Overlay"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomedFrame(null)}
                    className="text-xs"
                    style={{
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: isDark ? "#334155" : "#CBD5E1",
                      color: isDark ? "#E2E8F0" : "#334155",
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => {
                      setSelectedFrame(zoomedFrame);
                      setZoomedFrame(null);
                    }}
                    className="text-xs font-extrabold bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg px-4"
                  >
                    Select & Apply This Frame
                  </Button>
                </div>
              </div>

              {/* Supported Slot Badges */}
              {(() => {
                let rawCfg = zoomedFrame.configJson;
                if (typeof rawCfg === "string") {
                  try {
                    rawCfg = JSON.parse(rawCfg);
                  } catch (e) {}
                }
                const elements = Array.isArray(rawCfg)
                  ? rawCfg
                  : rawCfg?.elements && Array.isArray(rawCfg.elements)
                  ? rawCfg.elements
                  : [];

                const hasLogo = elements.some(
                  (el) => el.dynamicSlot === "LOGO_BOX" || el.fieldKey === "logoUrl"
                );
                const hasAvatar = elements.some(
                  (el) => el.dynamicSlot === "AVATAR_CIRCLE" || el.fieldKey === "avatarUrl"
                );
                const hasPhone = elements.some(
                  (el) => el.dynamicSlot === "PHONE" || el.dynamicSlot === "WHATSAPP"
                );
                const hasAddress = elements.some((el) => el.dynamicSlot === "ADDRESS");
                const hasSocial = elements.some((el) =>
                  ["INSTAGRAM", "FACEBOOK", "LINKEDIN"].includes(el.dynamicSlot)
                );
                const hasUpi = elements.some(
                  (el) => el.dynamicSlot === "UPI_QR" || el.dynamicSlot === "UPI_VPA"
                );

                const badgeStyle = {
                  backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
                  borderColor: isDark ? "#2C384E" : "#E2E8F0",
                  color: isDark ? "#CBD5E1" : "#475569",
                };

                return (
                  <div
                    className="flex flex-wrap items-center gap-1.5 text-[11px] pt-2 border-t"
                    style={{ borderColor: isDark ? "rgba(44, 56, 78, 0.7)" : "#E2E8F0" }}
                  >
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold">
                      ✓ 1080×1080 HD Square Overlay
                    </span>
                    {hasLogo && (
                      <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                        🖼️ Brand Logo
                      </span>
                    )}
                    {hasAvatar && (
                      <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                        👤 Owner Portrait
                      </span>
                    )}
                    {hasPhone && (
                      <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                        📞 Phone & WhatsApp
                      </span>
                    )}
                    {hasAddress && (
                      <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                        📍 Store Address
                      </span>
                    )}
                    {hasSocial && (
                      <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                        📱 Social Handles
                      </span>
                    )}
                    {hasUpi && (
                      <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                        💳 UPI QR / Payment
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>,
          document.body,
        )}

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
