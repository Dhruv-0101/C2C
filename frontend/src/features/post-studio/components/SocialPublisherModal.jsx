import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Share2,
  Flame,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { postApi } from "../../../services/post.api";

const SOCIAL_PLATFORMS = [
  { id: "INSTAGRAM", name: "Instagram", icon: "📸", color: "from-pink-500 to-rose-600" },
  { id: "FACEBOOK", name: "Facebook", icon: "📘", color: "from-blue-600 to-blue-800" },
  { id: "LINKEDIN", name: "LinkedIn", icon: "💼", color: "from-blue-500 to-indigo-700" },
  { id: "TWITTER", name: "Twitter / X", icon: "🐦", color: "from-slate-700 to-slate-900" },
];

/**
 * Helper to format date into datetime-local input string (YYYY-MM-THH:mm)
 */
const toDatetimeLocal = (date) => {
  const ten = (i) => (i < 10 ? "0" : "") + i;
  const YYYY = date.getFullYear();
  const MM = ten(date.getMonth() + 1);
  const DD = ten(date.getDate());
  const HH = ten(date.getHours());
  const mm = ten(date.getMinutes());
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
};

/**
 * SocialPublisherModal
 * Modal allowing users to publish immediately or schedule posts with exact minute precision across social platforms.
 */
export const SocialPublisherModal = ({
  isOpen,
  onClose,
  postData,
  onSuccess,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "INSTAGRAM",
    "FACEBOOK",
    "LINKEDIN",
  ]);
  const [publishMode, setPublishMode] = useState("NOW"); // 'NOW' | 'SCHEDULE'
  
  // Default to 15 minutes in the future for scheduling
  const defaultFutureDate = new Date(Date.now() + 15 * 60 * 1000);
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(defaultFutureDate));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [publishResult, setPublishResult] = useState(null);

  if (!isOpen) return null;

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length === 1) return; // Must have at least 1 platform selected
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const setQuickTime = (minutesAhead) => {
    const target = new Date(Date.now() + minutesAhead * 60 * 1000);
    setScheduledAt(toDatetimeLocal(target));
  };

  const setTomorrowMorning = () => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(9, 0, 0, 0);
    setScheduledAt(toDatetimeLocal(target));
  };

  const handlePublishOrSchedule = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (publishMode === "SCHEDULE") {
      if (!scheduledAt) {
        setErrorMsg("Please select a valid future date and time for scheduling.");
        return;
      }
      const chosenTime = new Date(scheduledAt).getTime();
      if (chosenTime <= Date.now()) {
        setErrorMsg("Scheduled time must be in the future!");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...postData,
        targetPlatforms: selectedPlatforms,
        scheduledAt: publishMode === "SCHEDULE" ? new Date(scheduledAt).toISOString() : undefined,
      };

      if (publishMode === "NOW") {
        const response = await postApi.publishNow(payload);
        setPublishResult(response.data?.publishResult || response.publishResult);
        if (onSuccess) onSuccess(response);
      } else {
        const response = await postApi.schedulePost(payload);
        setPublishResult({ scheduled: true, scheduledAt });
        if (onSuccess) onSuccess(response);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to process post execution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="w-full max-w-xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-auto text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Multi-Platform Social Publisher & Precise Scheduler
              </h3>
              <p className="text-xs text-slate-400">
                Publish immediately or schedule down to the exact minute.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}

        {/* Success / Publish Result State */}
        {publishResult ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-heading font-bold text-lg text-white">
                {publishResult.scheduled
                  ? "Post Scheduled Successfully! ⏰"
                  : "Post Published Successfully! 🎉"}
              </h4>
              <p className="text-xs text-emerald-200">
                {publishResult.scheduled
                  ? `Your post will automatically publish on ${new Date(scheduledAt).toLocaleString()}`
                  : "Your graphic is live across all target platforms!"}
              </p>
            </div>

            {/* Generated Mock Post Links */}
            {publishResult.platformResults && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Generated Platform Post Links:
                </h5>
                <div className="space-y-2">
                  {Object.entries(publishResult.platformResults).map(
                    ([platformKey, res]) => (
                      <div
                        key={platformKey}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs"
                      >
                        <span className="font-bold text-white uppercase tracking-wider">
                          {platformKey}
                        </span>
                        <a
                          href={(() => {
                            const url = res.postUrl || '';
                            if (url.includes("facebook.com/")) {
                              const path = url.split("facebook.com/")[1] || "";
                              if (path.startsWith("profile.php") || path.startsWith("permalink.php") || path.includes("/posts/")) {
                                return url;
                              }
                              const clean = path.replace(/^@/, "").trim();
                              if (/^\d+$/.test(clean)) {
                                return `https://facebook.com/profile.php?id=${clean}`;
                              }
                            }
                            return url;
                          })()}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-amber-400 hover:underline font-mono font-semibold truncate max-w-[280px]"
                        >
                          <span>{res.postUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <Button variant="primary" className="w-full justify-center" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePublishOrSchedule} className="space-y-6">
            {/* Target Platforms Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Select Target Social Platforms
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 text-white shadow-glow"
                          : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <span className="text-xs font-bold truncate">
                        {platform.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Selection: Publish Now vs Schedule */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Choose Execution Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPublishMode("NOW")}
                  className={`p-4 rounded-xl border transition text-left space-y-1 ${
                    publishMode === "NOW"
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-glow"
                      : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Post immediately across selected platforms.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishMode("SCHEDULE")}
                  className={`p-4 rounded-xl border transition text-left space-y-1 ${
                    publishMode === "SCHEDULE"
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-glow"
                      : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-teal-400">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule for Later</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Set exact future date & time (1-minute precision).
                  </p>
                </button>
              </div>
            </div>

            {/* Exact Minute Precision Date & Time Picker */}
            {publishMode === "SCHEDULE" && (
              <div className="space-y-3 animate-in fade-in duration-200 p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Exact Publishing Date & Time</span>
                  </label>
                  <span className="text-[10px] text-teal-400 font-mono font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                    1-Min Cron Sync Active
                  </span>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setQuickTime(5)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    ⚡ In 5 Mins
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(15)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    ⚡ In 15 Mins
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(60)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    ⏰ In 1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={setTomorrowMorning}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    🌅 Tomorrow 9 AM
                  </button>
                </div>

                {/* Exact Minute Datetime-Local Picker Input */}
                <input
                  type="datetime-local"
                  step="60" // 60 seconds (1 minute precision)
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 bg-[#131B2A] border border-[#2C384E] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  required
                />

                {/* Formatted Preview of Scheduled Date */}
                {scheduledAt && (
                  <p className="text-xs text-amber-300 font-mono flex items-center gap-1.5 pt-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Will dispatch on:{" "}
                      <strong className="text-white font-bold">
                        {new Date(scheduledAt).toLocaleString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </strong>
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-3 border-t border-[#2C384E] flex items-center justify-end gap-3">
              <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                icon={publishMode === "NOW" ? Send : Calendar}
              >
                {publishMode === "NOW" ? "Publish Immediately" : "Schedule Post"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};
