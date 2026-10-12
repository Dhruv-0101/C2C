import React from 'react';
import { Trash2, Eye, Loader2, Sparkles } from 'lucide-react';

/**
 * TemplateCard
 * Individual template card displaying base graphic preview, title, category, post count badge, and action buttons.
 */
export const TemplateCard = ({
  template,
  onDelete,
  onPreview,
  onViewPosts,
  isDeleting = false,
}) => {
  const imageUrl = template.baseImageUrl || template.mediaUrl || template.thumbnailUrl || template.imageUrl;
  const title = template.title || template.name || 'Untitled Template';
  const postCount = template._count?.posts ?? 0;

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

        {/* Posts Tracking Badge Button (Top Left) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewPosts && onViewPosts(template);
          }}
          className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/75 hover:bg-slate-900 border border-slate-700/60 hover:border-amber-400/50 backdrop-blur-md text-slate-200 hover:text-amber-300 transition-all shadow-md cursor-pointer text-[10px] font-semibold group/btn"
          title={`View ${postCount} posts created with this template`}
        >
          <Sparkles className="w-3 h-3 text-amber-400 group-hover/btn:scale-110 transition-transform" />
          <span>{postCount}</span>
          <span className="text-[9px] text-slate-400 group-hover/btn:text-amber-300/80 font-normal">
            {postCount === 1 ? 'post' : 'posts'}
          </span>
        </button>

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
      <div className="p-3 space-y-1.5">
        <h4 className="text-xs font-bold text-white truncate" title={title}>
          {title}
        </h4>
        <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
          <span className="text-slate-400 truncate">
            {template.templateCategory?.name || template.category || 'General'}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewPosts && onViewPosts(template);
            }}
            className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer shrink-0"
            title="Inspect posts created with this template"
          >
            <span>{postCount} posts</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
