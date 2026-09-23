import React, { useState, useEffect } from "react";
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
  User,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";
import { SearchBar } from "../../../components/common/SearchBar";
import { useFestivals } from "../../../hooks/useFestivals";
import { useDebounce } from "../../../hooks/useDebounce";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import { FestivalCalendarContainer } from "../../calendar/containers/FestivalCalendarContainer";
import { createImagePreview } from "../../../utils/file.utils";
import { FestivalCreateView } from "./FestivalCreateView";

/**
 * AdminFestivalManagerView
 * Dedicated Admin Component to Add, Edit, Delete, Search, and Manage system festivals & special days.
 */
export const AdminFestivalManagerView = () => {
  // Search & Pagination State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const debouncedSearch = useDebounce(search, 300);

  // Reset page to 1 whenever debounced search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    festivals = [],
    meta,
    isLoading,
    isFetching,
    createFestival,
    isCreating,
    updateFestival,
    isUpdating,
    deleteFestival,
    isDeleting,
  } = useFestivals({
    page,
    limit,
    search: debouncedSearch || undefined,
    includeInactive: true,
  });

  // Mode View: "list" (Table Management) vs "calendar" (Monthly Grid) vs "form" (Create/Edit Page)
  const [displayMode, setDisplayMode] = useState("list");

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
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  // Handle Banner Image File Selection using zero-copy Object URL
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preview = createImagePreview(file, 10);
      setBannerFile(file);
      setBannerPreview(preview);
      setFormError("");
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
    setBannerFile(null);
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
    setBannerFile(null);
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
      let festivalPayload;

      // If user selected a new image file, send as standard multipart/form-data
      if (bannerFile) {
        const fd = new FormData();
        fd.append("name", formData.name.trim());
        fd.append("date", formData.date);
        if (formData.description?.trim()) fd.append("description", formData.description.trim());
        if (formData.targetRegion?.trim()) fd.append("targetRegion", formData.targetRegion.trim());
        fd.append("isActive", String(formData.isActive));
        fd.append("banner", bannerFile);
        festivalPayload = fd;
      } else {
        // Metadata update (preserves existing banner on backend unless clearBanner is set)
        festivalPayload = {
          name: formData.name.trim(),
          date: formData.date,
          description: formData.description?.trim() || "",
          targetRegion: formData.targetRegion?.trim() || "India",
          clearBanner: formData.clearBanner || undefined,
          isActive: formData.isActive,
        };
      }

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

  // Server-driven paginated list
  const paginatedFestivals = festivals;
  const totalFiltered = meta?.totalItems ?? festivals.length;
  const totalPages = meta?.totalPages ?? 1;

  if (displayMode === "form") {
    return (
      <FestivalCreateView
        onBack={() => setDisplayMode("list")}
        formData={formData}
        setFormData={setFormData}
        editingFestival={editingFestival}
        handleSaveSubmit={handleSaveSubmit}
        handleBannerFileChange={handleBannerFileChange}
        setBannerFile={setBannerFile}
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
                {meta?.totalItems ?? festivals.length} Events
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
            <SearchBar
              placeholder="Search festival by name, description, or region..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              className="w-full sm:max-w-md"
            />

            <div className="text-xs text-slate-400 font-mono">
              Showing {paginatedFestivals.length} of {totalFiltered} festivals
            </div>
          </div>

          {/* Festival Data Table / Cards */}
          {isLoading ? (
            <div className="p-16 text-center text-slate-400 text-xs">Loading festivals...</div>
          ) : paginatedFestivals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-2xl space-y-2">
              <p>
                {search
                  ? `No festivals found matching "${search}".`
                  : 'No festivals found. Click "Add Festival" to create one.'}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${isFetching ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
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
                        <div className="image-scrim-overlay absolute inset-0 pointer-events-none" />
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


                        <div className="pt-2 flex items-center gap-1.5">
                          {fest.creator ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                                fest.creator.role === "SUB_ADMIN"
                                  ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                              title={`Author: ${fest.creator.fullName} (${fest.creator.email})`}
                            >
                              <User className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[130px]">
                                {fest.creator.role === "SUB_ADMIN" ? "SubAdmin: " : "Admin: "}
                                {fest.creator.fullName}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-800/40 px-2 py-0.5 rounded-md border border-slate-700/40">
                              <User className="w-2.5 h-2.5" />
                              <span>System</span>
                            </span>
                          )}
                        </div>
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
          <div className="pt-4 border-t border-[#2C384E]">
            <Pagination
              meta={meta}
              currentPage={meta?.page || page}
              totalPages={meta?.totalPages || 1}
              onPageChange={(p) => setPage(p)}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              pageSizeOptions={[8, 12, 24, 48]}
            />
          </div>
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
