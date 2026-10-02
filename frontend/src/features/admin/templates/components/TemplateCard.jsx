import React from 'react';
import { Trash2, Eye, Loader2 } from 'lucide-react';

/**
 * TemplateCard
 * Individual template card displaying base graphic preview, title, category, and action buttons.
 */
export const TemplateCard = ({ template, onDelete, onPreview, isDeleting = false }) => {
  const imageUrl = template.baseImageUrl || template.mediaUrl || template.thumbnailUrl || template.imageUrl;
  const title = template.title || template.name || 'Untitled Template';

  return (
    <div className="overflow-hidden bg-[#131B2A] border border-[#2C384E] hover:border-amber-500/50 transition-all duration-200 group flex flex-col rounded-2xl relative shadow-md hover:shadow-xl">
      <div className="aspect-square relative bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onPreview && onPreview(template)}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No Image
          </div>
        )}

        {/* Delete Icon placed at the Top Right Corner of the Template */}
        {onDelete && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template);
            }}
            className="absolute top-2 right-2 z-10 p-2 rounded-xl bg-slate-950/70 hover:bg-rose-600 text-rose-400 hover:text-white border border-slate-700/60 hover:border-rose-500 backdrop-blur-md transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Delete Template"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Hover Eye Preview Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div
            className="p-2.5 rounded-xl bg-white/20 text-white backdrop-blur-md shadow-lg"
            title="Preview Template"
          >
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 space-y-1">
        <h4 className="text-xs font-bold text-white truncate" title={title}>
          {title}
        </h4>
        {template.description && (
          <p className="text-[11px] text-slate-400 line-clamp-1">
            {template.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
