import React from "react";
import { Maximize2, Download, Edit, Trash2, Calendar, Check, User } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

/**
 * GraphicCard
 * Reusable presentational card component for rendering 1:1 ratio graphics with hover zoom overlay and action bars.
 *
 * @param {Object} props
 * @param {string} props.imageUrl - Image URL to render inside the card.
 * @param {string} props.title - Title or occasion name of the graphic.
 * @param {string} [props.category] - Category tag badge.
 * @param {string} [props.date] - Formatted creation or event date.
 * @param {Object} [props.creator] - Creator user object ({ fullName, email, role }).
 * @param {Function} [props.onPreview] - Callback triggered when clicking card image for full screen lightbox.
 * @param {Function} [props.onDownload] - Callback triggered when clicking download button.
 * @param {Function} [props.onEdit] - Callback triggered when clicking edit button.
 * @param {Function} [props.onReuse] - Callback triggered when clicking Re-use & Edit button.
 * @param {Function} [props.onDelete] - Callback triggered when clicking delete button.
 * @param {boolean} [props.isDeleting=false] - Whether delete mutation is currently loading.
 */
export const GraphicCard = ({
  imageUrl,
  title,
  category,
  date,
  creator,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  isSelected = false,
  onToggleSelect,
  isDeleting = false,
}) => {
  return (
    <Card className={`p-3 bg-[#0B0F17] border-[#2C384E] transition group space-y-3 flex flex-col justify-between relative ${
      isSelected ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/5" : "hover:border-amber-500/50"
    }`}>
      {/* Aspect Ratio Image Container */}
      <div
        onClick={onPreview}
        className="aspect-square rounded-xl bg-[#131B2A] overflow-hidden relative border border-[#2C384E] cursor-pointer group/img"
        title="Click for Full Screen View"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 bg-[#0B0F17]"
        />

        {/* Selection Checkbox Badge */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-lg flex items-center justify-center transition border shadow-md cursor-pointer ${
              isSelected
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold scale-110"
                : "bg-slate-950/75 text-slate-400 border-slate-700 hover:border-amber-400 hover:text-white backdrop-blur-xs"
            }`}
            title={isSelected ? "Deselect item" : "Select item for bulk delete"}
          >
            <Check className={`w-3.5 h-3.5 ${isSelected ? "stroke-[3]" : "opacity-40"}`} />
          </button>
        )}

        {/* Hover Zoom Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transform scale-90 group-hover/img:scale-100 transition-transform">
            <Maximize2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-700">
            Full Screen View
          </span>
        </div>

        {category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase shadow z-10">
            {category}
          </span>
        )}
      </div>

      {/* Info & Action Controls Footer */}
      <div className="pt-1">
        <div className="flex items-center justify-between gap-2">
          {/* Title & Metadata (Left) */}
          <div className="min-w-0 flex-1">
            <h4
              className="font-heading font-bold text-xs text-white truncate"
              title={title || "Social Graphic"}
            >
              {title || "Social Graphic"}
            </h4>
            {date && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{date}</span>
              </p>
            )}
            {creator && (
              <div className="pt-0.5 flex items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border ${
                    creator.role === "SUB_ADMIN"
                      ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                  title={`Author: ${creator.fullName} (${creator.email})`}
                >
                  <User className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate max-w-[100px]">
                    {creator.role === "SUB_ADMIN" ? "SubAdmin: " : "Admin: "}
                    {creator.fullName}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons (Right) */}
          {(onDownload || onEdit || onDelete) && (
            <div className="flex items-center gap-1.5 shrink-0">
              {onDownload && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(imageUrl, title);
                  }}
                  className="p-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition cursor-pointer"
                  title="Download HD PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white hover:border-slate-500 transition cursor-pointer"
                  title="Edit Details"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-600 transition cursor-pointer disabled:opacity-50"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
