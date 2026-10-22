import React, { useState } from 'react';
import { Megaphone, Zap, Radio, BellRing, Sparkles } from 'lucide-react';
import { useAdminBroadcasts } from '../hooks/useAdminBroadcasts';
import { BroadcastComposer } from './BroadcastComposer';
import { NotificationPreview } from './NotificationPreview';
import { BroadcastHistoryTable } from './BroadcastHistoryTable';

/**
 * Enterprise Admin Broadcast & Push Outreach View
 * Complete management suite for blasting promotions, flash sales, and maintenance alerts.
 */
export const AdminBroadcastView = () => {
  const {
    broadcasts,
    pagination,
    params,
    setParams,
    selectedAudience,
    setSelectedAudience,
    audienceEstimate,
    isLoadingEstimate,
    isLoadingHistory,
    sendBroadcast,
    isBroadcasting,
    sendTestPush,
    isSendingTest,
  } = useAdminBroadcasts();

  // State for live mock preview
  const [livePreviewData, setLivePreviewData] = useState({
    title: 'Diwali Flash Sale: 50% Off 🪔',
    message: 'Upgrade to BrandFlow Pro today and get 50 bonus festival posts + automated social scheduler!',
    type: 'PROMOTION',
    linkUrl: '/plan',
    imageUrl: '',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Push Broadcasts & Announcements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>BullMQ Queue</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Blast real-time mobile push notifications and in-app alerts for flash sales, discounts,
            and critical payment channel maintenance.
          </p>
        </div>

        {/* Live Reach KPI Pill */}
        <div className="flex items-center gap-3 bg-[#131B2A] border border-[#2C384E] rounded-2xl p-2.5 sm:px-4 shrink-0 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Total Target Reach
            </p>
            <p className="text-sm font-extrabold text-white">
              {isLoadingEstimate ? (
                '...'
              ) : (
                <>
                  <span className="text-amber-400">{audienceEstimate.userCount}</span> Users •{' '}
                  <span className="text-teal-400">{audienceEstimate.deviceCount}</span> Devices
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Composer & Live Mockup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Composer Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#131B2A] border border-[#2C384E] p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2C384E]">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h2 className="font-heading font-bold text-sm text-white">Campaign Composer</h2>
            </div>
            <span className="text-[11px] text-slate-400">Standard RFC 8292 Web Push</span>
          </div>

          <BroadcastComposer
            audienceEstimate={audienceEstimate}
            isLoadingEstimate={isLoadingEstimate}
            onAudienceChange={setSelectedAudience}
            onValuesChange={setLivePreviewData}
            onDispatch={sendBroadcast}
            isBroadcasting={isBroadcasting}
            onSendTest={sendTestPush}
            isSendingTest={isSendingTest}
          />
        </div>

        {/* Right Column: Live Mockup Previews (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#131B2A]/60 border border-[#2C384E] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2C384E]">
            <h3 className="font-heading font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Delivery Simulation</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Real-time
            </span>
          </div>

          <NotificationPreview
            title={livePreviewData.title}
            message={livePreviewData.message}
            type={livePreviewData.type}
            linkUrl={livePreviewData.linkUrl}
            imageUrl={livePreviewData.imageUrl}
          />
        </div>
      </div>

      {/* Past Campaigns History Table */}
      <BroadcastHistoryTable
        broadcasts={broadcasts}
        pagination={pagination}
        isLoading={isLoadingHistory}
        onPageChange={(newPage) => setParams((prev) => ({ ...prev, page: newPage }))}
      />
    </div>
  );
};

export default AdminBroadcastView;
