import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Plus, ArrowRight, Play, Film } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { getPostMedia } from '@/shared/utils';

/**
 * RecentActivityFeed
 * Recent posts & festival countdown list
 */
export const RecentActivityFeed = ({
  recentPosts = [],
  totalPostsCount = 0,
  onOpenNewPost,
}) => {
  const navigate = useNavigate();

  if (recentPosts.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-dashed border-[#2C384E] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">No recent graphics created yet</p>
            <p className="text-[11px] text-slate-400">Start creating branded post graphics with AI Post Studio.</p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => onOpenNewPost?.(null)}
          className="text-xs shrink-0 font-bold py-1.5 px-3"
        >
          Create First Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentPosts.map((post) => {
        const media = getPostMedia(post);
        const displayImage = media.posterUrl || media.mediaUrl || post.finalGraphicUrl;

        return (
          <div
            key={post.id}
            className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-slate-700 transition-colors gap-2.5 min-w-0 cursor-pointer"
            onClick={() => navigate('/your-posts')}
            title="Click to view in Your Posts"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              {displayImage && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-[#2C384E] shrink-0 relative bg-black">
                  <img
                    src={displayImage}
                    alt="Media Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  {media.isVideo && (
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow">
                        <Play className="w-2 h-2 ml-0.5 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {post.occasionName || post.template?.title || post.festival?.name || (media.isVideo ? "Social Reel Post" : "Branded Graphic Post")}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                  Created {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          <span
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold shrink-0 ${
              post.status === "PUBLISHED"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {post.status}
          </span>
        </div>
      ))}

      {totalPostsCount > 4 && (
        <div className="pt-2 border-t border-[#2C384E] flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Showing 4 of {totalPostsCount} recent posts
          </span>
          <button
            type="button"
            onClick={() => navigate("/your-posts")}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All Posts & Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
