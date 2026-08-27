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
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";
import { useFestivals } from "../../../hooks/useFestivals";
import { FeedbackModal } from "../../../components/common/FeedbackModal";
import { FestivalCalendarView } from "../../../components/admin/FestivalCalendarView";

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

  // Mode View: "list" (Table Management) vs "calendar" (Monthly Grid)
  const [displayMode, setDisplayMode] = useState("list");

  // Search & Pagination State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);

  // Modals & Feedback State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null); // null = Create, object = Edit
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [feedback, setFeedback] = useState({ isOpen: false, type: "success", title: "", message: "" });
  const [formError, setFormError] = useState("");

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    targetRegion: "India",
    bannerUrl: "",
    isActive: true,
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingFestival(null);
    setFormData({
      name: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      targetRegion: "India",
      bannerUrl: "",
      isActive: true,
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
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
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Save (Create or Update) Handler
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
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
      if (editingFestival) {
        await updateFestival(editingFestival.id, {
          name: formData.name.trim(),
          date: formData.date,
          description: formData.description?.trim() || "",
          targetRegion: formData.targetRegion?.trim() || "India",
          bannerUrl: formData.bannerUrl?.trim() || "",
          isActive: formData.isActive,
        });
        setFeedback({
          isOpen: true,
          type: "success",
          title: "Festival Updated!",
          message: `"${formData.name}" details updated successfully.`,
        });
      } else {
        await createFestival({
          name: formData.name.trim(),
          date: formData.date,
          description: formData.description?.trim() || "",
          targetRegion: formData.targetRegion?.trim() || "India",
          bannerUrl: formData.bannerUrl?.trim() || "",
          isActive: formData.isActive,
        });
        setFeedback({
          isOpen: true,
          type: "success",
          title: "Festival Created!",
          message: `"${formData.name}" added to system calendar.`,
        });
      }
      setIsFormModalOpen(false);
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

          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            <span>Add Festival</span>
          </Button>
        </div>
      </div>

      {/* Render Mode 1: Calendar Grid View */}
      {displayMode === "calendar" ? (
        <FestivalCalendarView isAdmin={true} />
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
                    className="group relative p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/50 transition shadow-lg space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-sm text-white truncate max-w-[140px]">
                              {fest.name}
                            </h3>
                            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </p>
                          </div>
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

      {/* CREATE / EDIT FESTIVAL FORM MODAL */}
      {isFormModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl bg-[#131B2A] border border-[#2C384E] p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
                <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>{editingFestival ? "Edit Festival Event" : "Add New Festival Event"}</span>
                </h3>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && <Alert variant="error" message={formError} />}

              <form onSubmit={handleSaveSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Festival Name <span className="text-amber-400">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Diwali / Republic Day"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Event Date <span className="text-amber-400">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Target Region</label>
                    <Input
                      type="text"
                      placeholder="e.g. India / International"
                      value={formData.targetRegion}
                      onChange={(e) => setFormData({ ...formData, targetRegion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief details or background about this special day..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                  <div>
                    <h4 className="text-xs font-bold text-white">Active Status</h4>
                    <p className="text-[11px] text-slate-400">Make visible in templates & post studio</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#2C384E]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsFormModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isCreating || isUpdating}
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editingFestival
                      ? "Update Festival"
                      : "Create Festival"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
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
