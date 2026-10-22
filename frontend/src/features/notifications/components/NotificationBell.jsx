import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  Calendar,
  Send,
  Smartphone,
  ExternalLink,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  HelpCircle,
  Laptop,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { playNotificationChime } from '../utils/soundEngine';
import { Button } from '@/components/ui/Button';

/**
 * Format relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday")
 */
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Enterprise Notification Bell & Web Push Center
 * Combines in-app notifications feed with 1-click mobile/desktop Web Push enablement,
 * live audio chime listener, and system-level OS diagnostics.
 */
export const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [incomingToast, setIncomingToast] = useState(null);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading: isLoadingFeed,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
  } = useNotifications();

  const {
    isSupported,
    unsupportedReason,
    permission,
    isSubscribed,
    isSubscribing,
    isTestingPush,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    playChimePreview,
  } = usePushNotifications();

  // Listen for real-time push events forwarded by Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'BRANDFLOW_PUSH_RECEIVED') {
        const payload = event.data.payload || {};
        // Play acoustic chime
        playNotificationChime(0.4);

        // Display floating live toast on screen
        setIncomingToast({
          title: payload.title || 'BrandFlow Alert 🔔',
          body: payload.body || 'New notification received!',
          linkUrl: payload.linkUrl || '/studio',
        });

        // Invalidate feed so badge updates
        refetch();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [refetch]);

  // Auto-dismiss incoming floating toast after 7 seconds
  useEffect(() => {
    if (!incomingToast) return;
    const timer = setTimeout(() => {
      setIncomingToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [incomingToast]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle push toggle
  const handleTogglePush = async () => {
    setFeedbackMessage(null);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setFeedbackMessage({ type: 'info', text: 'Push notifications disabled for this device.' });
      } else {
        await subscribeToPush();
        setFeedbackMessage({
          type: 'success',
          text: 'Push notifications enabled! You will receive 1-day festival alerts.',
        });
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to update push permissions.',
      });
    }
  };

  // Handle test push send
  const handleSendTestPush = async () => {
    setFeedbackMessage(null);
    try {
      await sendTestNotification();
      setFeedbackMessage({
        type: 'success',
        text: 'Test push queued! Check your lock screen or desktop notification center.',
      });
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Could not send test push.',
      });
    }
  };

  // Handle clicking a notification item
  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }

    if (item.data?.url) {
      navigate(item.data.url);
      setIsOpen(false);
    } else if (item.data?.festivalId) {
      navigate(`/studio?festivalId=${item.data.festivalId}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        id="brandflow-notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 sm:p-2.5 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/40 group shrink-0"
        title="Notifications & Festival Alerts"
        aria-label="Open notifications menu"
      >
        <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-950/60 ring-2 ring-slate-950 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/50" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllRead}
                  className="text-[11px] font-medium text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feedback message banner */}
          {feedbackMessage && (
            <div
              className={`px-3 py-2 text-xs flex items-center justify-between border-b ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : feedbackMessage.type === 'error'
                  ? 'bg-rose-950/50 border-rose-800/60 text-rose-300'
                  : 'bg-amber-950/50 border-amber-800/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-1 pr-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-2">{feedbackMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Push Notifications Configuration Card */}
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-800/80">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isSubscribed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-200">Festival Push Alerts</p>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isSubscribed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isSubscribed ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Get alerted 1 day before any festival
                  </p>
                </div>
              </div>

              {/* Push Toggle */}
              {isSupported ? (
                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={isSubscribing}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 ${
                    isSubscribed
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      : 'bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-extrabold'
                  }`}
                >
                  {isSubscribing ? (
                    '...'
                  ) : isSubscribed ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Enable</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {unsupportedReason === 'INSECURE_HTTP'
                      ? '🔒 Needs HTTPS'
                      : unsupportedReason === 'IOS_REQUIRES_SAFARI_PWA'
                      ? '📱 Safari Required'
                      : 'Not Supported'}
                  </span>
                </div>
              )}
            </div>

            {/* Insecure HTTP or iOS Explainer helper */}
            {!isSupported && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
                {unsupportedReason === 'INSECURE_HTTP' ? (
                  <p>
                    ⚠️ Mobile Chrome requires a <strong>Secure Context (HTTPS)</strong> to deliver push notifications. In production (or via HTTPS domain), it works automatically!
                  </p>
                ) : unsupportedReason === 'IOS_REQUIRES_SAFARI_PWA' ? (
                  <p>
                    📱 On iPhone/iPad, Apple restricts push to Safari. Open BrandFlow in Safari, tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.
                  </p>
                ) : (
                  <p>Your current browser does not support the W3C Push API.</p>
                )}
              </div>
            )}

            {/* Test Push & Sound Preview Buttons (When Enabled) */}
            {isSubscribed && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Device verification:</span>
                  <div className="flex items-center gap-1.5">
                    {/* Audio Chime Preview */}
                    <button
                      type="button"
                      onClick={playChimePreview}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                      title="Test Audio Chime Speaker"
                    >
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>Test Sound</span>
                    </button>

                    {/* Send Test Push Button */}
                    <button
                      type="button"
                      onClick={handleSendTestPush}
                      disabled={isTestingPush}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                      title="Send test push to all your registered devices"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isTestingPush ? 'Sending...' : 'Test Push'}</span>
                    </button>
                  </div>
                </div>

                {/* Toggle Troubleshooting OS Guide */}
                <button
                  type="button"
                  onClick={() => setShowTroubleshoot((prev) => !prev)}
                  className="w-full text-[10px] text-slate-400 hover:text-amber-400 transition flex items-center justify-between pt-1 border-t border-slate-800/40"
                >
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-amber-400/80" />
                    <span>No system banner or sound? Click for OS settings</span>
                  </span>
                  {showTroubleshoot ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* OS-Specific Troubleshooting Helper Accordion */}
                {showTroubleshoot && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 space-y-2 animate-in fade-in duration-150">
                    <div>
                      <p className="font-bold text-amber-400 flex items-center gap-1">
                        <span>🍏 Mac Users (macOS):</span>
                      </p>
                      <ul className="list-disc list-inside text-slate-400 mt-0.5 space-y-0.5">
                        <li>
                          Open <strong className="text-slate-200">System Settings → Notifications → Google Chrome</strong>.
                        </li>
                        <li>
                          Turn ON <strong className="text-slate-200">"Allow Notifications"</strong> & check <strong className="text-slate-200">"Play sound for notifications"</strong>.
                        </li>
                        <li>
                          Check if Mac <strong className="text-slate-200">"Focus / Do Not Disturb"</strong> is ON (it silences all banners).
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-bold text-cyan-400 flex items-center gap-1">
                        <span>🪟 Windows Users:</span>
                      </p>
                      <p className="text-slate-400">
                        Open <strong>Settings → System → Notifications</strong>. Ensure Chrome is ON and turn off <strong>Focus Assist</strong>.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <span>📱 Mobile (Android & iPhone):</span>
                      </p>
                      <p className="text-slate-400">
                        • <strong>Android:</strong> Requires HTTPS or USB Port Forwarding. Plain HTTP local IPs block push.
                        <br />• <strong>iOS (iPhone):</strong> Open Safari → Tap Share → <strong>Add to Home Screen</strong> (Apple rule).
                      </p>
                    </div>

                    <div className="pt-1 border-t border-slate-800/60 text-slate-400 italic">
                      💡 <strong>Active Tab Note:</strong> When you are actively looking at this tab, Chrome silences native popups to avoid interrupting you. BrandFlow plays the sound chime and shows an in-app banner instead!
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[360px] custom-scrollbar">
            {isLoadingFeed ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Sparkles className="w-6 h-6 text-amber-400/80" />
                </div>
                <p className="text-xs font-bold text-slate-300">No Notifications Yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] mx-auto">
                  You will see upcoming festival reminders, poster alerts, and system updates here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-all flex gap-3 cursor-pointer group hover:bg-slate-800/50 ${
                    !item.isRead ? 'bg-amber-500/[0.04]' : ''
                  }`}
                >
                  {/* Icon Indicator */}
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                        item.type === 'FESTIVAL_ALERT'
                          ? 'bg-gradient-to-br from-amber-500/20 to-teal-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {item.type === 'FESTIVAL_ALERT' ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p
                        className={`text-xs font-bold line-clamp-1 group-hover:text-amber-400 transition ${
                          !item.isRead ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message || item.body}
                    </p>

                    {/* Action link */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400/90 flex items-center gap-1 group-hover:underline">
                        <span>Open Poster Studio</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>

                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 text-center">
            <p className="text-[10px] text-slate-500">
              BrandFlow Automated 1-Day Advance Festival Dispatcher
            </p>
          </div>
        </div>
      )}

      {/* 🚀 Real-time Floating Live Notification Toast with Acoustic Audio Wave */}
      {incomingToast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm w-[calc(100vw-2.5rem)] rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl backdrop-blur-2xl p-4 text-slate-100 flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-slate-950 shrink-0 shadow-lg shadow-amber-500/20">
            <Volume2 className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400">
                Live Notification Alert 🔔
              </span>
              <button
                type="button"
                onClick={() => setIncomingToast(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{incomingToast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">{incomingToast.body}</p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIncomingToast(null);
                  navigate(incomingToast.linkUrl || '/studio');
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Now</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIncomingToast(null)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-slate-200 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
