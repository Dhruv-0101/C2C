import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Users,
  TrendingUp,
  Instagram,
  Facebook,
  Linkedin,
  ExternalLink,
  Calendar,
  Sparkles,
  Tag,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const PostDetailsModal = ({ isOpen, onClose, post }) => {
  if (!post) return null;

  const {
    title,
    graphicUrl,
    caption,
    hashtags = [],
    festivalName,
    categoryName,
    createdAt,
    publishedAt,
    targetPlatforms = [],
    metrics = {},
    platformBreakdown = [],
  } = post;

  const formattedDate = new Date(publishedAt || createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Individual Post Deep Insights"
      description={`Full breakdown & live Meta metrics for: ${title}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-xs text-slate-300 max-h-[75vh] overflow-y-auto pr-1">
        {/* Main Content Grid: Graphic + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E]">
          {/* Post Graphic Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-black/40 rounded-xl overflow-hidden border border-[#2C384E] relative group">
            {graphicUrl ? (
              <img
                src={graphicUrl}
                alt={title}
                className="w-full h-auto max-h-64 object-contain transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-48 w-full flex items-center justify-center text-slate-600 font-mono text-xs">
                No Graphic Available
              </div>
            )}
            {graphicUrl && (
              <a
                href={graphicUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
              >
                <span>Full Image</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Post Metadata & Caption */}
          <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {targetPlatforms.map((platform) => {
                  const isIg = platform === 'INSTAGRAM';
                  const isFb = platform === 'FACEBOOK';
                  return (
                    <span
                      key={platform}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isIg
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isFb
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}
                    >
                      {isIg && <Instagram className="w-3 h-3" />}
                      {isFb && <Facebook className="w-3 h-3" />}
                      <span>{platform}</span>
                    </span>
                  );
                })}

                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-base text-white leading-snug">
                {title}
              </h3>

              {/* Tags & Categories */}
              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                {festivalName && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3" /> {festivalName}
                  </span>
                )}
                {categoryName && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 font-mono">
                    <Tag className="w-3 h-3" /> {categoryName}
                  </span>
                )}
              </div>

              {/* Post Caption Snippet */}
              {caption && (
                <div className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Published Copy:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {caption}
                  </p>
                </div>
              )}
            </div>

            {/* Live Sync Status Tag */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-[#2C384E]">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Meta Graph API Live Verified</span>
              </span>
              <span>
                Synced:{' '}
                {metrics.lastSyncedAt
                  ? new Date(metrics.lastSyncedAt).toLocaleTimeString()
                  : 'Just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Badges for This Specific Post */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
              <Eye className="w-3 h-3 text-indigo-400" /> Impr
            </span>
            <span className="text-base font-extrabold text-white font-mono">
              {formatNumber(metrics.impressions || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-amber-400" /> Reach
            </span>
            <span className="text-base font-extrabold text-white font-mono">
              {formatNumber(metrics.reach || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" /> Likes
            </span>
            <span className="text-base font-extrabold text-rose-400 font-mono">
              {formatNumber(metrics.likes || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3 text-sky-400" /> Comments
            </span>
            <span className="text-base font-extrabold text-sky-400 font-mono">
              {formatNumber(metrics.comments || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase block flex items-center justify-center gap-1">
              <Share2 className="w-3 h-3 text-emerald-400" /> Shares
            </span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {formatNumber(metrics.shares || 0)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-center space-y-0.5">
            <span className="text-[10px] text-amber-400 font-bold uppercase block flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> Rate
            </span>
            <span className="text-base font-extrabold text-amber-300 font-mono">
              {metrics.engagementRate || 0}%
            </span>
          </div>
        </div>

        {/* Calculation Walkthrough Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-transparent border border-amber-500/20 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs font-sans">
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculation for this post:</span>
          </div>
          <div className="text-slate-300">
            Total Interactions = Likes ({metrics.likes || 0}) + Comments ({metrics.comments || 0}) + Shares ({metrics.shares || 0}) = <strong>{metrics.totalInteractions || 0}</strong>
          </div>
          <div className="text-slate-300">
            Engagement Rate = ({metrics.totalInteractions || 0} ÷ Reach {metrics.reach || 0}) × 100 = <strong className="text-amber-300">{metrics.engagementRate || 0}%</strong>
          </div>
        </div>

        {/* Platform Breakdown Side-by-Side */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-xs text-white uppercase tracking-wider">
            Platform Breakdown (Channel-by-Channel)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {platformBreakdown.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 col-span-2">
                No channel breakdown records available.
              </div>
            ) : (
              platformBreakdown.map((item) => {
                const isIg = item.platform === 'INSTAGRAM';
                const isFb = item.platform === 'FACEBOOK';
                return (
                  <div
                    key={item.platform}
                    className={`p-4 rounded-xl border space-y-3 ${
                      isIg
                        ? 'bg-gradient-to-br from-rose-950/20 via-[#0B0F17] to-[#0B0F17] border-rose-500/30'
                        : isFb
                        ? 'bg-gradient-to-br from-blue-950/20 via-[#0B0F17] to-[#0B0F17] border-blue-500/30'
                        : 'bg-[#0B0F17] border-[#2C384E]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isIg && <Instagram className="w-4 h-4 text-pink-400" />}
                        {isFb && <Facebook className="w-4 h-4 text-blue-400" />}
                        <span className="font-bold text-white text-xs">{item.platform}</span>
                      </div>

                      {item.postUrl && (
                        <a
                          href={item.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Open Live</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-[#131B2A] border border-[#2C384E]">
                        <span className="text-[9px] text-slate-400 block">Likes</span>
                        <span className="text-xs font-bold text-rose-400 font-mono">
                          {formatNumber(item.likes)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#131B2A] border border-[#2C384E]">
                        <span className="text-[9px] text-slate-400 block">Comments</span>
                        <span className="text-xs font-bold text-sky-400 font-mono">
                          {formatNumber(item.comments)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#131B2A] border border-[#2C384E]">
                        <span className="text-[9px] text-slate-400 block">Shares</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {formatNumber(item.shares)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#2C384E] font-mono">
                      <span className="text-slate-400">
                        Reach: <strong className="text-white">{formatNumber(item.reach)}</strong>
                      </span>
                      <span className="text-slate-400">
                        Impr: <strong className="text-white">{formatNumber(item.impressions)}</strong>
                      </span>
                      <span className="text-amber-400 font-bold">
                        {item.engagementRate}% Rate
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="px-5 font-bold">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailsModal;
