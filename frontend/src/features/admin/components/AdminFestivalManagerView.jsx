import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Globe,
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";
import { useFestivals } from "../../../hooks/useFestivals";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import { FestivalCalendarContainer } from "../../calendar/containers/FestivalCalendarContainer";
import { readImageAsBase64 } from "../../../utils/file.utils";
import { FestivalCreateView } from "./FestivalCreateView";

/**
 * AdminFestivalManagerView
 * Dedicated Admin Component to Add, Edit, Delete, Search, and Manage system festivals & special days.
 */
export const AdminFestivalManagerView = () => {
  const {
    festivals = [],
    isLoading,
    createFestival,
    isCreating,
    updateFestival,
    isUpdating,
    deleteFestival,
    isDeleting,
  } = useFestivals();

  // Mode View: "list" (Table Management) vs "calendar" (Monthly Grid) vs "form" (Create/Edit Page)
  const [displayMode, setDisplayMode] = useState("list");

  // Search & Pagination State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Modals & Feedback State
  const [editingFestival, setEditingFestival] = useState(null); // null = Create, object = Edit
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [feedback, setFeedback] = useState({ isOpen: false, type: "success", title: "", message: "" });
  const [formError, setFormError] = useState("");

  // Form Fields & Banner File Upload State
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    targetRegion: "India",
    bannerUrl: "",
    isActive: true,
  });
  const [base64Banner, setBase64Banner] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // Handle Banner Image File Selection
  const handleBannerFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await readImageAsBase64(file, 5);
      setBase64Banner(base64);
      setBannerPreview(base64);
    } catch (err) {
      setFormError(err.message || "Failed to process image file.");
    }
  };

  // Open Create Page View (accepts optional dateStr from calendar cell click)
  const handleOpenCreate = (dateStr) => {
    setEditingFestival(null);
    const initialDate = typeof dateStr === "string" && dateStr.trim()
      ? dateStr.trim()
      : new Date().toISOString().split("T")[0];

    setFormData({
      name: "",
      date: initialDate,
      description: "",
      targetRegion: "India",
      bannerUrl: "",
      isActive: true,
    });
    setBase64Banner("");
    setBannerPreview("");
    setFormError("");
    setDisplayMode("form");
  };

  // Open Edit Page View
  const handleOpenEdit = (fest) => {
    setEditingFestival(fest);
    const dateFormatted = fest.date
      ? new Date(fest.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    setFormData({
      name: fest.name || "",
      date: dateFormatted,
      description: fest.description || "",
      targetRegion: fest.targetRegion || "India",
      bannerUrl: fest.bannerUrl || "",
      isActive: fest.isActive !== undefined ? fest.isActive : true,
    });
    setBase64Banner("");
    setBannerPreview(fest.bannerUrl || "");
    setFormError("");
    setDisplayMode("form");
  };

  // Save (Create or Update) Handler
  const handleSaveSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Festival name is required.");
      return;
    }
    if (!formData.date) {
      setFormError("Festival date is required.");
      return;
    }

    try {
      const festivalPayload = {
        name: formData.name.trim(),
        date: formData.date,
        description: formData.description?.trim() || "",
        targetRegion: formData.targetRegion?.trim() || "India",
        bannerUrl: formData.bannerUrl?.trim() || undefined,
        base64Banner: base64Banner || undefined,
        isActive: formData.isActive,
      };

      if (editingFestival) {
        await updateFestival({
          id: editingFestival.id,
          data: festivalPayload,
        });
        setFeedback({
          isOpen: true,
          type: "success",
          title: "Festival Updated!",
          message: `"${formData.name}" details and banner updated successfully.`,
        });
      } else {
        await createFestival(festivalPayload);
        setFeedback({
          isOpen: true,
          type: "success",
          title: "Festival Created!",
          message: `"${formData.name}" added to system calendar.`,
        });
      }
      setDisplayMode("list");
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Operation failed.");
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteFestival(deleteConfirmId);
      setDeleteConfirmId(null);
      setFeedback({
        isOpen: true,
        type: "success",
        title: "Festival Deleted",
        message: "The festival has been removed from the calendar.",
      });
    } catch (err) {
      setFeedback({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        message: err.response?.data?.message || "Failed to delete festival.",
      });
    }
  };

  // Filtered & Paginated List
  const filteredFestivals = festivals.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.targetRegion && f.targetRegion.toLowerCase().includes(search.toLowerCase()))
  );

  const totalFiltered = filteredFestivals.length;
  const totalPages = Math.ceil(totalFiltered / limit) || 1;
  const paginatedFestivals = filteredFestivals.slice((page - 1) * limit, page * limit);

  if (displayMode === "form") {
    return (
      <FestivalCreateView
        onBack={() => setDisplayMode("list")}
        formData={formData}
        setFormData={setFormData}
        editingFestival={editingFestival}
        handleSaveSubmit={handleSaveSubmit}
        handleBannerFileChange={handleBannerFileChange}
        base64Banner={base64Banner}
        setBase64Banner={setBase64Banner}
        bannerPreview={bannerPreview}
        setBannerPreview={setBannerPreview}
        isSubmitting={isCreating || isUpdating}
        formError={formError}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
              <span>Festival & Special Days Management</span>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                {festivals.length} Events
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Add, update, or remove annual Indian national festivals & international days across the platform.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Display Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
            <button
              onClick={() => setDisplayMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                displayMode === "list"
                  ? "bg-amber-500 text-slate-950 shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Manage List</span>
            </button>
            <button
              onClick={() => setDisplayMode("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                displayMode === "calendar"
                  ? "bg-amber-500 text-slate-950 shadow-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendar Grid</span>
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={() => handleOpenCreate()}>
            <span>Add Festival</span>
          </Button>
        </div>
      </div>

      {/* Render Mode 1: Calendar Grid View */}
      {displayMode === "calendar" ? (
        <FestivalCalendarContainer isAdmin={true} onAddFestival={handleOpenCreate} />
      ) : (
        /* Render Mode 2: Table / Card Management List */
        <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
          {/* Search Bar & Action Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search festival by name or region..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing {paginatedFestivals.length} of {totalFiltered} festivals
            </div>
          </div>

          {/* Festival Data Table / Cards */}
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 text-xs">Loading festivals...</div>
          ) : paginatedFestivals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-2xl">
              No matching festivals found. Click "Add Festival" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginatedFestivals.map((fest) => {
                const festDate = fest.date ? new Date(fest.date) : null;
                const formattedDate = festDate
                  ? festDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A";

                return (
                  <div
                    key={fest.id}
                    className="group relative rounded-2xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/50 transition shadow-lg overflow-hidden flex flex-col justify-between"
                  >
                    {/* Festival Cover Banner Image if present */}
                    {fest.bannerUrl ? (
                      <div className="relative h-28 w-full overflow-hidden bg-slate-900 border-b border-[#2C384E]">
                        <img
                          src={fest.bannerUrl}
                          alt={fest.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
                      </div>
                    ) : null}

                    <div className="p-4 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-heading font-bold text-sm text-white truncate max-w-[160px]">
                              {fest.name}
                            </h3>
                            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              fest.isActive !== false
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {fest.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {fest.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {fest.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#2C384E]/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>{fest.targetRegion || "India"}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(fest)}
                            className="p-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition cursor-pointer"
                            title="Edit Festival"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(fest.id)}
                            className="p-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-red-400 hover:border-red-500/50 transition cursor-pointer"
                            title="Delete Festival"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Central Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-[#2C384E]">
              <Pagination
                meta={{ page, totalPages, totalCount: totalFiltered }}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
                pageSizeOptions={[8, 16, 24]}
              />
            </div>
          )}
        </Card>
      )}



      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl bg-[#131B2A] border border-[#2C384E] p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  Delete Festival?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to delete this festival? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-600 hover:bg-red-500 text-white"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* FEEDBACK TOAST MODAL */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        onClose={() => setFeedback({ ...feedback, isOpen: false })}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
      />
    </div>
  );
};
