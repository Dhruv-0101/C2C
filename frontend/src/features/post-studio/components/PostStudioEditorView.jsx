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
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from '@/components/ui/Pagination';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { CanvasPreview } from './CanvasPreview';

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
}) => {
  const customFileInputRef = useRef(null);

  // Step 4 Export Sub-Tab State ('download' | 'publish' | 'schedule')
  const [exportTab, setExportTab] = useState("download");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Post Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create branded posts with custom frames & BrandKit.
          </p>
        </div>

        {/* Wizard Stepper Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${isActive
                  ? "bg-amber-500 text-slate-950 shadow-glow"
                  : isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-[#0B0F17] text-slate-400 border border-[#2C384E]"
                  }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-extrabold">
                  {isCompleted ? "✓" : step.num}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {saveSuccess && <Alert variant="success" message={saveSuccess} />}
      {saveError && <Alert variant="danger" message={saveError} />}

      {/* Main Studio Viewport (Left Controls, Right Live Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (6 Cols): Wizard Controls */}
        <div className="lg:col-span-6 flex flex-col min-h-[570px]">
          {/* STEP 1: SELECT BASE GRAPHIC */}
          {currentStep === 1 && (
            <Card className="p-4 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[570px] gap-3.5">
              {/* TOP CONTROLS SECTION */}
              <div className="space-y-2.5 shrink-0">
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Step 1: Graphic</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Select graphic template or custom upload.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Button variant="primary" size="sm" onClick={() => setCurrentStep(2)} className="shadow-lg font-bold">
                      <span>Next: Brand Frame</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Custom Base Image File Upload / Active Preview Section */}
                {!customBaseImage ? (
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

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => setPreviewLightboxUrl(customBaseImage)}
                          className="text-xs font-bold border-amber-500/30 text-amber-300 hover:text-white px-2.5 py-1"
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
                          className="text-xs font-bold border-slate-700 text-slate-300 hover:text-white px-2.5 py-1"
                        >
                          Replace
                        </Button>
                        <button
                          type="button"
                          onClick={handleRemoveCustomImage}
                          className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          title="Remove custom upload"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}              {/* 1. Template Category Navigation Dropdown */}
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

              {/* Graphic Background Templates Grid (Flex Fill Viewport Height - 100% Locked Card Height) */}
              <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                        <p className="text-[11px] font-bold text-white truncate">Custom Uploaded Image</p>
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
                            <p className="text-[11px] font-bold text-white truncate">{tpl.title}</p>
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

              {/* Pagination */}
              {templatesMeta && (
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
            <Card className="p-4 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[570px] gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                <div>
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                    <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">Step 2: Frame</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Choose brand overlay or template only.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentStep(selectedFrame ? 3 : 4)}
                    className="shadow-lg font-bold"
                  >
                    <span>{selectedFrame ? "Next: Details" : "Next: Export"}</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* No Frame Quick Toggle Option (Saves grid space) */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] shrink-0">
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${selectedFrame === null
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
                <Card className="p-4 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between h-[570px] min-h-[570px] max-h-[570px] overflow-hidden shrink-0 gap-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">Step 3: Details</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        Template only (No frame selected).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="shadow-lg font-bold">
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
                      <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                        <Layers className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        Choose a Brand Frame
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)}>
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
              <Card className="p-4 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between h-[570px] min-h-[570px] max-h-[570px] overflow-hidden shrink-0 gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Step 3: Details</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Edit text fields & image toggles.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
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
                      className="px-2 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Auto fill fields from your active BrandKit"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>BrandKit</span>
                    </button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setCurrentStep(4)} className="shadow-lg font-bold">
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
            <Card className="p-4 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between h-[570px] min-h-[570px] max-h-[570px] overflow-hidden shrink-0 gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
                <div>
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Step 4: Export & Publish</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Download HD PNG or publish/schedule to social platforms.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(selectedFrame ? 3 : 2)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                </div>
              </div>

              {/* Step 4 Sub-Tabs Ribbon */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0B0F17] rounded-xl border border-[#2C384E] shrink-0">
                <button
                  type="button"
                  onClick={() => setExportTab("download")}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    exportTab === "download"
                      ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Download HD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab("publish")}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    exportTab === "publish"
                      ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Social Publish</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTab("schedule")}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    exportTab === "schedule"
                      ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Schedule Post</span>
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

                {/* TAB 1: DOWNLOAD HD */}
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
                          {currentTemplate?.title || "Custom Graphic"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">Brand Overlay:</span>
                        <span className="text-amber-400 font-bold truncate max-w-[200px] text-right">
                          {selectedFrame?.title || "No Frame (Template Only)"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        variant="primary"
                        icon={isExpired ? Lock : (isDownloading || isRendering ? Loader2 : Download)}
                        disabled={isRendering || isDownloading || isExpired}
                        onClick={async () => {
                          if (isExpired || postsRemaining <= 0) {
                            openPlanModal && openPlanModal();
                            return;
                          }
                          setIsDownloading(true);
                          try {
                            await handleDownloadHD();
                          } finally {
                            setTimeout(() => setIsDownloading(false), 800);
                          }
                        }}
                        className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3 border-0 shadow-lg ${
                          isExpired
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950"
                        }`}
                      >
                        {isRendering
                          ? "Rendering 1080×1080 Graphic..."
                          : isDownloading
                            ? "Preparing HD Download..."
                            : isExpired
                              ? "🔒 Upgrade Plan to Download"
                              : "Download 1080×1080 HD PNG"}
                      </Button>

                      <Button
                        variant={isEditingScheduled ? "primary" : "outline"}
                        icon={isExpired && !isEditingScheduled ? Lock : (savePostMutation.isPending || isUpdatingGraphic ? Loader2 : BookmarkCheck)}
                        disabled={savePostMutation.isPending || isUpdatingGraphic || isRendering || (isExpired && !isEditingScheduled)}
                        onClick={handleSaveToDb}
                        className="w-full justify-center border-[#2C384E] text-slate-300 hover:text-white text-xs font-bold py-2.5"
                      >
                        {savePostMutation.isPending || isUpdatingGraphic
                          ? "Saving Post to Vault..."
                          : isEditingScheduled
                            ? "Update Scheduled Post Graphic (0 Credits)"
                            : isExpired
                              ? "🔒 Upgrade Plan to Save"
                              : "Save Post Draft to Vault"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* TAB 2: SOCIAL PUBLISH */}
                {exportTab === "publish" && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2.5 text-xs">
                      <p className="text-slate-300 leading-relaxed text-xs">
                        Publish your 1080×1080 branded graphic instantly across connected social accounts.
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-[#131B2A] border border-[#2C384E] text-center">
                          <span className="text-[11px] font-bold text-pink-400 block">Instagram</span>
                          <span className="text-[9px] text-slate-400">Post & Feed</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#131B2A] border border-[#2C384E] text-center">
                          <span className="text-[11px] font-bold text-blue-400 block">Facebook</span>
                          <span className="text-[9px] text-slate-400">Page Feed</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#131B2A] border border-[#2C384E] text-center">
                          <span className="text-[11px] font-bold text-sky-400 block">LinkedIn</span>
                          <span className="text-[9px] text-slate-400">Company Post</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      icon={isExpired ? Lock : (isRendering ? Loader2 : Share2)}
                      disabled={isRendering || isExpired}
                      onClick={() => onOpenPublisherModal && onOpenPublisherModal("NOW")}
                      className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 border-0 shadow-lg ${
                        isExpired
                          ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950"
                      }`}
                    >
                      {isRendering ? "Rendering HD Graphic..." : isExpired ? "🔒 Upgrade Plan to Publish" : "🚀 Launch Social Publisher"}
                    </Button>
                  </div>
                )}

                {/* TAB 3: SCHEDULE POST */}
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
                      className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 border-0 shadow-lg ${
                        isExpired
                          ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950"
                      }`}
                    >
                      {isRendering ? "Rendering HD Graphic..." : isExpired ? "🔒 Upgrade Plan to Schedule" : "📅 Schedule Post for Later"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2C384E] shrink-0 mt-auto">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(selectedFrame ? 3 : 2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (6 Cols): Persistent Live Real-Time Preview Stage */}
        <div className="lg:col-span-6 flex flex-col h-[570px] lg:sticky lg:top-6">
          <Card className="p-4 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between h-[570px] min-h-[570px] max-h-[570px] overflow-hidden shrink-0 gap-2.5 shadow-2xl">
            {/* Header matching Left Wizard Steps */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
              <div>
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="truncate">Live Preview</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  1080×1080 HD composited view.
                </p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
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
                <span className="font-semibold text-slate-300">Live HD Compositor</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">1080×1080 • Square PNG</span>
            </div>
          </Card>
        </div>
      </div>

      {/* ZOOMED FRAME LIGHTBOX MODAL (Complete Frame Details) */}
      {zoomedFrame &&
        createPortal(
          <div
            onClick={() => setZoomedFrame(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 w-full h-full z-[99999] flex flex-col items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-lg animate-in fade-in duration-200 select-none overflow-hidden touch-none cursor-zoom-out"
          >
            <div className="flex flex-col items-center justify-center w-full max-w-[560px] gap-3 max-h-[92vh] overflow-hidden">
              {/* Center High-Res Frame Image */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-h-[50vh] sm:max-h-[54vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-[#0B0F17] flex items-center justify-center cursor-default p-3"
              >
                <img
                  src={zoomedFrame.previewUrl || zoomedFrame.overlayPngUrl}
                  alt={zoomedFrame.title}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </div>

              {/* Lightbox Complete Frame Details Card */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full z-10 bg-[#131B2A]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-[#2C384E] shadow-2xl overflow-hidden shrink-0 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-extrabold text-base sm:text-lg text-white truncate">
                        {zoomedFrame.title}
                      </h3>
                      {zoomedFrame.description && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {zoomedFrame.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setZoomedFrame(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-[#2C384E] shrink-0"
                    title="Close Zoom Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Frame Specifications & Supported Slot Badges */}
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

                  return (
                    <div className="space-y-2 pt-2 border-t border-[#2C384E]/70">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                          ✓ 1080×1080 HD Square Overlay
                        </span>
                        {hasLogo && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300">
                            🖼️ Brand Logo
                          </span>
                        )}
                        {hasAvatar && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300">
                            👤 Owner Portrait
                          </span>
                        )}
                        {hasPhone && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300">
                            📞 Phone & WhatsApp
                          </span>
                        )}
                        {hasAddress && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300">
                            📍 Store Address
                          </span>
                        )}
                        {hasSocial && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300">
                            📱 Social Handles
                          </span>
                        )}
                        {hasUpi && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300">
                            💳 UPI QR / Payment
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Select Action */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2C384E]/70">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomedFrame(null)}
                    className="text-xs"
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
    </div>
  );
};
