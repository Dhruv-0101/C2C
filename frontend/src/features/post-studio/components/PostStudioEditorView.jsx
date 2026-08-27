import React, { useState } from "react";
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

  const steps = [
    { num: 1, title: "Select Base Graphic" },
    { num: 2, title: "Choose Canva Frame" },
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
            <span>AI Post Studio & Canva Frame Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Composite master graphic backgrounds with Canva vector frames & your AI BrandKit.
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  isActive
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
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Or Upload Custom 1080x1080 Background Image</span>
                </label>
                <input
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

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setTemplatePage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                      !selectedCategory
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                          isSelected
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

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFestival("");
                      setTemplatePage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                      !selectedFestival
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                          isSelected
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
                          className="hover:text-white font-bold ml-0.5"
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
                          className="hover:text-white font-bold ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("");
                        setSelectedFestival("");
                        setTemplatePage(1);
                      }}
                      className="text-[11px] text-amber-400 hover:underline font-semibold ml-1"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Clean 6-Item Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingTemplates ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading base templates...</div>
                ) : templates.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                    No matching templates found.
                  </div>
                ) : (
                  templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplateId(t.id);
                        setCustomBaseImage(null);
                      }}
                      className={`relative aspect-square rounded-xl border overflow-hidden transition group ${
                        selectedTemplateId === t.id && !customBaseImage
                          ? "border-amber-500 ring-2 ring-amber-500/40"
                          : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                      }`}
                    >
                      <img
                        src={t.baseImageUrl || t.imageUrl || t.fileUrl}
                        alt={t.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition bg-[#0B0F17]"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5 truncate">
                        <p className="text-[10px] font-bold text-white truncate">{t.title}</p>
                      </div>
                    </button>
                  ))
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
                  <span>Next: Choose Canva Frame</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: CHOOSE CANVA FRAME */}
          {currentStep === 2 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Step 2: Select Canva Vector Frame Overlay</span>
                </h3>
                <span className="text-xs font-semibold text-amber-400 font-mono">2 / 4</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingFrames ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading vector frames...</div>
                ) : frames.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                    No Canva vector frames created yet.
                  </div>
                ) : (
                  frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative aspect-square rounded-xl border p-2 overflow-hidden transition group flex flex-col justify-between text-left ${
                        selectedFrame?.id === frame.id
                          ? "border-amber-500 bg-gradient-to-b from-amber-500/20 to-[#131B2A] ring-2 ring-amber-500/50"
                          : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                      }`}
                    >
                      {/* Background Frame Preview Overlay (Renders previewUrl WITH sample text) */}
                      <div className="absolute inset-0 bg-[#0B0F17] overflow-hidden pointer-events-none p-1">
                        {(frame.previewUrl || frame.overlayPngUrl) && (
                          <img
                            src={frame.previewUrl || frame.overlayPngUrl}
                            alt={frame.title}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                            className="w-full h-full object-contain relative z-10 opacity-100"
                          />
                        )}
                      </div>

                      {/* Top Header Row with Badge & Zoom Button */}
                      <div className="relative z-20 w-full flex items-center justify-between pointer-events-auto">
                        <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-extrabold uppercase backdrop-blur-md">
                          {frame.isSystem ? "✨ Vector Frame" : "Custom"}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedFrame(frame);
                          }}
                          className="p-1 rounded-lg bg-black/70 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700/60 shadow-lg backdrop-blur-md transition group-hover:scale-110"
                          title="Zoom / Preview Frame in Fullscreen"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Center Decorative Initials (Fallback ONLY if no image exists) */}
                      {!frame.previewUrl && !frame.overlayPngUrl && (
                        <div className="relative z-20 self-center my-auto flex flex-col items-center gap-1 text-slate-300 group-hover:scale-110 transition-transform">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shadow-md">
                            {frame.title?.substring(0, 2).toUpperCase() || "FR"}
                          </div>
                        </div>
                      )}

                      {/* Bottom Overlay Label */}
                      <div className="relative z-20 w-full bg-black/85 backdrop-blur-sm p-1.5 rounded-lg border border-[#2C384E] text-left">
                        <p className="text-[11px] font-extrabold text-white truncate">{frame.title}</p>
                        <p className="text-[9px] text-slate-400 truncate">{frame.description || "Vector Canva Frame"}</p>
                      </div>
                    </button>
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

          {/* STEP 3: BRANDKIT OVERRIDES */}
          {currentStep === 3 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Step 3: Business & Contact Details Overrides</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setCustomDetails((prev) => ({
                      ...prev,
                      businessName: brandKit?.businessName || "Sunrise Real Estate",
                      phone: brandKit?.phone || brandKit?.whatsapp || "+91 98765 43210",
                      address: brandKit?.address || "Business Park, MG Road, Mumbai",
                      tagline: brandKit?.tagline || "Premium Luxury Homes & Commercial Spaces",
                    }))
                  }
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Fill AI BrandKit</span>
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Business Name"
                  value={customDetails.businessName}
                  onChange={(e) => setCustomDetails({ ...customDetails, businessName: e.target.value })}
                />
                <Input
                  label="Phone / WhatsApp Number"
                  value={customDetails.phone}
                  onChange={(e) => setCustomDetails({ ...customDetails, phone: e.target.value })}
                />
                <Input
                  label="Address / Location"
                  value={customDetails.address}
                  onChange={(e) => setCustomDetails({ ...customDetails, address: e.target.value })}
                />
                <Input
                  label="Tagline / Offer Message"
                  value={customDetails.tagline}
                  onChange={(e) => setCustomDetails({ ...customDetails, tagline: e.target.value })}
                />
              </div>

              {/* Toggles for Canvas Visibility */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Canvas Element Toggles
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customDetails.showLogo}
                      onChange={(e) => setCustomDetails({ ...customDetails, showLogo: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Render Brand Logo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customDetails.showAvatar}
                      onChange={(e) => setCustomDetails({ ...customDetails, showAvatar: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Render Doctor Photo</span>
                  </label>
                </div>
              </div>

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
          )}

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
                  <span className="text-slate-400 font-semibold">Active Canva Frame:</span>
                  <span className="text-amber-400 font-bold">{selectedFrame?.title || "Default Overlay"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Business Name:</span>
                  <span className="text-white font-bold">{customDetails.businessName || "N/A"}</span>
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
                  🚀 Share / Publish to Social Media
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
        <div className="lg:col-span-6 bg-[#0B0F17] border border-[#2C384E] p-6 rounded-2xl flex flex-col items-center justify-center relative shadow-2xl min-h-[520px]">
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold shadow-lg">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>✨ What's Cooking: Live Real-Time Preview</span>
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
            High-Resolution 1080x1080 Square Post (Instagram & Facebook Ready)
          </p>
        </div>
      </div>

      {/* ZOOMED FRAME LIGHTBOX MODAL */}
      {zoomedFrame &&
        createPortal(
          <div
            onClick={() => setZoomedFrame(null)}
            className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-lg animate-in fade-in duration-200 select-none cursor-zoom-out"
          >
            {/* Center High-Res Frame Image */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl max-h-[68vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-[#0B0F17] flex items-center justify-center my-auto mb-20 cursor-default p-2"
            >
              <img
                src={zoomedFrame.previewUrl || zoomedFrame.overlayPngUrl}
                alt={zoomedFrame.title}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Lightbox Bottom Details Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-5 left-4 right-4 max-w-2xl mx-auto flex items-center justify-between z-10 bg-[#131B2A]/95 backdrop-blur-xl px-6 py-4 rounded-2xl border border-[#2C384E] shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-white truncate max-w-xs">
                    {zoomedFrame.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {zoomedFrame.description || "Canva Vector Frame with sample text details"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  icon={Sparkles}
                  onClick={() => {
                    setSelectedFrame(zoomedFrame);
                    setZoomedFrame(null);
                  }}
                  className="py-2 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg"
                >
                  ⚡ Select & Apply Frame
                </Button>

                <button
                  onClick={() => setZoomedFrame(null)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-[#2C384E]"
                  title="Close Zoom Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
