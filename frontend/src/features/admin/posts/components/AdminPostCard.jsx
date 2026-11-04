import React from 'react';
import { Play, Film } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { formatDateTime } from '../../../../shared/utils/date.util';
import { getPostMedia } from '../../../../shared/utils';

/**
 * AdminPostCard Component
 * Renders individual generated post card with media thumbnail/video badge, status badge, and creator details.
 */
export const AdminPostCard = ({ post, onPreview }) => {
  const media = getPostMedia(post);
  const displayImage = media.posterUrl || media.mediaUrl;

  return (
    <Card className="overflow-hidden bg-[#131B2A] border-[#2C384E] hover:border-amber-500/40 transition group">
      <div
        className="aspect-square relative bg-slate-900 overflow-hidden cursor-pointer"
        onClick={() => onPreview && onPreview(post)}
      >
        {media.isVideo && !media.posterUrl ? (
          <video
            src={media.mediaUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-black"
            preload="metadata"
            muted
            playsInline
          />
        ) : displayImage ? (
          <img
            src={displayImage}
            alt={post.occasionName || 'Generated Post'}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No Media
          </div>
        )}

        {/* Video / Reel Indicator Badge */}
        {media.isVideo && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/90 to-purple-600/90 backdrop-blur-md text-white text-[10px] font-bold shadow-md border border-white/20">
            <Film className="w-3 h-3 text-pink-200" />
            <span>{media.postType === 'REEL' ? 'Reel' : 'Video'}</span>
            {media.duration ? <span className="opacity-75">• {media.duration}s</span> : null}
          </div>
        )}

        {/* Center Play Overlay for Video */}
        {media.isVideo && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <Badge
            variant={
              post.status === 'PUBLISHED'
                ? 'success'
                : post.status === 'FAILED'
                ? 'error'
                : 'warning'
            }
            size="sm"
          >
            {post.status || 'DRAFT'}
          </Badge>
        </div>
      </div>
      <div className="p-3 space-y-1.5 text-xs">
        <p className="font-semibold text-white truncate" title={post.user?.fullName}>
          {post.user?.fullName || 'Business User'}
        </p>
        <p className="text-[11px] text-slate-400 font-mono truncate" title={post.user?.email}>
          {post.user?.email}
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-[#2C384E]/50">
          <span>{post.category?.name || (media.isVideo ? 'Reels' : 'General')}</span>
          <span>{formatDateTime(post.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
};

export default AdminPostCard;
