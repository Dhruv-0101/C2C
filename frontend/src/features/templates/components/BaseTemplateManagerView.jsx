import React from "react";
import { createPortal } from "react-dom";
import { FileCode2, Plus, Upload, ImageIcon, X } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import Pagination from "../../../components/common/Pagination";
import { SearchBar } from "../../../components/common/SearchBar";
import { GraphicCard } from "../../../components/common/GraphicCard";
import { ImageLightbox } from "../../../components/common/ImageLightbox";

/**
 * BaseTemplateManagerView
 * Pure Presentational Component rendering templates search, grid items, upload form modal, and lightbox view.
 */
export const BaseTemplateManagerView = ({
  modalProps,
  isModalOpen,
  setIsModalOpen,
  fullscreenTemplate,
  setFullscreenTemplate,
  errorMsg,
  formData,
  setFormData,
  setPage,
  setLimit,
  search,
  setSearch,
  selectedFestival,
  setSelectedFestival,
  templates,
  templateMeta,
  isLoadingTemplates,
  festivals,
  handleFileChange,
  createTemplateMutation,
  deleteTemplateMutation,
  handleFormSubmit,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white">
              Master Graphic Base Templates Manager
            </h2>
            <p className="text-xs text-slate-400">
              Upload clean 1080x1080 graphic backgrounds that end-users composite with Canva-style transparent vector frames.
            </p>
          </div>
        </div>

        <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
          Upload Base Graphic
        </Button>
      </div>

      {/* Filter and Template Grid Card */}
      <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
          <SearchBar
            placeholder="Search base templates by title..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            className="max-w-md"
          />

          <div className="flex items-center gap-2">
            <label htmlFor="festival-filter" className="text-xs font-medium text-slate-400 whitespace-nowrap">
              Filter Festival:
            </label>
            <select
              id="festival-filter"
              value={selectedFestival}
              onChange={(e) => {
                setSelectedFestival(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">All Templates</option>
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoadingTemplates ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading base templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">No base graphic templates found.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or click the button above to upload a new base template.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((tpl) => (
                <GraphicCard
                  key={tpl.id}
                  imageUrl={tpl.baseImageUrl}
                  title={tpl.title}
                  category={tpl.festival?.name}
                  onPreview={() => setFullscreenTemplate(tpl)}
                  onDelete={() => deleteTemplateMutation.mutate(tpl.id)}
                  isDeleting={deleteTemplateMutation.isPending}
                />
              ))}
            </div>

            <Pagination
              meta={templateMeta}
              onPageChange={(newPage) => setPage(newPage)}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[4, 8, 12, 24]}
            />
          </div>
        )}
      </Card>

      {/* Upload Base Template Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="w-full max-w-md bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Upload Base Graphic Template</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && <Alert variant="error" message={errorMsg} />}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="Template Title"
                  placeholder="e.g. Modern Real Estate Promo Background"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Associate with Festival (Optional)</label>
                  <select
                    value={formData.festivalId}
                    onChange={(e) => setFormData({ ...formData, festivalId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">General Brand Background (No Festival)</option>
                    {festivals.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({new Date(f.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Background Image (1080×1080 PNG/JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                </div>

                {formData.baseImageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-[#2C384E]">
                    <img src={formData.baseImageUrl} alt="Template Preview" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[#2C384E]">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={createTemplateMutation.isPending}
                  >
                    Upload & Save
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      <FeedbackModal {...modalProps} />

      {/* Reusable High-Res Lightbox Modal */}
      <ImageLightbox
        isOpen={Boolean(fullscreenTemplate)}
        item={fullscreenTemplate}
        onClose={() => setFullscreenTemplate(null)}
      />
    </div>
  );
};
