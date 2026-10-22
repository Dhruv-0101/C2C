import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Send,
  Users,
  AlertTriangle,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { playNotificationChime } from '@/features/notifications';

const broadcastFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title cannot exceed 100 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(500, 'Message cannot exceed 500 characters'),
  type: z.enum(['PROMOTION', 'SYSTEM', 'MAINTENANCE', 'ANNOUNCEMENT', 'FESTIVAL_ALERT']),
  targetAudience: z.enum(['ALL', 'FREE_USERS', 'PRO_USERS']),
  linkUrl: z.string().min(1, 'Target link is required').default('/plan'),
  imageUrl: z.string().optional().or(z.literal('')),
});

export const BroadcastComposer = ({
  audienceEstimate,
  isLoadingEstimate,
  onAudienceChange,
  onValuesChange,
  onDispatch,
  isBroadcasting,
  onSendTest,
  isSendingTest,
}) => {
  const [feedback, setFeedback] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: {
      title: 'Diwali Flash Sale: 50% Off 🪔',
      message: 'Upgrade to BrandFlow Pro today and get 50 bonus festival posts + automated social scheduler!',
      type: 'PROMOTION',
      targetAudience: 'ALL',
      linkUrl: '/plan',
      imageUrl: '',
    },
  });

  const formValues = watch();

  // Notify parent of live changes for preview card
  React.useEffect(() => {
    if (onValuesChange) {
      onValuesChange(formValues);
    }
  }, [formValues.title, formValues.message, formValues.type, formValues.linkUrl, formValues.imageUrl]);

  const handleAudienceSelect = (audience) => {
    setValue('targetAudience', audience);
    if (onAudienceChange) {
      onAudienceChange(audience);
    }
  };

  const handleTypeSelect = (type) => {
    setValue('type', type);
    // Autofill helpful defaults based on type
    if (type === 'MAINTENANCE') {
      setValue('title', '⚠️ Scheduled Maintenance Notice');
      setValue('message', 'Our payment gateway will undergo routine maintenance tonight from 2 AM to 3 AM. Service will resume normally.');
      setValue('linkUrl', '/dashboard');
    } else if (type === 'PROMOTION') {
      setValue('title', '🔥 Limited Time Upgrade Offer');
      setValue('message', 'Get 50% discount on BrandFlow Pro plan. Create unlimited festival posters for your business today!');
      setValue('linkUrl', '/plan');
    } else if (type === 'ANNOUNCEMENT') {
      setValue('title', '🚀 Exciting New Features Released');
      setValue('message', 'BrandFlow Studio now includes smart AI background styles and automated Instagram publishing!');
      setValue('linkUrl', '/create-post');
    }
  };

  const onSubmit = async (data) => {
    setFeedback(null);
    try {
      const result = await onDispatch(data);
      setFeedback({
        type: 'success',
        text: `Campaign broadcasted! Dispatched to ${result.recipientCount} users (${result.deliveredCount} push devices queued).`,
      });
      setConfirmOpen(false);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Failed to dispatch broadcast.',
      });
      setConfirmOpen(false);
    }
  };

  const handleTestSend = async () => {
    setFeedback(null);
    playNotificationChime(0.4);
    try {
      await onSendTest({
        title: formValues.title || 'BrandFlow Test 🔔',
        body: formValues.message || 'Push notifications are working smoothly!',
        linkUrl: formValues.linkUrl || '/plan',
        imageUrl: formValues.imageUrl || undefined,
      });
      setFeedback({
        type: 'success',
        text: 'Test push sent to your registered device! Check your screen.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Could not send test push.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/50 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Campaign Category Type */}
      <div>
        <label className="block text-xs font-bold text-slate-300 mb-2">Campaign Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'PROMOTION', label: '🏷️ Promotion / Deal' },
            { id: 'MAINTENANCE', label: '⚠️ Maintenance' },
            { id: 'ANNOUNCEMENT', label: '🚀 Feature Release' },
            { id: 'SYSTEM', label: '📢 System Alert' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTypeSelect(item.id)}
              className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                formValues.type === item.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Target Audience Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-300">Target Audience Segment</label>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isLoadingEstimate ? (
                'Estimating reach...'
              ) : (
                <>
                  <strong className="text-white">{audienceEstimate.userCount}</strong> users •{' '}
                  <strong className="text-amber-400">{audienceEstimate.deviceCount}</strong> devices
                </>
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'ALL', label: 'All Users', desc: 'Active platform members' },
            { id: 'FREE_USERS', label: 'Free Plan Only', desc: 'Ideal for plan upgrades' },
            { id: 'PRO_USERS', label: 'Pro Members Only', desc: 'Paid subscribers' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAudienceSelect(item.id)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                formValues.targetAudience === item.id
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <p
                className={`text-xs font-bold ${
                  formValues.targetAudience === item.id ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                {item.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Notification Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-300">Headline / Title</label>
          <span className="text-[10px] text-slate-500">
            {formValues.title?.length || 0} / 100 characters
          </span>
        </div>
        <input
          type="text"
          {...register('title')}
          placeholder="e.g. 50% Discount on BrandFlow Pro Today!"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title.message}</p>}
      </div>

      {/* 4. Message Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-slate-300">Notification Message</label>
          <span className="text-[10px] text-slate-500">
            {formValues.message?.length || 0} / 500 characters
          </span>
        </div>
        <textarea
          rows={3}
          {...register('message')}
          placeholder="Enter the notification message that will appear on mobile lock screens..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
        />
        {errors.message && (
          <p className="text-[11px] text-rose-400 mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* 5. Destination Link & Image URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3 text-amber-400" />
            <span>Click Action Link</span>
          </label>
          <input
            type="text"
            {...register('linkUrl')}
            placeholder="/plan or /create-post"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          {errors.linkUrl && (
            <p className="text-[10px] text-rose-400 mt-1">{errors.linkUrl.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3 text-teal-400" />
            <span>Banner Image URL (Optional)</span>
          </label>
          <input
            type="text"
            {...register('imageUrl')}
            placeholder="https://example.com/banner.png"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* 6. Action Triggers */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleTestSend}
          disabled={isSendingTest}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>{isSendingTest ? 'Sending Test...' : 'Send Test to My Device'}</span>
        </button>

        <Button
          type="button"
          variant="primary"
          onClick={() => setConfirmOpen(true)}
          isLoading={isBroadcasting}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-extrabold shadow-lg"
          icon={Send}
        >
          <span>Dispatch to {audienceEstimate.userCount} Users</span>
        </Button>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-heading font-bold text-base text-white">
                Confirm Push Broadcast
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You are about to dispatch this notification to{' '}
                <strong className="text-amber-400">{audienceEstimate.userCount} users</strong> and{' '}
                <strong className="text-teal-400">{audienceEstimate.deviceCount} push devices</strong>.
                This action cannot be undone.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-left text-xs">
              <p className="font-bold text-slate-200">{formValues.title}</p>
              <p className="text-slate-400 mt-0.5 line-clamp-2">{formValues.message}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBroadcasting}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 text-xs font-extrabold shadow-glow hover:opacity-95 transition disabled:opacity-50"
              >
                {isBroadcasting ? 'Broadcasting...' : 'Yes, Dispatch Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default BroadcastComposer;
