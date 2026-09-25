import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize2, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

/**
 * PostGridItem
 * Single post preview & download card
 */
export const PostGridItem = ({
  post,
  onLightbox,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      key={post.id}
      className="p-4 bg-[#131B2A] border-[#2C384E] space-y-4 flex flex-col justify-between group hover:border-slate-500 transition"
    >
      <div className="space-y-3">
        {/* Image Preview */}
        {post.finalGraphicUrl ? (
          <div className="relative aspect-square rounded-xl overflow-hidden border border-[#2C384E] bg-[#0B0F17] group/img">
            <img
              src={post.finalGraphicUrl}
              alt={post.occasionName || "Post Graphic"}
              className="w-full h-full object-cover group-hover/img:scale-105 transition duration-300 cursor-pointer"
              onClick={() => onLightbox?.(post)}
            />
            <span
              className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase z-10 ${
                post.status === "PUBLISHED"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-amber-500 text-slate-950"
              }`}
            >
              {post.status}
            </span>
            {/* Hover Zoom Overlay */}
            <div
              onClick={() => onLightbox?.(post)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-[2px] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                <Maximize2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                Full Screen View
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-square rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-center text-xs text-slate-500">
            No Preview Image
          </div>
        )}

        {/* Details */}
        <div>
          <h4 className="font-bold text-sm text-white line-clamp-1">
            {post.occasionName || post.template?.title || post.festival?.name || "Branded Graphic Post"}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
            {post.captions?.[0]?.captionText || "No caption text"}
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-2">
            Created: {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-[#2C384E] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate("/create-post", { state: { reusePost: post } })}
          className="inline-flex items-center justify-center py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-[11px] shadow transition cursor-pointer"
          title="Re-use Graphic in Post Studio"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" /> Re-use ✨
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-400 hover:text-white"
            onClick={() => onLightbox?.(post)}
          >
            View HD
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2"
            onClick={() => onDelete?.(post.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PostGridItem;
