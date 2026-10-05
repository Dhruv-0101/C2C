import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import {
  HelpCircle,
  Eye,
  Users,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

/**
 * MetricsExplanationModal
 * Transparently details what each metric means and how it is calculated directly from Meta Graph API.
 */
export const MetricsExplanationModal = ({ isOpen, onClose }) => {
  const metricsGuide = [
    {
      icon: <Users className="w-4 h-4 text-amber-400" />,
      title: 'Audience Reach',
      subtitle: 'Unique Accounts Reached',
      description:
        'The estimated number of unique accounts that saw your post at least once. If one person views your post 5 times, Reach is counted as 1.',
      source: 'Instagram Insights (reach) & Facebook Insights (post_impressions_unique)',
    },
    {
      icon: <Eye className="w-4 h-4 text-indigo-400" />,
      title: 'Total Impressions',
      subtitle: 'Total Views / Screen Displays',
      description:
        'The total number of times your post was rendered on users screens. This includes repeat views from the same user or followers scrolling past multiple times.',
      source: 'Instagram Insights (impressions) & Facebook Page (post_impressions)',
    },
    {
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      title: 'Likes & Reactions',
      subtitle: 'Direct Double-Taps & Heart Reactions',
      description:
        'Total organic likes received on Instagram feed/reels and reactions received on Facebook timeline posts.',
      source: 'Meta Graph API (like_count / likes.summary)',
    },
    {
      icon: <MessageCircle className="w-4 h-4 text-sky-400" />,
      title: 'Comments',
      subtitle: 'User Conversations',
      description:
        'The total count of public comments and replies left by your audience on your published post.',
      source: 'Meta Graph API (comments_count / comments.summary)',
    },
    {
      icon: <Share2 className="w-4 h-4 text-emerald-400" />,
      title: 'Shares & Reposts',
      subtitle: 'Stories & DM Reshares',
      description:
        'The number of times users shared your post to their Instagram Stories or forwarded it via Direct Message (DM), and Facebook timeline reshares.',
      source: 'Instagram Insights (shares) & Facebook (shares.count)',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How BrandFlow Calculates Analytics"
      description="100% transparent, official metrics fetched directly from Meta Graph API (Instagram & Facebook)."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto pr-1">
        {/* Formula Spotlight Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-indigo-500/10 dark:to-[#0B0F17] border border-amber-300 dark:border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
            <Calculator className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Official Engagement Rate Formula</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#0B0F17]/90 border border-slate-200 dark:border-[#2C384E] font-mono text-center text-sm text-slate-800 dark:text-white shadow-xs">
            <span className="text-amber-700 dark:text-amber-400 font-bold">Engagement Rate (%)</span> ={' '}
            <span className="text-slate-500 dark:text-slate-400">(</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Likes</span> +{' '}
            <span className="text-sky-600 dark:text-sky-400 font-semibold">Comments</span> +{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Shares</span>
            <span className="text-slate-500 dark:text-slate-400">) ÷ </span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">Audience Reach</span> ×{' '}
            <span className="text-slate-900 dark:text-white font-bold">100</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            This represents the true percentage of your audience who actively took action after viewing your post. Standard organic social engagement benchmarks typically range from <strong>1.5% to 5.0%</strong>.
          </p>
        </div>

        {/* Metrics Grid Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            Metrics Glossary
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {metricsGuide.map((item) => (
              <div
                key={item.title}
                className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-1.5 hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span className="text-[10px] text-slate-400 ml-2 font-mono">
                        ({item.subtitle})
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">
                    Live Verified
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed pl-8">
                  {item.description}
                </p>
                <div className="pl-8 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Meta Source: {item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Assurance Note */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>Zero Artificial Data:</strong> BrandFlow strictly communicates with Meta Graph API servers and does not invent synthetic metrics. If your post has 2 likes and 1 comment, BrandFlow accurately mirrors exactly 2 likes and 1 comment.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="px-5 font-bold">
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MetricsExplanationModal;
