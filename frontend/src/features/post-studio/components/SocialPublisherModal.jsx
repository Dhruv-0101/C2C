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
import { usePostPublisher } from '@/features/social/hooks/usePostPublisher';
import { useSocialAccounts } from '@/features/social/hooks/useSocialAccounts';
import { AiCaptionGeneratorModal } from "./AiCaptionGeneratorModal";

const SOCIAL_PLATFORMS = [
  { id: "INSTAGRAM", name: "Instagram", icon: "📸", color: "from-pink-500 to-rose-600" },
  { id: "FACEBOOK", name: "Facebook", icon: "📘", color: "from-blue-600 to-blue-800" },
  { id: "LINKEDIN", name: "LinkedIn", icon: "💼", color: "from-blue-500 to-indigo-700" },
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
  const [validationError, setValidationError] = useState("");
  const [captionText, setCaptionText] = useState(
    postData?.caption || postData?.captions?.[0]?.captionText || ""
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const {
    instagramAccount,
    facebookAccount,
    linkedinAccount,
    isLoadingAccounts,
  } = useSocialAccounts();

  const platformConnectionMap = {
    INSTAGRAM: Boolean(instagramAccount?.isConnected),
    FACEBOOK: Boolean(facebookAccount?.isConnected),
    LINKEDIN: Boolean(linkedinAccount?.isConnected),
  };

  const handleNameMap = {
    INSTAGRAM: instagramAccount?.accountName || null,
    FACEBOOK: facebookAccount?.accountName || null,
    LINKEDIN: linkedinAccount?.accountName || null,
  };

  const connectedCount = Object.values(platformConnectionMap).filter(Boolean).length;
  
  // Default to 15 minutes in the future for scheduling
  const defaultFutureDate = new Date(Date.now() + 15 * 60 * 1000);
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(defaultFutureDate));

  const {
    isSubmitting,
    errorMsg,
    publishResult,
    handlePublishOrSchedule: onSubmitPublish,
  } = usePostPublisher(onSuccess);

  if (!isOpen) return null;

  const togglePlatform = (id) => {
    setValidationError("");
    if (selectedPlatforms.includes(id)) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (connectedCount === 0) {
      setValidationError(
        "⚠️ No social media accounts connected! You cannot publish or schedule posts without connecting at least one account in Social Integrations (/connections)."
      );
      return;
    }

    if (selectedPlatforms.length === 0) {
      setValidationError("⚠️ Please select at least one connected social media platform to proceed.");
      return;
    }

    // Check if any selected platform is not connected
    const disconnectedSelected = selectedPlatforms.filter((id) => !platformConnectionMap[id]);

    if (disconnectedSelected.length > 0) {
      const missingNames = disconnectedSelected
        .map((id) => SOCIAL_PLATFORMS.find((p) => p.id === id)?.name)
        .join(", ");

      const connectedSelectedNames = selectedPlatforms
        .filter((id) => platformConnectionMap[id])
        .map((id) => SOCIAL_PLATFORMS.find((p) => p.id === id)?.name)
        .join(" and ");

      if (connectedSelectedNames) {
        setValidationError(
          `⚠️ ${missingNames} is not connected! Please remove ${missingNames} from your selection to publish/schedule only on ${connectedSelectedNames}, or connect ${missingNames} in Social Integrations (/connections).`
        );
      } else {
        setValidationError(
          `⚠️ ${missingNames} is not connected! Please remove ${missingNames} or connect it in Social Integrations (/connections) to proceed.`
        );
      }
      return;
    }

    // All selected platforms are verified connected! Proceed with submit
    onSubmitPublish({
      postData: {
        ...postData,
        caption: captionText,
      },
      selectedPlatforms,
      publishMode,
      scheduledAt,
    });
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="w-full max-w-lg bg-[#131B2A] border border-[#2C384E] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white leading-tight">
                Social Publisher & Scheduler
              </h3>
              <p className="text-[11px] text-slate-400">
                Publish immediately or schedule with exact minute precision.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {(validationError || errorMsg) && (
          <Alert variant="error" message={validationError || errorMsg} />
        )}

        {/* Success / Publish Result State */}
        {publishResult ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-heading font-bold text-base text-white">
                {publishResult.scheduled
                  ? "Post Scheduled Successfully! ⏰"
                  : "Post Published Successfully! 🎉"}
              </h4>
              <p className="text-xs text-emerald-200">
                {publishResult.scheduled
                  ? `Will automatically publish on ${new Date(scheduledAt).toLocaleString()}`
                  : "Your graphic is live across all selected platforms!"}
              </p>
            </div>

            {/* Platform Post Links */}
            {publishResult.platformResults && (
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Post Links:
                </h5>
                <div className="space-y-1.5">
                  {Object.entries(publishResult.platformResults).map(
                    ([platformKey, res]) => (
                      <div
                        key={platformKey}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs"
                      >
                        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
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
                          className="inline-flex items-center gap-1 text-amber-400 hover:underline font-mono font-semibold truncate max-w-[240px] text-[11px]"
                        >
                          <span className="truncate">{res.postUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            <Button variant="primary" className="w-full justify-center py-2 text-xs" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 0 Connected Accounts Warning Banner */}
            {connectedCount === 0 && !isLoadingAccounts && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>No Social Accounts Connected</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Connect Instagram, Facebook, or LinkedIn to publish or schedule posts.
                </p>
                <a
                  href="/connections"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline pt-0.5"
                >
                  <span>Go to Integrations Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Target Platforms Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                1. Target Social Platforms
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  const isConnected = platformConnectionMap[platform.id];
                  const handleName = handleNameMap[platform.id];

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 relative ${
                        isSelected && isConnected
                          ? "bg-amber-500/10 border-amber-500 text-white shadow-sm"
                          : isSelected && !isConnected
                          ? "bg-rose-500/10 border-rose-500/80 text-rose-200"
                          : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{platform.icon}</span>
                        {isConnected ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            Linked
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-bold uppercase tracking-wider">
                            Offline
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-xs font-bold block truncate">
                          {platform.name}
                        </span>
                        {isConnected && handleName && (
                          <span className="text-[9px] text-emerald-300 font-mono block truncate mt-0.5">
                            {handleName}
                          </span>
                        )}
                        {!isConnected && isSelected && (
                          <span className="text-[9px] text-rose-400 font-semibold block mt-0.5">
                            ⚠️ Connect first
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption & Hashtags Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  2. Caption & Hashtags
                </label>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-[11px] shadow-sm cursor-pointer transition hover:scale-105"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>AI Copy ✨</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Write caption here or click 'AI Copy ✨' to auto-generate..."
                className="w-full px-3 py-2 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
              />
            </div>

            {/* Mode Selection: Publish Now vs Schedule */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                3. Execution Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPublishMode("NOW")}
                  className={`p-2.5 rounded-xl border transition text-left flex items-center gap-2.5 ${
                    publishMode === "NOW"
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-sm"
                      : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                  }`}
                >
                  <Send className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-white block">Publish Now</span>
                    <span className="text-[10px] text-slate-400 block">Post immediately</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishMode("SCHEDULE")}
                  className={`p-2.5 rounded-xl border transition text-left flex items-center gap-2.5 ${
                    publishMode === "SCHEDULE"
                      ? "bg-amber-500/15 border-amber-500 text-white shadow-sm"
                      : "bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-white block">Schedule Later</span>
                    <span className="text-[10px] text-slate-400 block">Exact date & time</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Exact Minute Precision Date & Time Picker */}
            {publishMode === "SCHEDULE" && (
              <div className="space-y-2.5 animate-in fade-in duration-200 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Publishing Date & Time</span>
                  </label>
                  <span className="text-[9px] text-teal-400 font-mono font-bold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/30">
                    1-Min Cron Sync
                  </span>
                </div>

                {/* Quick Selection Shortcuts */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setQuickTime(5)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    ⚡ 5 Mins
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(15)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    ⚡ 15 Mins
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTime(60)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    ⏰ 1 Hour
                  </button>
                  <button
                    type="button"
                    onClick={setTomorrowMorning}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition border border-slate-700"
                  >
                    🌅 Tomorrow 9am
                  </button>
                </div>

                {/* Exact Minute Datetime-Local Picker Input */}
                <input
                  type="datetime-local"
                  step="60"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 bg-[#131B2A] border border-[#2C384E] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  required
                />

                {/* Formatted Preview of Scheduled Date */}
                {scheduledAt && (
                  <p className="text-[11px] text-amber-300 font-mono flex items-center gap-1 pt-0.5">
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>
                      Will dispatch:{" "}
                      <strong className="text-white font-bold">
                        {new Date(scheduledAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-2.5 border-t border-[#2C384E] flex items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting} className="py-1.5 px-3 text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                icon={publishMode === "NOW" ? Send : Calendar}
                className="py-1.5 px-4 text-xs font-bold"
              >
                {publishMode === "NOW" ? "Publish Immediately" : "Schedule Post"}
              </Button>
            </div>
          </form>
        )}

        <AiCaptionGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          initialTopic={postData?.occasionName || postData?.template?.title || ""}
          onSelectCaption={(generatedText) => setCaptionText(generatedText)}
        />
      </div>
    </div>,
    document.body,
  );
};
