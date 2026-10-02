import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Instagram,
  Facebook,
  Sparkles,
  BarChart3,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PostAnalyticsCard } from './PostAnalyticsCard';
import { PostDetailsModal } from './PostDetailsModal';
import { Button } from '../../../components/ui/Button';
import Pagination from '@/components/ui/Pagination';

export const PostAnalyticsList = ({
  posts = [],
  meta = { totalCount: 0, totalItems: 0, page: 1, limit: 9, totalPages: 1 },
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  platformFilter = 'ALL',
  onPlatformChange,
  sortBy = 'createdAt',
  onSortChange,
  sortOrder = 'desc',
  onSortOrderChange,
  page = 1,
  onPageChange,
  limit = 9,
  onLimitChange,
}) => {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="space-y-4">
      {/* Section Header & Sub-toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#131B2A] p-4 rounded-2xl border border-[#2C384E]">
        <div className="space-y-0.5">
          <h2 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Individual Post Insights & Performance</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {(meta?.totalCount !== undefined && meta?.totalCount !== null) ? meta.totalCount : posts.length}{' '}
              {((meta?.totalCount !== undefined && meta?.totalCount !== null) ? meta.totalCount : posts.length) === 1 ? 'post' : 'posts'}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time engagement, impressions and audience reach measured individually for every published graphic.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search post caption or title..."
              className="w-full bg-[#0B0F17] border border-[#2C384E] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center bg-[#0B0F17] rounded-xl border border-[#2C384E] px-2.5 py-1 shrink-0 gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer py-1"
            >
              <option value="createdAt" className="bg-[#131B2A]">Latest Published</option>
              <option value="reach" className="bg-[#131B2A]">Highest Reach</option>
              <option value="engagementRate" className="bg-[#131B2A]">Best Engagement Rate</option>
              <option value="impressions" className="bg-[#131B2A]">Most Impressions</option>
              <option value="likes" className="bg-[#131B2A]">Most Likes</option>
            </select>

            <button
              type="button"
              onClick={() => onSortOrderChange?.(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-0.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[10px] font-mono font-extrabold text-amber-400 border border-slate-700/80 transition cursor-pointer"
              title={`Currently sorted ${sortOrder === 'desc' ? 'High to Low (Descending)' : 'Low to High (Ascending)'}. Click to reverse order.`}
            >
              {sortOrder === 'desc' ? 'DESC ↓' : 'ASC ↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-4 rounded-2xl bg-[#131B2A] border border-[#2C384E] space-y-3"
            >
              <div className="aspect-video w-full rounded-xl skeleton-shimmer" />
              <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              <div className="h-3 w-1/2 rounded skeleton-shimmer" />
              <div className="h-12 w-full rounded-xl skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        /* Empty State */
        <div className="p-10 rounded-2xl bg-[#131B2A] border border-[#2C384E] text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-sm text-white">No Posts Match This Filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No posts found matching "${searchTerm}". Try a different keyword.`
                : 'Publish graphics to Instagram or Facebook via Post Studio to view individual post performance.'}
            </p>
          </div>
        </div>
      ) : (
        /* Grid of Post Analytics Cards */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostAnalyticsCard
                key={post.id}
                post={post}
                onSelectPost={setSelectedPost}
              />
            ))}
          </div>

          {/* Central Enterprise Pagination Component (Handles thousands of posts gracefully) */}
          <Pagination
            meta={{
              page: meta.page || page,
              limit: meta.limit || limit || 9,
              totalItems: meta.totalCount ?? meta.totalItems ?? posts.length,
              totalPages: meta.totalPages || 1,
              hasNextPage: meta.hasNextPage ?? (page < (meta.totalPages || 1)),
              hasPrevPage: meta.hasPrevPage ?? (page > 1),
            }}
            currentPage={page}
            totalPages={meta.totalPages || 1}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
            pageSizeOptions={[6, 9, 12, 24, 48]}
          />
        </>
      )}

      {/* Deep Insights Details Modal */}
      <PostDetailsModal
        isOpen={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
      />
    </div>
  );
};

export default PostAnalyticsList;
