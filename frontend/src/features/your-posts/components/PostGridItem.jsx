import React from 'react';
import { Maximize2, Trash2, Download, Calendar, Clock, Share2 } from 'lucide-react';
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

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!post.finalGraphicUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: occasionTitle,
          text: post.captions?.[0]?.captionText || occasionTitle,
          url: post.finalGraphicUrl,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  return (
    <Card
      key={post.id}
      className="p-3.5 sm:p-4 bg-[#131B2A] border-[#2C384E] space-y-3.5 sm:space-y-4 flex flex-col justify-between group hover:border-slate-500/80 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl relative min-w-0"
    >
      <div className="space-y-3">
        {/* Image Preview Container */}
        {post.finalGraphicUrl ? (
          <div className="relative aspect-square rounded-xl overflow-hidden border border-[#2C384E] bg-[#0B0F17] group/img">
            <img
              src={post.finalGraphicUrl}
              alt={occasionTitle}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => onLightbox?.(post)}
            />

            {/* Carousel Badge */}
            {(post.postType === "CAROUSEL" || post.mediaUrls?.length > 1) && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase z-10 backdrop-blur-md shadow-sm border bg-slate-900/80 text-amber-300 border-amber-500/40 flex items-center gap-1 font-mono">
                <span>🎠</span>
                <span>{post.mediaUrls?.length || (Array.isArray(post.slides) ? post.slides.length : "Carousel")} Slides</span>
              </span>
            )}

            {/* Status Pill - Clean status badge only */}
            {(() => {
              const isPublished = post.status === "PUBLISHED" || post.scheduledPost?.status === "SUCCESS";
              const isScheduled = post.status === "SCHEDULED" || post.scheduledPost?.status === "PENDING";
              return (
                <span
                  className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase z-10 backdrop-blur-md shadow-sm border ${
                    isPublished
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : isScheduled
                      ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  }`}
                >
                  {isPublished ? "PUBLISHED" : isScheduled ? "SCHEDULED" : post.status}
                </span>
              );
            })()}

            {/* Hover Quick View Overlay */}
            <div
              onClick={() => onLightbox?.(post)}
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
        <div className="space-y-2">
          <h4
            className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors"
            title={occasionTitle}
          >
            {occasionTitle}
          </h4>

          {/* Post Dates (Created / Scheduled) */}
          <div className="space-y-1 pt-1 font-mono text-[11px] border-t border-[#2C384E]/60">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                Created: {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {post.scheduledPost?.scheduledAt && (
              <div className="flex items-center gap-1.5 text-teal-400">
                <Clock className="w-3 h-3 text-teal-400 shrink-0" />
                <span>
                  Scheduled for:{" "}
                  <strong className="text-teal-300">
                    {new Date(post.scheduledPost.scheduledAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Footer Action Bar */}
      <div className="pt-3 border-t border-[#2C384E] flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Fullscreen HD Lightbox Trigger */}
        <button
          type="button"
          onClick={() => onLightbox?.(post)}
          className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-3 rounded-xl bg-[#0B0F17] hover:bg-slate-800 text-slate-200 hover:text-white border border-[#2C384E] hover:border-slate-500 text-xs font-semibold transition cursor-pointer active:scale-95 min-h-[38px]"
          title="View Full Resolution Graphic"
        >
          <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">View HD</span>
        </button>

        {/* 1-Tap Mobile Share Trigger (WhatsApp / Social Media) */}
        {post.finalGraphicUrl && typeof navigator !== "undefined" && navigator.share && (
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:p-2.5 rounded-xl bg-[#0B0F17] hover:bg-emerald-500/15 border border-[#2C384E] hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition cursor-pointer active:scale-95 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="1-Tap Share to WhatsApp / Social Media"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        {/* Direct Download Graphic Trigger */}
        {post.finalGraphicUrl && (
          <button
            type="button"
            onClick={handleInternalDownload}
            className="p-2 sm:p-2.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition cursor-pointer active:scale-95 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Download HD Graphic PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Delete Post Trigger */}
        <button
          type="button"
          onClick={() => onDelete?.(post.id)}
          className="p-2 sm:p-2.5 rounded-xl bg-[#0B0F17] hover:bg-rose-500/15 border border-[#2C384E] hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer active:scale-95 shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Delete Post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};

export default PostGridItem;
