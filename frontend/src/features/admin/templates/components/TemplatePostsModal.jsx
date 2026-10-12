import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  X,
  Search,
  Sparkles,
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  Filter,
  Instagram,
  Facebook,
  Linkedin,
  Layers,
  Share2,
} from 'lucide-react';
import { useAdminPosts } from '@/features/admin/posts/hooks/useAdminPosts';
import { useDebounce } from '@/shared/hooks/useDebounce';
import Pagination from '@/components/ui/Pagination';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { formatDate } from '@/shared/utils/date.util';

/**
 * TemplatePostsModal Component
 * Enterprise inspector modal displaying all customized marketing posts created
 * by users from a specific master graphic template.
 * Features live debounced search, status tabs (Published, Scheduled, Draft),
 * platform badges, full-resolution image lightbox, and server-side pagination.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Modal dismissal callback
 * @param {Object|null} props.template - Active template entity ({ id, title, baseImageUrl, _count, ... })
 */
export const TemplatePostsModal = ({ isOpen, onClose, template }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lightboxPost, setLightboxPost] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset pagination state when modal opens or template changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setSearch('');
      setStatusFilter('ALL');
      setLightboxPost(null);
    }
  }, [isOpen, template?.id]);

  // Reset page to 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const {
    posts = [],
    meta,
    isLoading,
    error,
  } = useAdminPosts(
    {
      templateId: template?.id,
      page,
      limit,
      search: debouncedSearch || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    },
    { enabled: Boolean(isOpen && template?.id) }
  );

  if (!isOpen || !template) return null;

  const totalPostsCount =
    meta?.totalItems ??
    template._count?.posts ??
    posts.length;

  const templateImage =
    template.baseImageUrl || template.mediaUrl || template.thumbnailUrl || template.imageUrl;

  return (
    <>
      <div
        className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in bg-slate-950/80 backdrop-blur-sm overflow-hidden"
        onClick={onClose}
      >
        <div
          className="w-full max-w-5xl max-h-[92vh] bg-[#131B2A] border border-[#2C384E] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Modal Header: Template Thumbnail & Title */}
          <div className="p-5 sm:p-6 border-b border-[#2C384E] flex items-center justify-between gap-4 shrink-0 bg-[#0B0F17]">
            <div className="flex items-center gap-3.5 min-w-0">
              {templateImage ? (
                <img
                  src={templateImage}
                  alt={template.title}
                  className="w-12 h-12 rounded-xl object-cover border border-[#2C384E] shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <FileCode2 className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-extrabold text-lg text-white truncate">
                    {template.title}
                  </h3>
                  {template.templateCategory?.name && (
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 font-semibold shrink-0">
                      📁 {template.templateCategory.name}
                    </span>
                  )}
                  {template.festival?.name && (
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 font-semibold shrink-0">
                      🪔 {template.festival.name}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold shrink-0">
                    ✨ {totalPostsCount} {totalPostsCount === 1 ? 'Post Created' : 'Posts Created'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {template.description || 'Master graphic template used by tenants for customized poster creatives.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Filter & Search Strip */}
          <div className="px-5 py-3.5 border-b border-[#2C384E] bg-[#0E1522] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name, owner, or occasion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#131B2A] border border-[#2C384E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Lifecycle Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold px-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {[
                { id: 'ALL', label: 'All Posts' },
                { id: 'PUBLISHED', label: '🚀 Live / Published' },
                { id: 'SCHEDULED', label: '⏰ Scheduled' },
                { id: 'DRAFT', label: '📝 Draft' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                    statusFilter === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Modal Scrollable Posts Grid */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: limit }).map((_, i) => (
                  <div
                    key={`skel-tpl-post-${i}`}
                    className="border border-[#2C384E] rounded-2xl p-3 bg-[#0B0F17] space-y-3 animate-pulse"
                  >
                    <div className="aspect-square rounded-xl bg-slate-800" />
                    <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs">
                Failed to load posts created from this template. Please try again.
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-xs space-y-2 bg-[#0B0F17]/40">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <p className="font-heading font-bold text-sm text-white">
                  {search
                    ? `No posts matching "${search}"`
                    : 'No posts created using this template yet'}
                </p>
                <p className="text-slate-400 max-w-md mx-auto">
                  {search
                    ? 'Try adjusting your search query or switching status filters.'
                    : 'When tenants select this graphic template in Post Studio and customize it with their Brand Kit, their generated creatives will be tracked here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {posts.map((post) => {
                  const finalImage = post.finalGraphicUrl || post.customImageUrl || templateImage;
                  const user = post.user || {};
                  const businessName = user.brandKit?.businessName || user.fullName || 'Tenant';
                  const isPublished = post.status === 'PUBLISHED';
                  const isScheduled = post.status === 'SCHEDULED';

                  // Social platforms
                  const targetPlatforms = post.scheduledPost?.targetPlatforms || [];

                  return (
                    <div
                      key={post.id}
                      className="group relative border border-[#2C384E] rounded-2xl overflow-hidden hover:border-amber-500/60 transition-all bg-[#0B0F17] flex flex-col justify-between shadow-sm"
                    >
                      {/* Image Preview with Hover Overlay */}
                      <div
                        className="aspect-square relative overflow-hidden bg-slate-950 cursor-pointer"
                        onClick={() =>
                          setLightboxPost({
                            title: post.occasionName || template.title,
                            imageUrl: finalImage,
                            caption: `${businessName} • ${post.status}`,
                          })
                        }
                      >
                        <img
                          src={finalImage}
                          alt={post.occasionName || 'User Post'}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />

                        {/* Status Pill on Top Left */}
                        <div className="absolute top-2 left-2 z-10">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md shadow-md ${
                              isPublished
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : isScheduled
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-950/80 text-slate-300 border border-slate-700/60'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPublished
                                  ? 'bg-emerald-400'
                                  : isScheduled
                                  ? 'bg-amber-400'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span>{post.status}</span>
                          </span>
                        </div>

                        {/* Hover Overlay Button */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1.5 text-center pointer-events-none">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold shadow flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Creative</span>
                          </span>
                        </div>
                      </div>

                      {/* Post Card Footer: Business & Details */}
                      <div className="p-3 border-t border-[#2C384E] bg-[#131B2A] space-y-2">
                        {/* Business Name & User */}
                        <div>
                          <div className="flex items-center gap-1.5 text-white text-xs font-bold truncate">
                            <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{businessName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <User className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{user.email || 'user'}</span>
                          </div>
                        </div>

                        {/* Occasion / Title */}
                        {post.occasionName && (
                          <p className="text-[10px] text-slate-300 line-clamp-1 italic bg-[#0B0F17] px-2 py-0.5 rounded border border-[#2C384E]/50">
                            "{post.occasionName}"
                          </p>
                        )}

                        {/* Social Platforms & Timestamp */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#2C384E]/40 font-mono">
                          <div className="flex items-center gap-1">
                            {targetPlatforms.includes('INSTAGRAM') && (
                              <Instagram className="w-3 h-3 text-pink-400" />
                            )}
                            {targetPlatforms.includes('FACEBOOK') && (
                              <Facebook className="w-3 h-3 text-blue-400" />
                            )}
                            {targetPlatforms.includes('LINKEDIN') && (
                              <Linkedin className="w-3 h-3 text-sky-400" />
                            )}
                            {targetPlatforms.length === 0 && (
                              <span className="text-slate-500">Post</span>
                            )}
                          </div>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Modal Footer with Pagination */}
          {posts.length > 0 && (
            <div className="p-4 border-t border-[#2C384E] bg-[#0B0F17] shrink-0">
              <Pagination
                meta={meta}
                currentPage={page}
                totalPages={meta?.totalPages || Math.max(1, Math.ceil(totalPostsCount / limit))}
                onPageChange={(newPage) => setPage(newPage)}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                pageSizeOptions={[8, 12, 16, 24]}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Full-resolution Image Lightbox Viewer */}
      {lightboxPost && (
        <ImageLightbox
          isOpen={Boolean(lightboxPost)}
          item={lightboxPost}
          imageUrl={lightboxPost.imageUrl}
          onClose={() => setLightboxPost(null)}
        />
      )}
    </>
  );
};

export default TemplatePostsModal;
