import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { formatDateTime } from '../../../../shared/utils/date.util';

/**
 * AdminPostCard Component
 * Renders individual generated post card with media thumbnail, status badge, and creator details.
 */
export const AdminPostCard = ({ post, onPreview }) => {
  const graphicUrl =
    post.mediaUrl ||
    post.finalGraphicUrl ||
    post.customImageUrl ||
    post.template?.baseImageUrl;

  return (
    <Card className="overflow-hidden bg-[#131B2A] border-[#2C384E] hover:border-amber-500/40 transition group">
      <div
        className="aspect-square relative bg-slate-900 overflow-hidden cursor-pointer"
        onClick={() => onPreview && onPreview(graphicUrl)}
      >
        {graphicUrl ? (
          <img
            src={graphicUrl}
            alt={post.occasionName || 'Generated Post'}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No Graphic
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
          <span>{post.category?.name || 'General'}</span>
          <span>{formatDateTime(post.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
};

export default AdminPostCard;
