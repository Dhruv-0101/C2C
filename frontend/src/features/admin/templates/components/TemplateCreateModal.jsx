import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload,
  FolderTree,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  ImageIcon,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';

/**
 * TemplateCreateModal
 * Enterprise Modal Component for uploading and configuring Admin Graphic Base Templates.
 */
export const TemplateCreateModal = ({
  isOpen = true,
  onClose,
  formData = {},
  setFormData,
  handleFileChange,
  handleFormSubmit,
  errorMsg = '',
  categoriesList = [],
  categoryMeta = null,
  catSearch = '',
  setCatSearch,
  catPage = 1,
  setCatPage,
  isLoadingCategories = false,
  festivals = [],
  festivalMeta = null,
  festSearch = '',
  setFestSearch,
  festPage = 1,
  setFestPage,
  isLoadingFestivals = false,
  isUploading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose && !isUploading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isUploading]);

  if (!isOpen) return null;

  const catTotalPages = categoryMeta?.totalPages || 1;
  const festTotalPages = festivalMeta?.totalPages || 1;

  const selectedCategoryObj =
    formData.selectedCategoryObj ||
    (categoriesList || []).find(
      (c) =>
        (formData.templateCategoryId && c.id === formData.templateCategoryId) ||
        c.name === formData.category
    );

  const selectedFestivalObj =
    formData.selectedFestivalObj ||
    (festivals || []).find((f) => f.id === formData.festivalId);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose && !isUploading) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#131B2A] border border-[#2C384E] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100 my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2C384E] bg-[#0B0F17]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
                  Upload Base Graphic Template
                </h2>
                <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                  1080×1080 HD
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Create master graphic backgrounds used by tenant businesses to composite brand frames.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition border border-transparent hover:border-[#2C384E] disabled:opacity-40"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {errorMsg && <Alert variant="error" message={errorMsg} />}

          <form onSubmit={handleFormSubmit} id="templateCreateForm" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Step 1: Basic Metadata */}
                <Card className="p-5 space-y-4 bg-[#0B0F17]/60 border-[#2C384E] rounded-2xl">
                  <div className="flex items-center gap-2 border-b border-[#2C384E] pb-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Template Information
                    </h3>
                  </div>

                  <Input
                    label="Template Title"
                    placeholder="e.g. Modern Real Estate Grand Opening Promo Background"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe target usage, design intent, or business niche..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </Card>

                {/* Step 2: Template Category Selector */}
                <Card className="p-5 space-y-3 bg-[#0B0F17]/60 border-[#2C384E] rounded-2xl">
                  <div className="flex items-center gap-2 border-b border-[#2C384E] pb-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Assign Template Category
                    </h3>
                  </div>

                  {/* Active Selection Banner */}
                  {selectedCategoryObj && formData.category !== 'NEW' && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-400" />
                        <span>
                          Selected: <strong className="text-white">{selectedCategoryObj.icon || '🎨'} {selectedCategoryObj.name}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, category: '', templateCategoryId: '', selectedCategoryObj: null })}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {formData.category === 'NEW' && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>
                          Custom Category: <strong className="text-white">{formData.newCategoryName || '(Enter below)'}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, category: '', templateCategoryId: '', selectedCategoryObj: null, newCategoryName: '' })}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline"
                      >
                        Reset
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Categories (8 / page)
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                        {catPage} / {catTotalPages}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={catSearch}
                          onChange={(e) => {
                            if (setCatSearch) setCatSearch(e.target.value);
                            if (setCatPage) setCatPage(1);
                          }}
                          className="pl-7 pr-2.5 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-36"
                        />
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={catPage <= 1}
                          onClick={() => setCatPage && setCatPage((p) => Math.max(1, p - 1))}
                          className="p-1 rounded-md bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={catPage >= catTotalPages}
                          onClick={() => setCatPage && setCatPage((p) => Math.min(catTotalPages, p + 1))}
                          className="p-1 rounded-md bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-2 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category: 'NEW', templateCategoryId: '', selectedCategoryObj: null })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border ${
                        formData.category === 'NEW'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-glow font-extrabold'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>+ New Category</span>
                    </button>

                    {isLoadingCategories && (
                      <span className="text-xs text-slate-400 animate-pulse px-2">Searching...</span>
                    )}

                    {categoriesList.map((cat) => {
                      const isSelected =
                        (formData.templateCategoryId && formData.templateCategoryId === cat.id) ||
                        formData.category === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              category: cat.name,
                              templateCategoryId: cat.id,
                              selectedCategoryObj: cat,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-glow'
                              : 'bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400'
                          }`}
                        >
                          <span>{cat.icon || '🎨'}</span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {formData.category === 'NEW' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 animate-in fade-in">
                      <label className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1 uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>New Category Name</span>
                      </label>
                      <Input
                        placeholder="e.g. Festival Wishes, Hiring Promo, Sale..."
                        value={formData.newCategoryName || ''}
                        onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                        required
                        className="bg-[#131B2A] border-amber-500/50 text-xs"
                      />
                    </div>
                  )}
                </Card>

                {/* Step 3: Festival Selector */}
                <Card className="p-5 space-y-3 bg-[#0B0F17]/60 border-[#2C384E] rounded-2xl">
                  <div className="flex items-center gap-2 border-b border-[#2C384E] pb-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Festival Event (Optional)
                    </h3>
                  </div>

                  {selectedFestivalObj && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>
                          Selected: <strong className="text-white">{selectedFestivalObj.name}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, festivalId: '', selectedFestivalObj: null })}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Festivals (8 / page)
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                        {festPage} / {festTotalPages}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                        <input
                          type="text"
                          placeholder="Search festivals..."
                          value={festSearch}
                          onChange={(e) => {
                            if (setFestSearch) setFestSearch(e.target.value);
                            if (setFestPage) setFestPage(1);
                          }}
                          className="pl-7 pr-2.5 py-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-36"
                        />
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={festPage <= 1}
                          onClick={() => setFestPage && setFestPage((p) => Math.max(1, p - 1))}
                          className="p-1 rounded-md bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={festPage >= festTotalPages}
                          onClick={() => setFestPage && setFestPage((p) => Math.min(festTotalPages, p + 1))}
                          className="p-1 rounded-md bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Festival Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-2 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, festivalId: '', selectedFestivalObj: null })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                        !formData.festivalId
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow'
                          : 'bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400'
                      }`}
                    >
                      <span>🎉 None / General</span>
                    </button>

                    {isLoadingFestivals && (
                      <span className="text-xs text-slate-400 animate-pulse px-2">Searching...</span>
                    )}

                    {festivals.map((f) => {
                      const isSelected = formData.festivalId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              festivalId: f.id,
                              selectedFestivalObj: f,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow'
                              : 'bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400'
                          }`}
                        >
                          <span>🪔</span>
                          <span>{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Step 4: Graphic File Upload Dropzone */}
                <Card className="p-5 space-y-3 bg-[#0B0F17]/60 border-[#2C384E] rounded-2xl">
                  <div className="flex items-center gap-2 border-b border-[#2C384E] pb-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <h3 className="font-heading font-bold text-sm text-white">
                      Upload Graphic Background
                    </h3>
                  </div>

                  {!formData.baseImageUrl ? (
                    <label className="border-2 border-dashed border-[#2C384E] hover:border-amber-500/60 bg-[#131B2A]/50 hover:bg-[#131B2A] p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition group text-center">
                      <div className="p-3 rounded-2xl bg-slate-800/60 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-400 group-hover:underline">
                          Choose image file
                        </span>
                        <span className="text-xs text-slate-400"> or drag and drop</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        1080×1080 Square Graphic (PNG, JPG, WEBP - Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#131B2A] border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Image Selected</span>
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                              Ready
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            {formData.imageFile?.name || 'Graphic file ready to upload'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="px-2.5 py-1 rounded-lg bg-[#0B0F17] border border-[#2C384E] text-slate-300 hover:text-white text-[11px] font-semibold cursor-pointer transition">
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, baseImageUrl: null, imageFile: null })}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: Live 1:1 Image Preview Card (5 cols) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-0">
                <Card className="p-5 space-y-3 bg-[#0B0F17]/60 border-[#2C384E] rounded-2xl">
                  <div className="flex items-center justify-between border-b border-[#2C384E] pb-2.5">
                    <h3 className="font-heading font-extrabold text-xs text-white flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Graphic Preview</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      1:1 Aspect Ratio
                    </span>
                  </div>

                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#2C384E] bg-[#131B2A] flex items-center justify-center shadow-inner">
                    {formData.baseImageUrl ? (
                      <>
                        <img
                          src={formData.baseImageUrl}
                          alt="Graphic Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2.5 right-2.5 text-[10px] font-extrabold bg-black/80 text-white px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                          1080×1080 HD
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center gap-2 text-slate-500">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <ImageIcon className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-xs font-semibold text-slate-400">No Image Uploaded Yet</p>
                        <p className="text-[10px] text-slate-500">
                          Selected image will render live in this panel.
                        </p>
                      </div>
                    )}
                  </div>

                  {formData.title && (
                    <div className="p-2.5 rounded-xl bg-[#131B2A] border border-[#2C384E] text-xs">
                      <div className="font-bold text-white truncate">{formData.title}</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">
                        {formData.category === 'NEW' ? formData.newCategoryName || 'Custom' : formData.category || 'General'}
                        {selectedFestivalObj ? ` • ${selectedFestivalObj.name}` : ''}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2C384E] bg-[#0B0F17]/80 shrink-0">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="templateCreateForm"
            isLoading={isUploading}
            icon={Sparkles}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-glow text-xs"
          >
            Publish Template
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export { TemplateCreateModal as TemplateCreateView };
export default TemplateCreateModal;
