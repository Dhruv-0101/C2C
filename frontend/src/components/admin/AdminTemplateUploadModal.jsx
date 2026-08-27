import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  FolderKanban,
  Calendar,
  Plus,
} from "lucide-react";
import { templateApi } from "../../services/template.api";
import { festivalApi } from "../../services/festival.api";
import { readImageAsBase64 } from "../../utils/file.utils";
import { logger } from "../../utils/logger.util";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";

export const AdminTemplateUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General Business");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [festivalId, setFestivalId] = useState("");
  const [festivals, setFestivals] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Category Pagination (5 per page) & Search State inside Modal
  const [modalCatSearch, setModalCatSearch] = useState("");
  const [modalCatPage, setModalCatPage] = useState(1);
  const MODAL_CAT_PER_PAGE = 5;

  const filteredCategories = categoriesList.filter((cat) =>
    cat.name.toLowerCase().includes(modalCatSearch.toLowerCase())
  );
  const modalCatTotalPages = Math.ceil(filteredCategories.length / MODAL_CAT_PER_PAGE) || 1;
  const paginatedCategories = filteredCategories.slice(
    (modalCatPage - 1) * MODAL_CAT_PER_PAGE,
    modalCatPage * MODAL_CAT_PER_PAGE
  );

  // Festival Pagination (5 per page) & Search State inside Modal
  const [modalFestSearch, setModalFestSearch] = useState("");
  const [modalFestPage, setModalFestPage] = useState(1);
  const MODAL_FEST_PER_PAGE = 5;

  const filteredFestivals = festivals.filter((f) =>
    f.name.toLowerCase().includes(modalFestSearch.toLowerCase())
  );
  const modalFestTotalPages = Math.ceil(filteredFestivals.length / MODAL_FEST_PER_PAGE) || 1;
  const paginatedFestivals = filteredFestivals.slice(
    (modalFestPage - 1) * MODAL_FEST_PER_PAGE,
    modalFestPage * MODAL_FEST_PER_PAGE
  );

  useEffect(() => {
    if (isOpen) {
      fetchFestivalsAndCategories();
      resetForm();
    }
  }, [isOpen]);

  const fetchFestivalsAndCategories = async () => {
    try {
      const [festRes, catRes] = await Promise.all([
        festivalApi.getFestivals(),
        templateApi.getTemplateCategories(),
      ]);

      if (festRes.data?.festivals) {
        setFestivals(festRes.data.festivals);
      }
      if (catRes.data?.categories) {
        setCategoriesList(catRes.data.categories);
      }
    } catch (err) {
      logger.error("Failed to load festivals & categories list", err);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setBase64Image(null);
    setTitle("");
    setDescription("");
    setCategory("General Business");
    setCustomCategoryInput("");
    setFestivalId("");
    setError("");
    setSuccessMessage("");
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setError("");
      const base64 = await readImageAsBase64(selectedFile, 5);
      setPreviewUrl(base64);
      setBase64Image(base64);
    } catch (err) {
      setError(err.message || "Failed to read template image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) {
      setError("Please select an image file to upload.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title for this template.");
      return;
    }

    if (category === "NEW" && !customCategoryInput.trim()) {
      setError("Please type a name for your custom category.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category === "NEW" ? customCategoryInput.trim() : category,
        newCategoryName: category === "NEW" ? customCategoryInput.trim() : undefined,
        festivalId: festivalId || undefined,
        baseImageUrl: base64Image,
      };

      await templateApi.createTemplate(payload);

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TEMPLATES.CATEGORIES });

      setSuccessMessage("Template uploaded & published successfully! 🎉");
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      logger.error("Template Upload Error", err);
      setError(err.response?.data?.message || err.message || "Failed to upload template.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#131B2A]/95 border border-[#2C384E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] my-auto text-slate-100 relative overflow-hidden">
        {/* Subtle Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-glow">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                <span>Upload Admin Master Template</span>
                <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                  1080×1080 HD
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Publish a master graphic background blueprint to Cloudinary and tag its category & festival.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <Alert variant="error" message={error} />}
        {successMessage && <Alert variant="success" message={successMessage} />}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Section 1: Template Title & Description */}
          <div className="space-y-4">
            <Input
              label="Template Title"
              placeholder="e.g. Modern Real Estate Promo Background"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Short description of the template background layout..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Section 2: Modal Category Selector (5 per page + Search + Highlighted New Creation) */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#0B0F17]/80 border border-[#2C384E]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Template Category (5 per page)
                </label>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Page {modalCatPage} of {modalCatTotalPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={modalCatSearch}
                    onChange={(e) => {
                      setModalCatSearch(e.target.value);
                      setModalCatPage(1);
                    }}
                    className="pl-8 pr-2 py-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-36"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={modalCatPage <= 1}
                    onClick={() => setModalCatPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={modalCatPage >= modalCatTotalPages}
                    onClick={() => setModalCatPage((p) => Math.min(modalCatTotalPages, p + 1))}
                    className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Cards / Badges Grid (5 per page) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {/* PROMINENTLY HIGHLIGHTED NEW CATEGORY BUTTON */}
              <button
                type="button"
                onClick={() => setCategory("NEW")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border hover:scale-[1.02] active:scale-[0.98] ${
                  category === "NEW"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-glow font-extrabold scale-105"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/30"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>+ Create New Category</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">NEW</span>
              </button>

              {paginatedCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
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

          {/* Custom Category Input (Shown when 'NEW' is selected) */}
          {category === "NEW" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 border border-amber-500/40 space-y-2 animate-in fade-in shadow-glow">
              <label className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Enter New Custom Category Name</span>
              </label>
              <Input
                placeholder="e.g. Real Estate Deals, Gym & Fitness..."
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                required
                className="bg-[#0B0F17] border-amber-500/50 focus:border-amber-400 text-amber-100 placeholder:text-amber-300/40 font-semibold"
              />
            </div>
          )}

          {/* Section 3: Modal Festival Selector (5 per page + Search) */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#0B0F17]/80 border border-[#2C384E]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Associate Festival (5 per page)
                </label>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                  Page {modalFestPage} of {modalFestTotalPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search festival..."
                    value={modalFestSearch}
                    onChange={(e) => {
                      setModalFestSearch(e.target.value);
                      setModalFestPage(1);
                    }}
                    className="pl-8 pr-2 py-1 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-36"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={modalFestPage <= 1}
                    onClick={() => setModalFestPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={modalFestPage >= modalFestTotalPages}
                    onClick={() => setModalFestPage((p) => Math.min(modalFestTotalPages, p + 1))}
                    className="p-1 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Festival Cards / Badges Grid (5 per page) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <button
                type="button"
                onClick={() => setFestivalId("")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] ${
                  !festivalId
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-glow"
                    : "bg-[#131B2A] text-slate-300 border border-[#2C384E] hover:border-slate-400"
                }`}
              >
                <span>🎉 No Specific Festival</span>
              </button>

              {paginatedFestivals.map((f) => {
                const isSelected = festivalId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFestivalId(f.id)}
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

          {/* Section 4: Image Dropzone & Live Preview */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Background Graphic Image (1080×1080 PNG/JPG)
            </label>

            {!previewUrl ? (
              <label className="border-2 border-dashed border-[#2C384E] hover:border-amber-500/60 bg-[#0B0F17]/60 hover:bg-[#0B0F17] p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition group text-center">
                <div className="p-3 rounded-2xl bg-slate-800/60 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 transition">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 group-hover:underline">
                    Click to select image file
                  </span>
                  <span className="text-xs text-slate-400"> or drag and drop</span>
                </div>
                <span className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-[#2C384E] group bg-[#0B0F17]">
                <img src={previewUrl} alt="Template Preview" className="w-full h-52 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setBase64Image(null);
                    }}
                    className="p-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-500 font-bold transition flex items-center gap-1.5 text-xs shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove Image</span>
                  </button>
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-md backdrop-blur-md">
                  1080×1080 Ready
                </span>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#2C384E]">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isUploading}
              icon={Sparkles}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-glow"
            >
              Upload & Publish Template
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
