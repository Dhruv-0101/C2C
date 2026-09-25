import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

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
      {recentPosts.map((post) => (
        <div
          key={post.id}
          className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {post.finalGraphicUrl && (
              <img
                src={post.finalGraphicUrl}
                alt="Graphic Thumbnail"
                className="w-10 h-10 rounded-lg object-cover border border-[#2C384E]"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {post.occasionName || post.template?.title || post.festival?.name || "Branded Graphic Post"}
              </p>
              <p className="text-[11px] text-slate-400">
                Created {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
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
