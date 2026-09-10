import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Download,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Upload,
  CheckCircle2,
  Zap,
  Share2,
  FolderKanban,
  Calendar,
  Search,
  ZoomIn,
  Maximize2,
  X,
  Trash2,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";

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
  festivals = [],
  templates,
  templatesMeta,
  isLoadingTemplates,
  templateSearch,
  setTemplateSearch,
  setTemplatePage,
  setTemplateLimit,
  frames,
  framesMeta,
  isLoadingFrames,
  setFramePage,
  setFrameLimit,
  customDetails,
  setCustomDetails,
  brandKit,
  currentTemplate,
  isRendering,
  savePostMutation,
  handleSaveToDb,
  handleDownloadHD,
  onOpenPublisherModal,
}) => {
  const customFileInputRef = useRef(null);

  // Step 1 Category Pagination (5 per page) & Search State
  const [catSearch, setCatSearch] = useState("");
  const [catPage, setCatPage] = useState(1);
  const CAT_PER_PAGE = 5;

  const filteredCategories = categoriesList.filter((cat) =>
    cat.name.toLowerCase().includes(catSearch.toLowerCase())
  );
  const catTotalPages = Math.ceil(filteredCategories.length / CAT_PER_PAGE) || 1;
  const paginatedCategories = filteredCategories.slice(
    (catPage - 1) * CAT_PER_PAGE,
    catPage * CAT_PER_PAGE
  );

  // Step 1 Festival Pagination (5 per page) & Search State
  const [festSearch, setFestSearch] = useState("");
  const [festPage, setFestPage] = useState(1);
  const FEST_PER_PAGE = 5;

  const filteredFestivals = festivals.filter((f) =>
    f.name.toLowerCase().includes(festSearch.toLowerCase())
  );
  const festTotalPages = Math.ceil(filteredFestivals.length / FEST_PER_PAGE) || 1;
  const paginatedFestivals = filteredFestivals.slice(
    (festPage - 1) * FEST_PER_PAGE,
    festPage * FEST_PER_PAGE
  );
  // Zoomed Frame Lightbox Modal State
  const [zoomedFrame, setZoomedFrame] = useState(null);

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
    { num: 3, title: "BrandKit Details" },
    { num: 4, title: "Publish & Export" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Wizard Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Post Studio & Brand Frame Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Combine master graphic backgrounds with custom brand frames & your BrandKit.
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
        <div className="lg:col-span-6 space-y-6">
          {/* STEP 1: SELECT BASE GRAPHIC */}
          {currentStep === 1 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white">
                  Step 1: Choose Master Graphic Background
                </h3>
                <span className="text-xs font-semibold text-amber-400 font-mono">1 / 4</span>
              </div>

              {/* Custom Base Image File Upload Option */}
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Or Upload Custom 1080x1080 Background Image</span>
                  </label>
                  {customBaseImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBaseImage(null);
                        if (customFileInputRef.current) {
                          customFileInputRef.current.value = "";
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 transition cursor-pointer"
                      title="Remove custom uploaded image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Custom Image</span>
                    </button>
                  )}
                </div>
                <input
                  ref={customFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCustomBaseImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                />
              </div>

              {/* 1. Categories Navigation (5 per page + Search) */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
                    <h4 className="font-heading font-extrabold text-xs text-white">
                      Categories (5 per page)
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.2 rounded-full border border-slate-700">
                      {catPage}/{catTotalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                      <input
                        type="text"
                        placeholder="Search category..."
                        value={catSearch}
                        onChange={(e) => {
                          setCatSearch(e.target.value);
                          setCatPage(1);
                        }}
                        className="pl-6 pr-2 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-28"
                      />
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={catPage <= 1}
                        onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={catPage >= catTotalPages}
                        onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))}
                        className="p-1 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-0.5 custom-scrollbar [::-webkit-scrollbar]:h-1.5 [::-webkit-scrollbar-thumb]:bg-[#2C384E] [::-webkit-scrollbar-thumb]:rounded-full [::-webkit-scrollbar-track]:bg-transparent">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setTemplatePage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${!selectedCategory
                        ? "bg-amber-500 text-slate-950 font-bold shadow-glow"
                        : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                      }`}
                  >
                    <span>🎨 All</span>
                  </button>

                  {paginatedCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setTemplatePage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${isSelected
                            ? "bg-amber-500 text-slate-950 font-bold shadow-glow"
                            : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                          }`}
                      >
                        <span>{cat.icon || "🎨"}</span>
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Festivals Navigation (5 per page + Search) */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <h4 className="font-heading font-extrabold text-xs text-white">
                      Festivals (5 per page)
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.2 rounded-full border border-slate-700">
                      {festPage}/{festTotalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                      <input
                        type="text"
                        placeholder="Search festival..."
                        value={festSearch}
                        onChange={(e) => {
                          setFestSearch(e.target.value);
                          setFestPage(1);
                        }}
                        className="pl-6 pr-2 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-28"
                      />
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={festPage <= 1}
                        onClick={() => setFestPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={festPage >= festTotalPages}
                        onClick={() => setFestPage((p) => Math.min(festTotalPages, p + 1))}
                        className="p-1 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-0.5 custom-scrollbar [::-webkit-scrollbar]:h-1.5 [::-webkit-scrollbar-thumb]:bg-[#2C384E] [::-webkit-scrollbar-thumb]:rounded-full [::-webkit-scrollbar-track]:bg-transparent">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFestival("");
                      setTemplatePage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${!selectedFestival
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-glow"
                        : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                      }`}
                  >
                    <span>🎉 All</span>
                  </button>

                  {paginatedFestivals.map((f) => {
                    const isSelected = selectedFestival === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFestival(f.id);
                          setTemplatePage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${isSelected
                            ? "bg-emerald-500 text-slate-950 font-bold shadow-glow"
                            : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                          }`}
                      >
                        <span>🪔</span>
                        <span>{f.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Search Base Templates & Active Combined Filter Badges */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search templates by title..."
                    value={templateSearch}
                    onChange={(e) => {
                      setTemplateSearch(e.target.value);
                      setTemplatePage(1);
                    }}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                  />
                </div>

                {(selectedCategory || selectedFestival) && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">Filters:</span>
                    {selectedCategory && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1">
                        <span>Cat: {selectedCategory}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory("");
                            setTemplatePage(1);
                          }}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedFestival && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1">
                        <span>Fest: {festivals.find((f) => f.id === selectedFestival)?.name || selectedFestival}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFestival("");
                            setTemplatePage(1);
                          }}
                          className="hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Grid of Graphic Background Templates */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingTemplates ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading templates...</div>
                ) : templates.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
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
                        className={`relative aspect-square rounded-xl border p-1.5 overflow-hidden transition group text-left ${isSelected
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

              {/* Modular Central Pagination */}
              {templatesMeta && (
                <div className="pt-2 border-t border-[#2C384E]">
                  <Pagination
                    meta={templatesMeta}
                    onPageChange={(p) => setTemplatePage(p)}
                    onLimitChange={(l) => {
                      setTemplateLimit(l);
                      setTemplatePage(1);
                    }}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-[#2C384E]">
                <Button variant="primary" onClick={() => setCurrentStep(2)}>
                  <span>Next: Choose Brand Frame</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: CHOOSE BRAND FRAME */}
          {currentStep === 2 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Step 2: Select Custom Brand Frame</span>
                </h3>
                <span className="text-xs font-semibold text-amber-400 font-mono">2 / 4</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingFrames ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading brand frames...</div>
                ) : frames.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                    No custom brand frames created yet.
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

                      {/* ONLY Frame Title BELOW the frame image box (frame ke niche) */}
                      <p className="text-xs font-bold text-slate-200 truncate text-center px-1">
                        {frame.title}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {framesMeta && (
                <div className="pt-2 border-t border-[#2C384E]">
                  <Pagination
                    meta={framesMeta}
                    onPageChange={(p) => setFramePage(p)}
                    onLimitChange={(l) => {
                      setFrameLimit(l);
                      setFramePage(1);
                    }}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                  <span>Next: BrandKit Details</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
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
                  slot === "CUSTOM_IMAGE" ||
                  slot === "MANUAL_INPUT"
                ) {
                  const isPrimaryAvatar = slot === "AVATAR_CIRCLE" && (el.id === "el-avatar-circle" || el.name === "Profile Photo");
                  const isPrimaryLogo = slot === "LOGO_BOX" && (el.id === "el-logo-box" || el.name === "Brand Logo");

                  if (isPrimaryAvatar) {
                    const fieldKey = "showAvatar";
                    if (!seenKeys.has(fieldKey)) {
                      seenKeys.add(fieldKey);
                      imageToggles.push({ id: el.id, key: "showAvatar", label: el.customLabel || el.name || "Render Profile Photo", type: "AVATAR", fieldKey, rawElement: el });
                    }
                  } else if (isPrimaryLogo) {
                    const fieldKey = "showLogo";
                    if (!seenKeys.has(fieldKey)) {
                      seenKeys.add(fieldKey);
                      imageToggles.push({ id: el.id, key: "showLogo", label: el.customLabel || el.name || "Render Brand Logo", type: "LOGO", fieldKey, rawElement: el });
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
                  } else {
                    fieldKey = el.fieldKey || el.id || (el.name ? el.name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "customText");
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

            const { textFields, imageToggles, customImageSlots } = getDynamicFrameFields(selectedFrame);

            return (
              <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
                <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <span>Step 3: Business & Contact Details Overrides</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dynamically loaded from frame blueprint ({selectedFrame?.title || "Default Frame"}).
                    </p>
                  </div>
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
                        else if (fk === "websiteUrl") updated.websiteUrl = brandKit?.websiteUrl || tf.placeholder || "https://yourbusiness.com";
                        else if (fk === "instagramHandle") updated.instagramHandle = brandKit?.instagramHandle || tf.placeholder || "@yourbrand";
                        else if (fk === "facebookHandle") updated.facebookHandle = brandKit?.facebookHandle || tf.placeholder || "yourbrand";
                        else if (fk === "city") updated.city = brandKit?.city || tf.placeholder || "Mumbai";
                        else if (fk === "state") updated.state = brandKit?.state || tf.placeholder || "Maharashtra";
                        else if (fk === "country") updated.country = brandKit?.country || tf.placeholder || "India";
                        else updated[fk] = brandKit?.[fk] || tf.placeholder || "Sample Text";
                      });
                      setCustomDetails(updated);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fill Brandkit</span>
                  </button>
                </div>

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
                        <label
                          key={it.fieldKey}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 cursor-pointer hover:border-slate-500 transition"
                        >
                          <input
                            type="checkbox"
                            checked={customDetails[it.fieldKey] !== undefined ? customDetails[it.fieldKey] : true}
                            onChange={(e) =>
                              setCustomDetails((prev) => ({
                                ...prev,
                                [it.fieldKey]: e.target.checked,
                              }))
                            }
                            className="rounded accent-amber-500"
                          />
                          <span className="font-semibold">{it.label}</span>
                        </label>
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

                <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button variant="primary" onClick={() => setCurrentStep(4)}>
                    <span>Next: Publish & Export</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })()}

          {/* STEP 4: EXPORT & PUBLISH */}
          {currentStep === 4 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 4: Publish & Export Final Composited Post</span>
                </h3>
                <span className="text-xs font-semibold text-emerald-400 font-mono">4 / 4</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Active Base Graphic:</span>
                  <span className="text-white font-bold">{currentTemplate?.title || "Custom Graphic"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Active Brand Frame:</span>
                  <span className="text-amber-400 font-bold">{selectedFrame?.title || "Default Overlay"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Export Canvas Specs:</span>
                  <span className="text-emerald-400 font-bold">1080 x 1080 Square PNG (HD)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {/* 🚀 Social Publisher Button */}
                <Button
                  variant="primary"
                  icon={Share2}
                  onClick={onOpenPublisherModal}
                  className="w-full justify-center text-sm font-extrabold py-3.5 bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg"
                >
                  🚀 Publish to Social Media
                </Button>

                <Button
                  variant="outline"
                  icon={Download}
                  onClick={handleDownloadHD}
                  className="w-full justify-center text-xs font-bold py-2.5"
                >
                  Download 1080x1080 HD PNG
                </Button>

                <Button
                  variant="outline"
                  icon={BookmarkCheck}
                  onClick={handleSaveToDb}
                  isLoading={savePostMutation.isPending}
                  className="w-full justify-center border-[#2C384E] text-slate-300 hover:text-white text-xs"
                >
                  Save Post Draft to Vault
                </Button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (6 Cols): Persistent Live Real-Time Preview Stage */}
        <div className="lg:col-span-6 bg-[#0B0F17] border border-[#2C384E] p-6 rounded-2xl flex flex-col items-center justify-center relative shadow-2xl min-h-[520px] lg:sticky lg:top-6 self-start">
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold shadow-lg">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>Live Real-Time Preview</span>
          </div>

          <div className="relative aspect-square w-full max-w-lg rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center mt-6">
            {isRendering && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-amber-400 text-xs font-semibold space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                <span>Compositing 1080x1080 HD Canvas...</span>
              </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            High-Resolution 1080x1080 HD Square Graphic
          </p>
        </div>
      </div>

      {/* ZOOMED FRAME LIGHTBOX MODAL */}
      {zoomedFrame &&
        createPortal(
          <div
            onClick={() => setZoomedFrame(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 w-full h-full z-[99999] flex flex-col items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-lg animate-in fade-in duration-200 select-none overflow-hidden touch-none cursor-zoom-out"
          >
            <div className="flex flex-col items-center justify-center w-full max-w-[520px] gap-4 max-h-[90vh] overflow-hidden">
              {/* Center High-Res Frame Image */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-h-[58vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-[#0B0F17] flex items-center justify-center cursor-default p-2"
              >
                <img
                  src={zoomedFrame.previewUrl || zoomedFrame.overlayPngUrl}
                  alt={zoomedFrame.title}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              </div>

              {/* Lightbox Bottom Details Bar */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full flex items-center justify-between gap-3 sm:gap-4 z-10 bg-[#131B2A]/95 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-[#2C384E] shadow-2xl overflow-hidden shrink-0"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-extrabold text-sm sm:text-base text-white truncate">
                      {zoomedFrame.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Button
                    variant="primary"
                    icon={Sparkles}
                    onClick={() => {
                      setSelectedFrame(zoomedFrame);
                      setZoomedFrame(null);
                    }}
                    className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg shrink-0 whitespace-nowrap"
                  >
                    Select & Apply Frame
                  </Button>

                  <button
                    onClick={() => setZoomedFrame(null)}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-[#2C384E] shrink-0"
                    title="Close Zoom Preview"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
