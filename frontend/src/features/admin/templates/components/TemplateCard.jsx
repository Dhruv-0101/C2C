import React from 'react';
import { Trash2, ExternalLink, Eye, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/**
 * TemplateCard
 * Individual template card displaying base graphic preview, title, category, and action buttons.
 */
export const TemplateCard = ({ template, onDelete, onPreview, isDeleting = false }) => {
  const imageUrl = template.baseImageUrl || template.mediaUrl || template.thumbnailUrl || template.imageUrl;
  const title = template.title || template.name || 'Untitled Template';
  const categoryName = template.templateCategory?.name || template.category || 'General';

  return (
    <Card className="overflow-hidden bg-[#131B2A] border-[#2C384E] hover:border-amber-500/50 transition duration-200 group flex flex-col rounded-2xl">
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

        <div className="absolute top-2 right-2">
          <Badge variant="primary" size="sm" className="bg-amber-500/90 text-slate-950 font-bold backdrop-blur-sm border-0">
            {categoryName}
          </Badge>
        </div>

        {template.festival && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              🪔 {template.festival.name || 'Festival'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreview) onPreview(template);
            }}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition shadow-lg"
            title="Preview Template"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-white truncate" title={title}>
            {title}
          </h4>
          {template.description && (
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {template.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#2C384E] text-xs">
          <button
            type="button"
            onClick={() => onPreview && onPreview(template)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Preview</span>
          </button>

          {onDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(template)}
              className="text-[11px] text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition disabled:opacity-40"
              title="Delete Template"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TemplateCard;
