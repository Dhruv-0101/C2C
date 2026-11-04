import React from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Gift,
  AlertCircle,
  ArrowUpRight,
  Upload,
  Eye,
  Trash2,
  FolderTree,
  Search,
  Calendar,
  CheckCircle2,
  ImageOff,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { NanoBananaAiGenerator } from "../NanoBananaAiGenerator";
import { ReelVideoUploader } from "../ReelVideoUploader";

/**
 * Step1VisualSelector
 * Renders Step 1: Base Graphic selection (AI Generator, Ready Templates, Custom Upload, Reels).
 */
export const Step1VisualSelector = ({
  setCurrentStep,
  subscription,
  postsRemaining = 0,
  planName = "FREE",
  openPlanModal,
  activateFreeMutation,
  step1Mode = "AI",
  setStep1Mode,
  customBaseImage,
  setCustomBaseImage,
  setIsCreditAlreadyPaid,
  handleRemoveCustomImage,
  brandKit,
  setIsCaptionModalOpen,
  isExpired = false,
  activeVideo,
  setActiveVideo,
  isDraggingOver = false,
  setIsDraggingOver,
  handleFileUpload,
  customFileInputRef,
  setPreviewLightboxUrl,
  isCategoryDropdownOpen = false,
  setIsCategoryDropdownOpen,
  selectedCategory = "",
  setSelectedCategory,
  categoryMeta,
  categoriesList = [],
  catSearch = "",
  setCatSearch,
  catPage = 1,
  setCatPage,
  catTotalPages = 1,
  isLoadingCategories = false,
  isFestivalDropdownOpen = false,
  setIsFestivalDropdownOpen,
  selectedFestival = "",
  setSelectedFestival,
  selectedFestivalObj,
  festivalMeta,
  festivals = [],
  festSearch = "",
  setFestSearch,
  festPage = 1,
  setFestPage,
  festTotalPages = 1,
  isLoadingFestivals = false,
  templateSearch = "",
  setTemplateSearch,
  templatePage = 1,
  setTemplatePage,
  selectedTemplateId,
  setSelectedTemplateId,
  currentTemplate,
  templates = [],
  templatesMeta,
  isLoadingTemplates = false,
  setTemplateLimit,
}) => {
  return (
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
                  {!subscription?.hasPlan && !Boolean(subscription?.hasClaimedFree || subscription?.isFreeClaimed || (subscription?.totalPostsAllowed || 0) > 0)
                    ? "No Active Plan - Claim Your 5 Free Posts!"
                    : "Post Quota Exhausted (0 Posts Left)"}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {!subscription?.hasPlan && !Boolean(subscription?.hasClaimedFree || subscription?.isFreeClaimed || (subscription?.totalPostsAllowed || 0) > 0)
                    ? "Activate your free starter tier to create AI visuals, custom graphics, and publish campaigns."
                    : "You have 0 posts remaining on your current plan. Upgrade to unlock more AI post creation."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              {!subscription?.hasPlan && !Boolean(subscription?.hasClaimedFree || subscription?.isFreeClaimed || (subscription?.totalPostsAllowed || 0) > 0) && activateFreeMutation && (
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
            <span>✨ AI Images</span>
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
            onClick={() => setStep1Mode("UPLOAD")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[34px] ${
              step1Mode === "UPLOAD"
                ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📤 Custom Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setStep1Mode("REEL")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap min-h-[34px] ${
              step1Mode === "REEL"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🎬 Reels & Video</span>
          </button>
        </div>

        {/* 1. NANO BANANA AI CREATOR MODE */}
        {step1Mode === "AI" && (
          <NanoBananaAiGenerator
            onSelectImage={(url, meta) => {
              setCustomBaseImage(url);
              if (setIsCreditAlreadyPaid) {
                setIsCreditAlreadyPaid(Boolean(meta?.isCreditAlreadyPaid));
              }
            }}
            activeImage={customBaseImage}
            onClearImage={() => {
              handleRemoveCustomImage();
              if (setIsCreditAlreadyPaid) {
                setIsCreditAlreadyPaid(false);
              }
            }}
            brandKit={brandKit}
            onOpenCaptionGenerator={() => setIsCaptionModalOpen && setIsCaptionModalOpen(true)}
            openPlanModal={openPlanModal}
            subscription={subscription}
            postsRemaining={postsRemaining}
            isExpired={isExpired}
            planName={planName}
            activateFreeMutation={activateFreeMutation}
          />
        )}

        {/* 4. USER REEL / VIDEO UPLOADER MODE */}
        {step1Mode === "REEL" && (
          <ReelVideoUploader
            activeVideo={activeVideo}
            onSelectVideo={(videoData) => {
              if (setActiveVideo) setActiveVideo(videoData);
              if (videoData.thumbnailUrl) {
                setCustomBaseImage(videoData.thumbnailUrl);
              }
            }}
            onClearVideo={() => {
              if (setActiveVideo) setActiveVideo(null);
            }}
            onOpenCaptionGenerator={() => setIsCaptionModalOpen && setIsCaptionModalOpen(true)}
          />
        )}

        {/* 2. CUSTOM UPLOAD MODE */}
        {step1Mode === "UPLOAD" && (
          !customBaseImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver && setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver && setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver && setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                handleFileUpload && handleFileUpload(file);
              }}
              onClick={() => customFileInputRef.current?.click()}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                isDraggingOver
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
                  handleFileUpload && handleFileUpload(file);
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
                    onClick={() => setPreviewLightboxUrl && setPreviewLightboxUrl(customBaseImage)}
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
                    onClick={() => setPreviewLightboxUrl && setPreviewLightboxUrl(customBaseImage)}
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
                      handleFileUpload && handleFileUpload(file);
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
                onClick={() => setIsCategoryDropdownOpen && setIsCategoryDropdownOpen((prev) => !prev)}
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
                          setTemplatePage && setTemplatePage(1);
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

                  <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("");
                        setTemplatePage && setTemplatePage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        !selectedCategory
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
                            setTemplatePage && setTemplatePage(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                            isSelected
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
                onClick={() => setIsFestivalDropdownOpen && setIsFestivalDropdownOpen((prev) => !prev)}
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
                          setTemplatePage && setTemplatePage(1);
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

                  <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFestival("");
                        setTemplatePage && setTemplatePage(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        !selectedFestival
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
                            setTemplatePage && setTemplatePage(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                            isSelected
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
                    setTemplatePage && setTemplatePage(1);
                  }}
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
                {templateSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateSearch("");
                      setTemplatePage && setTemplatePage(1);
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
                          setTemplatePage && setTemplatePage(1);
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
                          setTemplatePage && setTemplatePage(1);
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

      {/* Graphic Background Templates Grid */}
      {step1Mode === "TEMPLATES" && (
        <>
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
                    ? "Clean solid background for AI posts or direct frame branding."
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
                        setPreviewLightboxUrl && setPreviewLightboxUrl(customBaseImage);
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
                        handleRemoveCustomImage && handleRemoveCustomImage();
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
                        if (setIsCreditAlreadyPaid) {
                          setIsCreditAlreadyPaid(false);
                        }
                      }}
                      className={`relative aspect-square rounded-xl border p-1.5 overflow-hidden transition group text-left cursor-pointer ${
                        isSelected
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
            onPageChange={(p) => setTemplatePage && setTemplatePage(p)}
            onLimitChange={(l) => {
              setTemplateLimit && setTemplateLimit(l);
              setTemplatePage && setTemplatePage(1);
            }}
            pageSizeOptions={[6, 8, 12, 24]}
            className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-3 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-slate-300 shadow-sm mt-1"
          />
        </div>
      )}
    </Card>
  );
};
