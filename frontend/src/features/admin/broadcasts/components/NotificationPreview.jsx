import React from 'react';
import { Smartphone, Monitor, Sparkles, BellRing, ExternalLink } from 'lucide-react';

/**
 * Enterprise Live Push Notification Preview Component
 * Renders real-time mockups of Mobile Lock Screen card and Desktop Notification banner.
 */
export const NotificationPreview = ({
  title = '',
  message = '',
  type = 'PROMOTION',
  linkUrl = '/plan',
  imageUrl = '',
}) => {
  const displayTitle = title.trim() || 'Diwali Flash Sale: 50% Off 🪔';
  const displayMessage =
    message.trim() ||
    'Upgrade your BrandFlow plan today and unlock 50 additional festival poster generations!';

  const getTypeBadge = (t) => {
    switch (t) {
      case 'PROMOTION':
        return { label: 'Flash Sale', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'MAINTENANCE':
        return { label: 'Maintenance', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'SYSTEM':
        return { label: 'System Alert', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'ANNOUNCEMENT':
        return { label: 'Announcement', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'FESTIVAL_ALERT':
        return { label: 'Festival Alert', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      default:
        return { label: 'Alert', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const badge = getTypeBadge(type);

  return (
    <div className="space-y-6">
      {/* Mobile Lock Screen Card Mockup */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Mobile Lock Screen Preview</span>
          </span>
          <span className="text-[10px] text-slate-500">Android / iOS Chrome</span>
        </div>

        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-[#2C384E] p-4 shadow-xl backdrop-blur-md">
          {/* Top meta */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
                BF
              </div>
              <span className="font-heading font-bold text-xs text-slate-200">BrandFlow</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">now</span>
          </div>

          {/* Title & Body */}
          <p className="font-bold text-xs text-white leading-snug">{displayTitle}</p>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-3">
            {displayMessage}
          </p>

          {/* Optional Image Banner */}
          {imageUrl && (
            <div className="mt-2.5 rounded-lg overflow-hidden max-h-32 bg-slate-800 border border-slate-700/50">
              <img
                src={imageUrl}
                alt="Notification banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Action Button Preview */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <span>View Announcement</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
            <span className="text-[9px] text-slate-500 font-mono">{linkUrl || '/plan'}</span>
          </div>
        </div>
      </div>

      {/* Desktop Notification Banner Mockup */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-teal-400" />
            <span>Desktop System Banner Preview</span>
          </span>
          <span className="text-[10px] text-slate-500">Chrome / Edge / Safari</span>
        </div>

        <div className="rounded-xl bg-[#131B2A] border border-amber-500/30 p-3.5 shadow-2xl flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-teal-500 p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BellRing className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold text-xs text-white truncate pr-2">{displayTitle}</p>
              <span className="text-[9px] text-slate-400 shrink-0">BrandFlow • now</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {displayMessage}
            </p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                Open
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Dismiss
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreview;
