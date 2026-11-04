import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  Layers,
  Play,
  Film,
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
  initialPublishMode = "NOW",
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "INSTAGRAM",
    "FACEBOOK",
    "LINKEDIN",
  ]);
  const [publishMode, setPublishMode] = useState(initialPublishMode); // 'NOW' | 'SCHEDULE'

  useEffect(() => {
    if (isOpen && initialPublishMode) {
      setPublishMode(initialPublishMode);
    }
  }, [isOpen, initialPublishMode]);
  const [validationError, setValidationError] = useState("");
  const [captionText, setCaptionText] = useState(
    postData?.caption || postData?.captions?.[0]?.captionText || ""
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const previewGraphic = postData?.base64Graphic || postData?.finalGraphicUrl || null;


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

    // Video Platform Requirements Validation (Instagram: 15m/1GB, Facebook: 90s/500MB/.mp4, LinkedIn: 10m/200MB/.mp4)
    if (postData?.videoUrl) {
      const dur = Number(postData?.durationSeconds) || 0;
      const isMov = Boolean(
        postData?.videoFormat === 'mov' ||
        postData?.videoUrl?.toLowerCase()?.includes('.mov')
      );
      const sizeBytes = Number(postData?.fileSize) || 0;

      // Universal minimum duration: 3s
      if (dur > 0 && dur < 3) {
        setValidationError("⚠️ Video duration must be at least 3 seconds on all social networks.");
        return;
      }

      // 1. Instagram Reels: .mp4, .mov | 3s - 15m (900s) | Max 1 GB
      if (selectedPlatforms.includes("INSTAGRAM")) {
        if (dur > 900) {
          setValidationError(`⚠️ Instagram Reels allows a maximum duration of 15 minutes (your video is ${dur}s). Please deselect Instagram or trim your video.`);
          return;
        }
        if (sizeBytes > 1024 * 1024 * 1024) {
          setValidationError("⚠️ Instagram Reels allows a maximum file size of 1 GB. Please deselect Instagram or compress your video.");
          return;
        }
      }

      // 2. Facebook Reels: strictly .mp4 | 3s - 90s | Max 500 MB
      if (selectedPlatforms.includes("FACEBOOK")) {
        if (isMov) {
          setValidationError("⚠️ Facebook Reels strictly requires .mp4 format (.mov is not supported on Facebook Reels). Please deselect Facebook or convert to MP4.");
          return;
        }
        if (dur > 90) {
          setValidationError(`⚠️ Facebook Reels only supports videos up to 90 seconds (your video is ${dur}s). Please deselect Facebook or trim your video.`);
          return;
        }
        if (sizeBytes > 500 * 1024 * 1024) {
          setValidationError("⚠️ Facebook Reels allows a maximum file size of 500 MB. Please deselect Facebook or compress your video.");
          return;
        }
      }

      // 3. LinkedIn Video: strictly .mp4 | 3s - 10 min (600s) | Max 200 MB
      if (selectedPlatforms.includes("LINKEDIN")) {
        if (isMov) {
          setValidationError("⚠️ LinkedIn Video strictly requires .mp4 format (.mov is not supported on LinkedIn Video). Please deselect LinkedIn or convert to MP4.");
          return;
        }
        if (dur > 600) {
          setValidationError(`⚠️ LinkedIn Video allows a maximum duration of 10 minutes (600s). Your video is ${dur}s. Please deselect LinkedIn or shorten your video.`);
          return;
        }
        if (sizeBytes > 200 * 1024 * 1024) {
          setValidationError("⚠️ LinkedIn Video allows a maximum file size of 200 MB. Please deselect LinkedIn or compress your video.");
          return;
        }
      }
    }

    // All selected platforms and video specs verified! Proceed with submit
    onSubmitPublish({
      postData: {
        ...postData,
        caption: captionText,
        videoUrl: postData?.videoUrl || undefined,
        thumbnailUrl: postData?.thumbnailUrl || undefined,
        durationSeconds: postData?.durationSeconds || undefined,
        fileSize: postData?.fileSize || undefined,
        videoWidth: postData?.videoWidth || undefined,
        videoHeight: postData?.videoHeight || undefined,
        videoFormat: postData?.videoFormat || undefined,
        postType: postData?.videoUrl ? 'REEL' : (postData?.postType || 'SINGLE'),
      },
      selectedPlatforms,
      publishMode,
      scheduledAt,
    });
  };

  return createPortal(
    <div className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto font-sans">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
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
                  : publishResult.isQueued
                  ? "Publishing Dispatched! 🚀"
                  : "Post Published Successfully! 🎉"}
              </h4>
              <p className="text-xs text-emerald-200">
                {publishResult.scheduled
                  ? `Will automatically publish on ${new Date(scheduledAt).toLocaleString()}`
                  : publishResult.isQueued
                  ? "Your post has been queued and is being published to your selected platforms in the background."
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

            <Button
              variant="primary"
              className="w-full justify-center py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg"
              onClick={() => {
                onClose();
                navigate('/posts');
              }}
            >
              {publishResult.scheduled ? "Go to Scheduled Queue →" : "View in Your Posts & Queue →"}
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

            {/* Visual Media Preview (Video / Reel or Graphic) */}
            {(postData?.videoUrl || previewGraphic) && (
              <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-900 flex items-center justify-center">
                  {postData?.videoUrl ? (
                    <div className="relative w-full h-full">
                      {postData.thumbnailUrl ? (
                        <img
                          src={postData.thumbnailUrl}
                          alt="Reel Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={postData.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={previewGraphic}
                      alt={postData?.occasionName || "Post Graphic"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold border ${
                    postData?.videoUrl
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}>
                    {postData?.videoUrl ? "🎬 REEL VIDEO POST" : "🖼️ GRAPHIC POST"}
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {postData?.occasionName || postData?.template?.title || (postData?.videoUrl ? 'Reel Video Post' : 'Social Post Graphic')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {postData?.videoUrl
                      ? `${postData?.durationSeconds ? `${postData.durationSeconds}s • ` : ''}9:16 Vertical Reel`
                      : '1080×1080 HD'}
                  </p>
                </div>
              </div>
            )}

            {/* Target Platforms Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                1. Target Social Platforms
              </label>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  const isConnected = platformConnectionMap[platform.id];
                  const handleName = handleNameMap[platform.id];

                  // Video Platform Compliance Check
                  let videoWarning = null;
                  let videoSpecPill = null;
                  if (postData?.videoUrl) {
                    const dur = Number(postData?.durationSeconds) || 0;
                    const isMov = Boolean(
                      postData?.videoFormat === 'mov' ||
                      postData?.videoUrl?.toLowerCase()?.includes('.mov')
                    );
                    const sizeBytes = Number(postData?.fileSize) || 0;

                    if (platform.id === 'INSTAGRAM') {
                      videoSpecPill = '9:16 • 3s-15m • 1GB';
                      if (dur > 900) videoWarning = `Exceeds 15m (${dur}s)`;
                      else if (sizeBytes > 1024 * 1024 * 1024) videoWarning = 'Exceeds 1 GB';
                    } else if (platform.id === 'FACEBOOK') {
                      videoSpecPill = '9:16 • 3s-90s • 500MB';
                      if (isMov) videoWarning = 'Requires MP4 (no MOV)';
                      else if (dur > 90) videoWarning = `Exceeds 90s (${dur}s)`;
                      else if (sizeBytes > 500 * 1024 * 1024) videoWarning = 'Exceeds 500 MB';
                    } else if (platform.id === 'LINKEDIN') {
                      videoSpecPill = '1:1 / 16:9 / 9:16 • 10m • 200MB';
                      if (isMov) videoWarning = 'Requires MP4 (no MOV)';
                      else if (dur > 600) videoWarning = `Exceeds 10m (${dur}s)`;
                      else if (sizeBytes > 200 * 1024 * 1024) videoWarning = 'Exceeds 200 MB';
                    }
                  }

                  const hasVideoConflict = Boolean(videoWarning);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 relative ${
                        isSelected && !isConnected
                          ? "bg-rose-500/10 border-rose-500/80 text-rose-200"
                          : isSelected && hasVideoConflict
                          ? "bg-amber-500/10 border-amber-500/80 text-white shadow-sm ring-1 ring-amber-500/50"
                          : isSelected && isConnected
                          ? "bg-amber-500/10 border-amber-500 text-white shadow-sm"
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
                        {videoSpecPill && (
                          <span className="text-[8px] text-slate-400 font-mono block truncate mt-0.5">
                            {videoSpecPill}
                          </span>
                        )}
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
                        {isConnected && isSelected && videoWarning && (
                          <span className="text-[9px] text-amber-300 font-semibold block mt-1 bg-amber-500/20 px-1 py-0.5 rounded border border-amber-500/30">
                            ⚠️ {videoWarning}
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
              <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2">
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
            <div className="pt-2.5 border-t border-[#2C384E] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-3 text-xs justify-center min-h-[38px]">
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                icon={publishMode === "NOW" ? Send : Calendar}
                className="py-2 px-4 text-xs font-bold justify-center min-h-[38px]"
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
