import React from 'react';
import { Maximize2, Trash2, Download, Calendar, Tag } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

/**
 * PostGridItem
 * Clean enterprise-grade single post preview, lightbox inspection, download, and deletion card.
 */
export const PostGridItem = ({
  post,
  onLightbox,
  onDelete,
  onDownload,
}) => {
  const occasionTitle =
    post.occasionName ||
    post.template?.title ||
    post.festival?.name ||
    "Branded Graphic Post";

  const captionSnippet =
    post.captions?.[0]?.captionText || post.caption || "No caption text attached.";

  // Internal fallback download if onDownload prop is omitted
  const handleInternalDownload = (e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(post.finalGraphicUrl, occasionTitle);
      return;
    }
    if (!post.finalGraphicUrl) return;

    // Trigger direct browser download or new tab fallback
    const link = document.createElement("a");
    link.href = post.finalGraphicUrl;
    link.download = `${occasionTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      key={post.id}
      className="p-4 bg-[#131B2A] border-[#2C384E] space-y-4 flex flex-col justify-between group hover:border-slate-500/80 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl relative"
    >
      <div className="space-y-3">
        {/* Image Preview Container */}
        {post.finalGraphicUrl ? (
          <div className="relative aspect-square rounded-xl overflow-hidden border border-[#2C384E] bg-[#0B0F17] group/img">
            <img
              src={post.finalGraphicUrl}
              alt={occasionTitle}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => onLightbox?.(post.finalGraphicUrl)}
            />

            {/* Occasion / Category Tag */}
            {(post.occasionName || post.festival?.name) && (
              <div className="absolute top-2.5 left-2.5 max-w-[65%] z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/75 text-amber-300 border border-amber-500/30 backdrop-blur-md truncate shadow-sm">
                  <Tag className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                  <span className="truncate">{post.occasionName || post.festival?.name}</span>
                </span>
              </div>
            )}

            {/* Status Pill */}
            <span
              className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase z-10 backdrop-blur-md shadow-sm border ${
                post.status === "PUBLISHED"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/40"
              }`}
            >
              {post.status}
            </span>

            {/* Hover Quick View Overlay */}
            <div
              onClick={() => onLightbox?.(post.finalGraphicUrl)}
              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                <Maximize2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 shadow">
                View Fullscreen
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-square rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-center text-xs text-slate-500">
            No Preview Image
          </div>
        )}

        {/* Content Details */}
        <div className="space-y-1.5">
          <h4
            className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors"
            title={occasionTitle}
          >
            {occasionTitle}
          </h4>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2rem]">
            {captionSnippet}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Clean Footer Action Bar - No Re-use */}
      <div className="pt-3 border-t border-[#2C384E] flex items-center justify-between gap-2">
        {/* Fullscreen HD Lightbox Trigger */}
        <button
          type="button"
          onClick={() => onLightbox?.(post.finalGraphicUrl)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-200 hover:text-white border border-[#2C384E] hover:border-slate-500 text-xs font-semibold transition cursor-pointer"
          title="View Full Resolution Graphic"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
          <span>View HD</span>
        </button>

        {/* Direct Download Graphic Trigger */}
        {post.finalGraphicUrl && (
          <button
            type="button"
            onClick={handleInternalDownload}
            className="p-2 rounded-xl bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition cursor-pointer"
            title="Download HD Graphic PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Delete Post Trigger */}
        <button
          type="button"
          onClick={() => onDelete?.(post.id)}
          className="p-2 rounded-xl bg-[#0B0F17] hover:bg-rose-500/15 border border-[#2C384E] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          title="Delete Post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

export default PostGridItem;
