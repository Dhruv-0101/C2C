import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  FolderKanban,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  ImageIcon,
  X,
  Eye,
  Check,
  Palette,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";

/**
 * TemplateCreateView
 * Dedicated Full-Screen Page View for creating and uploading Admin Master Templates.
 */
export const TemplateCreateView = ({
  onBack,
  formData,
  setFormData,
  handleFileChange,
  handleFormSubmit,
  errorMsg,
  categoriesList = [],
  festivals = [],
  isUploading = false,
}) => {
  // Category Pagination (5 per page) & Search State inside Create Screen
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

  // Festival Pagination (5 per page) & Search State inside Create Screen
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-400 transition flex items-center gap-2 font-semibold text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Templates Grid</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-2xl text-white">
                Upload New Base Graphic Blueprint
              </h2>
              <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                Full-Screen Creator
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Design and publish system graphic backgrounds for small businesses across all categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" type="button" onClick={onBack} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleFormSubmit}
            isLoading={isUploading}
            icon={Sparkles}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-glow"
          >
            Publish Template Blueprint
          </Button>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Main Creator Grid: Left Form Controls (8 Cols) vs Right Live Preview Studio (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-6 bg-[#131B2A]/90 border-[#2C384E] rounded-3xl shadow-xl">
            {/* Step 1: Basic Metadata */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Template Information
                </h3>
              </div>

              <Input
                label="Template Title"
                placeholder="e.g. Modern Real Estate Grand Opening Promo Background"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the target usage, theme, or design intent..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Step 2: Category Selector (5 per page + Search + Highlighted New Creation) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Assign Category & Type
                </h3>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-[#0B0F17]/80 border border-[#2C384E]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-amber-400" />
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Categories Navigation (5 per page)
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                      Page {catPage} of {catTotalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={catSearch}
                        onChange={(e) => {
                          setCatSearch(e.target.value);
                          setCatPage(1);
                        }}
                        className="pl-8 pr-3 py-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-40"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={catPage <= 1}
                        onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={catPage >= catTotalPages}
                        onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))}
                        className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Pills (5 per page) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  {/* PROMINENTLY HIGHLIGHTED NEW CATEGORY BUTTON */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: "NEW" })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border hover:scale-[1.02] active:scale-[0.98] ${
                      formData.category === "NEW"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-glow font-extrabold scale-105"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>+ Create New Category</span>
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">NEW</span>
                  </button>

                  {paginatedCategories.map((cat) => {
                    const isSelected = formData.category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.name })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] ${
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

              {/* Custom Category Input */}
              {formData.category === "NEW" && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/40 space-y-2 animate-in fade-in shadow-glow">
                  <label className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Enter New Custom Category Name</span>
                  </label>
                  <Input
                    placeholder="e.g. Real Estate Deals, Gym & Fitness..."
                    value={formData.newCategoryName || ""}
                    onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                    required
                    className="bg-[#0B0F17] border-amber-500/50 focus:border-amber-400 text-amber-100 placeholder:text-amber-300/40 font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Step 3: Festival Selector (5 per page + Search) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Associate Festival Event (Optional)
                </h3>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-[#0B0F17]/80 border border-[#2C384E]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <label className="text-xs font-bold text-white uppercase tracking-wider">
                      Festivals Navigation (5 per page)
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                      Page {festPage} of {festTotalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search festivals..."
                        value={festSearch}
                        onChange={(e) => {
                          setFestSearch(e.target.value);
                          setFestPage(1);
                        }}
                        className="pl-8 pr-3 py-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-40"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={festPage <= 1}
                        onClick={() => setFestPage((p) => Math.max(1, p - 1))}
                        className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={festPage >= festTotalPages}
                        onClick={() => setFestPage((p) => Math.min(festTotalPages, p + 1))}
                        className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Festival Pills (5 per page) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, festivalId: "" })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] ${
                      !formData.festivalId
                        ? "bg-emerald-500 text-slate-950 font-bold shadow-glow"
                        : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                    }`}
                  >
                    <span>🎉 No Specific Festival</span>
                  </button>

                  {paginatedFestivals.map((f) => {
                    const isSelected = formData.festivalId === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, festivalId: f.id })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] ${
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
            </div>

            {/* Step 4: Graphic File Upload Dropzone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Upload Background Image File
                </h3>
              </div>

              {!formData.baseImageUrl ? (
                <label className="border-2 border-dashed border-[#2C384E] hover:border-amber-500/60 bg-[#0B0F17]/60 hover:bg-[#0B0F17] p-8 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition group text-center">
                  <div className="p-4 rounded-3xl bg-slate-800/60 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition shadow-inner">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-400 group-hover:underline">
                      Click to choose image from computer
                    </span>
                    <span className="text-sm text-slate-400"> or drag and drop</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Recommended: 1080×1080 Square Graphic (PNG, JPG, WEBP - Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-3xl overflow-hidden border border-[#2C384E] group bg-[#0B0F17]">
                  <img
                    src={formData.baseImageUrl}
                    alt="Template Background Preview"
                    className="w-full h-64 object-contain bg-[#0B0F17]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, baseImageUrl: null })}
                      className="p-3 rounded-2xl bg-red-500/80 text-white hover:bg-red-500 font-bold transition flex items-center gap-2 text-xs shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      <span>Remove Background Image</span>
                    </button>
                  </div>
                  <span className="absolute bottom-3 right-3 text-xs font-bold bg-black/80 text-white px-3 py-1 rounded-xl backdrop-blur-md border border-slate-700">
                    1080×1080 HD Blueprint
                  </span>
                </div>
              )}
            </div>
          </Card>
        </form>

        {/* Right Column: Live Interactive Blueprint Studio Card Preview */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          <Card className="p-6 space-y-5 bg-[#131B2A]/90 border-[#2C384E] rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
              <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Live Graphic Blueprint Preview</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Studio View
              </span>
            </div>

            {/* Simulated SMB Frame Overlay Preview Card */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#2C384E] bg-[#0B0F17] shadow-2xl flex flex-col justify-between p-4">
              {formData.baseImageUrl ? (
                <img
                  src={formData.baseImageUrl}
                  alt="Template Background"
                  className="absolute inset-0 w-full h-full object-contain bg-[#0B0F17]"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600 bg-gradient-to-br from-[#0B0F17] to-[#131B2A]">
                  <ImageIcon className="w-12 h-12 stroke-[1.5]" />
                  <span className="text-xs font-semibold text-slate-500">
                    Upload an image to see live preview
                  </span>
                </div>
              )}

              {/* Simulated Admin Branding Overlay */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-extrabold tracking-wide flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {formData.category === "NEW"
                      ? formData.newCategoryName || "Custom Category"
                      : formData.category || "General Category"}
                  </span>
                </span>

                {formData.festivalId && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/80 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-glow">
                    {festivals.find((f) => f.id === formData.festivalId)?.name || "Festival Tag"}
                  </span>
                )}
              </div>

              {/* Simulated Title Banner */}
              <div className="relative z-10 p-3.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
                  Template Title
                </span>
                <p className="text-xs font-bold text-white line-clamp-2">
                  {formData.title || "Untitled Master Graphic Blueprint"}
                </p>
              </div>
            </div>

            {/* Template Specs Summary Table */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Aspect Ratio</span>
                <span className="text-white font-semibold">1:1 Square (1080×1080)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Category Tag</span>
                <span className="text-amber-400 font-bold">
                  {formData.category === "NEW"
                    ? formData.newCategoryName || "Custom"
                    : formData.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Associated Event</span>
                <span className="text-emerald-400 font-bold">
                  {festivals.find((f) => f.id === formData.festivalId)?.name || "General Business"}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              type="button"
              onClick={handleFormSubmit}
              isLoading={isUploading}
              icon={Sparkles}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-glow text-sm"
            >
              Publish Template Blueprint
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
