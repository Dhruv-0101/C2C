import React from "react";
import { ArrowLeft, Sparkles, Upload, ImageIcon, X, Check } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";

/**
 * FestivalCreateView
 * Dedicated Full-Screen Page View for creating and editing Admin Festival Events with side preview.
 */
export const FestivalCreateView = ({
  onBack,
  formData,
  setFormData,
  editingFestival,
  handleSaveSubmit,
  handleBannerFileChange,
  base64Banner,
  setBase64Banner,
  bannerPreview,
  setBannerPreview,
  isSubmitting,
  formError,
}) => {
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
            <span>Back to Festival List</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-2xl text-white">
                {editingFestival ? "Edit Festival Event" : "Add New Festival Event"}
              </h2>
              <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                Full-Screen Creator
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" type="button" onClick={onBack} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSaveSubmit}
            isLoading={isSubmitting}
            icon={Sparkles}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-glow"
          >
            {editingFestival ? "Update Festival" : "Create Festival"}
          </Button>
        </div>
      </div>

      {formError && <Alert variant="error" message={formError} />}

      {/* Main Creator Grid: Left Form Controls (7 Cols) vs Right Pure Banner Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSaveSubmit} className="lg:col-span-7 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 bg-[#131B2A]/90 border-[#2C384E] rounded-3xl shadow-xl">
            {/* Step 1: Basic Festival Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Festival Event Information
                </h3>
              </div>

              <Input
                label="Festival Name"
                placeholder="e.g. Diwali / Republic Day / Independence Day"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Event Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Region</label>
                  <Input
                    type="text"
                    placeholder="e.g. India / Maharashtra / Gujarat / International"
                    value={formData.targetRegion}
                    onChange={(e) => setFormData({ ...formData, targetRegion: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief details or background context about this festival event..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Step 2: Banner Image Upload Dropzone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Festival Cover Banner Image (Optional)
                </h3>
              </div>

              {!bannerPreview ? (
                <label className="border-2 border-dashed border-[#2C384E] hover:border-amber-500/60 bg-[#0B0F17]/60 hover:bg-[#0B0F17] p-8 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition group text-center">
                  <div className="p-4 rounded-3xl bg-slate-800/60 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition shadow-inner">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-amber-400 group-hover:underline">
                      Click to upload festival banner image
                    </span>
                    <span className="text-sm text-slate-400"> or drag and drop</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Supported formats: PNG, JPG, WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 rounded-2xl bg-[#0B0F17] border border-emerald-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Banner Image Selected</span>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Ready
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Image loaded and displaying in the side preview panel.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="px-3 py-1.5 rounded-xl bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-400 text-xs font-semibold cursor-pointer transition">
                      <span>Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setBase64Banner("");
                        setBannerPreview("");
                        setFormData({ ...formData, bannerUrl: "" });
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition"
                      title="Remove Banner"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Or Direct Banner Image URL
                </label>
                <input
                  type="text"
                  placeholder="Paste direct URL e.g. https://res.cloudinary.com/..."
                  value={formData.bannerUrl || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, bannerUrl: e.target.value });
                    if (e.target.value) setBannerPreview(e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Step 3: Status & Visibility */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2C384E] pb-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="font-heading font-bold text-base text-white">
                  Active Status & Visibility
                </h3>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
                <div>
                  <h4 className="text-sm font-bold text-white">Visible in Content Calendar & Studio</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When enabled, businesses can view templates and schedule posts for this festival.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
                />
              </div>
            </div>

            {/* Form Footer */}
            <div className="pt-4 border-t border-[#2C384E] flex items-center justify-end gap-3">
              <Button variant="ghost" type="button" onClick={onBack} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                icon={Sparkles}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-glow text-sm"
              >
                {editingFestival ? "Update Festival" : "Create Festival"}
              </Button>
            </div>
          </Card>
        </form>

        {/* Right Column: Clean Festival Banner Image Preview Card */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          <Card className="p-6 space-y-4 bg-[#131B2A]/90 border-[#2C384E] rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
              <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Banner Image Preview</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                Festival Cover
              </span>
            </div>

            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#2C384E] bg-[#0B0F17] shadow-2xl flex items-center justify-center">
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Selected Festival Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 right-3 text-[11px] font-extrabold bg-black/80 text-white px-3 py-1 rounded-xl backdrop-blur-md border border-white/10">
                    HD Banner
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center gap-3 text-slate-500">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <ImageIcon className="w-10 h-10 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400">No Banner Uploaded Yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Choose a cover image from Step 2 to preview it here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
