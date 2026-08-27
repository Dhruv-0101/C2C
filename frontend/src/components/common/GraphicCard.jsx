import React from "react";
import { Maximize2, Download, Edit, Trash2, Calendar } from "lucide-react";
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
 * @param {Function} [props.onPreview] - Callback triggered when clicking card image for full screen lightbox.
 * @param {Function} [props.onDownload] - Callback triggered when clicking download button.
 * @param {Function} [props.onEdit] - Callback triggered when clicking edit button.
 * @param {Function} [props.onDelete] - Callback triggered when clicking delete button.
 * @param {boolean} [props.isDeleting=false] - Whether delete mutation is currently loading.
 */
export const GraphicCard = ({
  imageUrl,
  title,
  category,
  date,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <Card className="p-3 bg-[#0B0F17] border-[#2C384E] hover:border-amber-500/50 transition group space-y-3 flex flex-col justify-between">
      {/* Aspect Ratio Image Container */}
      <div
        onClick={onPreview}
        className="aspect-square rounded-xl bg-[#131B2A] overflow-hidden relative border border-[#2C384E] cursor-pointer group/img"
        title="Click for Full Screen View"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300 bg-[#0B0F17]"
        />

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

      {/* Info & Action Buttons */}
      <div className="space-y-2 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div className="truncate">
            <h4 className="font-heading font-bold text-xs text-white truncate">
              {title || "Social Graphic"}
            </h4>
            {date && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-amber-400" />
                {date}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        {(onDownload || onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#2C384E]">
            {onDownload && (
              <Button
                variant="outline"
                onClick={() => onDownload(imageUrl, title)}
                className="flex-1 justify-center py-1.5 text-xs text-amber-400 border-[#2C384E] hover:bg-amber-500/10"
                title="Download HD PNG"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> HD
              </Button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-lg bg-[#131B2A] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#2C384E] transition"
                title="Edit Details"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
