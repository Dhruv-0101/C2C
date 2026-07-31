import React, { useState } from 'react';
import { Sparkles, Calendar, Share2, TrendingUp, Plus, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PostCreatorModal } from '../components/common/PostCreatorModal';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-teal-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SMB Workspace</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Welcome back, <span className="text-gradient">{user?.fullName || 'Creator'}</span>!
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Your AI Brand Engine is active. Ready to generate your next multi-platform viral post?
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" icon={Plus} onClick={() => setIsPostModalOpen(true)}>
            New Post
          </Button>
          <Button variant="outline" icon={Zap}>
            AI Brand Kit
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated Posts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-3xl font-extrabold text-white">48</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +14% this week
          </p>
        </Card>

        <Card className="p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Jobs</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-3xl font-extrabold text-white">12</p>
          <p className="text-xs text-teal-400 font-medium">Next: Today at 5:00 PM</p>
        </Card>

        <Card className="p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Social Channels</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-3xl font-extrabold text-white">4</p>
          <p className="text-xs text-slate-400 font-medium">Instagram, LinkedIn, X, FB</p>
        </Card>

        <Card className="p-5 border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-2xl font-extrabold text-white">Pro Plan</p>
          <p className="text-xs text-emerald-400 font-medium">Active & Validated</p>
        </Card>
      </div>

      {/* Quick Action Activity Panel */}
      <Card className="border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-white">Recent AI Campaigns</h3>
          <Button variant="primary" icon={Plus} className="text-xs" onClick={() => setIsPostModalOpen(true)}>
            Create New Campaign
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Raksha Bandhan Special Offer Campaign', status: 'Scheduled', platform: 'Instagram & Facebook', time: 'In 2 hours' },
            { title: 'New Product Launch Announcement', status: 'Published', platform: 'LinkedIn', time: 'Yesterday' },
            { title: 'Weekly Industry Insights Infographic', status: 'Draft', platform: 'X (Twitter)', time: '3 days ago' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-400">{item.platform} • {item.time}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Post Creator Studio Modal */}
      <PostCreatorModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
