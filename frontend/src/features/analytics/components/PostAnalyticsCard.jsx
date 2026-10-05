import React from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Users,
  TrendingUp,
  Instagram,
  Facebook,
  Calendar,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const PostAnalyticsCard = ({ post, onSelectPost }) => {
  if (!post) return null;

  const {
    title,
    graphicUrl,
    caption,
    festivalName,
    publishedAt,
    createdAt,
    targetPlatforms = [],
    metrics = {},
    platformBreakdown = [],
  } = post;

  const formattedDate = new Date(publishedAt || createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="p-4 bg-white dark:bg-[#131B2A] border-slate-200 dark:border-[#2C384E] hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group shadow-sm dark:shadow-lg">
      <div className="space-y-3">
        {/* Top Graphic + Platform Badge */}
        <div className="relative aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-[#2C384E] flex items-center justify-center">
          {graphicUrl ? (
            <img
              src={graphicUrl}
              alt={title}
              className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span className="text-slate-400 dark:text-slate-600 text-xs font-mono">No Image</span>
          )}

          {/* Platform Pills Overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
            {targetPlatforms.map((platform) => {
              const isIg = platform === 'INSTAGRAM';
              const isFb = platform === 'FACEBOOK';
              return (
                <span
                  key={platform}
                  className={`p-1.5 rounded-lg text-white shadow-md backdrop-blur-md ${
                    isIg
                      ? 'bg-rose-500/90 border border-rose-400/50'
                      : isFb
                      ? 'bg-blue-600/90 border border-blue-400/50'
                      : 'bg-indigo-600/90 border border-indigo-400/50'
                  }`}
                  title={`Published to ${platform}`}
                >
                  {isIg && <Instagram className="w-3.5 h-3.5" />}
                  {isFb && <Facebook className="w-3.5 h-3.5" />}
                </span>
              );
            })}
          </div>

          {/* Engagement Rate Badge Top Right */}
          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-lg bg-white/95 dark:bg-black/80 backdrop-blur-md border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-mono font-extrabold text-[11px] flex items-center gap-1.5 shadow-md">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{metrics.engagementRate || 0}%</span>
          </div>

          {/* Festival Spotlight Badge */}
          {festivalName && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow">
              <Sparkles className="w-2.5 h-2.5" />
              <span className="truncate max-w-[120px]">{festivalName}</span>
            </div>
          )}
        </div>

        {/* Content Summary */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" /> {formattedDate}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Meta Verified</span>
          </div>

          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
            {title}
          </h4>

          {caption && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {caption}
            </p>
          )}
        </div>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-[#2C384E] text-center font-mono">
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase flex items-center justify-center gap-0.5 font-sans font-semibold">
              <Eye className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> Impr
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
              {formatNumber(metrics.impressions || 0)}
            </span>
            {platformBreakdown.length > 1 && (
              <span
                className="text-[9px] text-slate-500 dark:text-slate-400 block truncate font-mono"
                title={platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : p.platform === 'FACEBOOK' ? 'FB' : p.platform}: ${formatNumber(p.impressions)}`).join(' • ')}
              >
                {platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : p.platform === 'FACEBOOK' ? 'FB' : p.platform}: ${formatNumber(p.impressions)}`).join(' • ')}
              </span>
            )}
          </div>

          <div className="space-y-0.5 border-x border-slate-200 dark:border-[#2C384E]">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase flex items-center justify-center gap-0.5 font-sans font-semibold">
              <Users className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" /> Reach
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
              {formatNumber(metrics.reach || 0)}
            </span>
            {platformBreakdown.length > 1 && (
              <span
                className="text-[9px] text-amber-700 dark:text-amber-400/90 block truncate font-mono font-medium"
                title={platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : p.platform === 'FACEBOOK' ? 'FB' : p.platform}: ${formatNumber(p.reach)}`).join(' • ')}
              >
                {platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : p.platform === 'FACEBOOK' ? 'FB' : p.platform}: ${formatNumber(p.reach)}`).join(' • ')}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase flex items-center justify-center gap-0.5 font-sans font-semibold">
              <Heart className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" /> Likes
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block font-mono">
              {formatNumber(metrics.likes || 0)}
            </span>
            {platformBreakdown.length > 1 && (
              <span
                className="text-[9px] text-slate-500 dark:text-slate-400 block truncate font-mono"
                title={platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : p.platform === 'FACEBOOK' ? 'FB' : p.platform}: ${formatNumber(p.likes)}`).join(' • ')}
              >
                {platformBreakdown.map((p) => `${p.platform === 'INSTAGRAM' ? 'IG' : p.platform === 'FACEBOOK' ? 'FB' : p.platform}: ${formatNumber(p.likes)}`).join(' • ')}
              </span>
            )}
          </div>
        </div>

        {/* Additional Micro Counters */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono px-1">
          <span className="flex items-center gap-1 font-medium">
            <MessageCircle className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>{formatNumber(metrics.comments || 0)} Comments</span>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Share2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{formatNumber(metrics.shares || 0)} Shares</span>
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-[#2C384E] mt-3 flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectPost?.(post)}
          className="w-full text-xs font-bold border-slate-200 dark:border-[#2C384E] hover:border-amber-500/50 hover:bg-amber-500/10 flex items-center justify-center gap-1.5"
        >
          <BarChart2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Deep Insights</span>
        </Button>
      </div>
    </Card>
  );
};

export default PostAnalyticsCard;
