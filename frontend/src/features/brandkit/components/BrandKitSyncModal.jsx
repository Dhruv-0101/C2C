import React, { useState } from "react";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { postApi } from "@/features/post-studio/api/post.api";
import { renderCompositeGraphicToDataUrl } from "@/features/post-studio/utils/canvasRenderer.util";

/**
 * BrandKitSyncModal Component
 * Prompts user after saving BrandKit when pending scheduled posts exist in queue.
 * Enables 1-click client-side re-rendering of all scheduled graphics with the fresh BrandKit.
 */
export const BrandKitSyncModal = ({
  isOpen,
  onClose,
  newBrandKit,
  scheduledPosts = [],
  onCompleted,
  navigate,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [statusMap, setStatusMap] = useState({}); // { [postId]: 'updating' | 'done' | 'error' }
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPosts = scheduledPosts.length;

  const handleUpdateAll = async () => {
    if (!scheduledPosts || scheduledPosts.length === 0 || !newBrandKit) return;
    setIsUpdating(true);
    setErrorMessage("");
    setProgressIndex(0);

    const newStatusMap = {};
    let errorCount = 0;

    for (let i = 0; i < scheduledPosts.length; i++) {
      const item = scheduledPosts[i];
      const targetPostId = item.post?.id || item.postId;
      setProgressIndex(i + 1);
      newStatusMap[targetPostId] = "updating";
      setStatusMap({ ...newStatusMap });

      try {
        const baseImageUrl =
          item.post?.template?.baseImageUrl ||
          item.post?.customImageUrl ||
          item.post?.finalGraphicUrl;

        const selectedFrame = item.post?.frame || null;

        let customDetails = item.post?.userConfigJson || {};
        if (typeof customDetails === "string") {
          try {
            customDetails = JSON.parse(customDetails);
          } catch (e) {
            customDetails = {};
          }
        }

        if (baseImageUrl) {
          // Re-render graphic with new BrandKit snapshot via high-res canvas
          const dataUrl = await renderCompositeGraphicToDataUrl({
            baseImageUrl,
            selectedFrame,
            brandKit: newBrandKit,
            customDetails,
          });

          if (dataUrl) {
            await postApi.updatePostGraphic(targetPostId, {
              base64Graphic: dataUrl,
              userConfigJson: customDetails,
            });
          }
        }

        newStatusMap[targetPostId] = "done";
      } catch (err) {
        console.error(`Failed to update post ${targetPostId}:`, err);
        newStatusMap[targetPostId] = "error";
        errorCount++;
      }

      setStatusMap({ ...newStatusMap });
    }

    setIsUpdating(false);
    setIsFinished(true);

    if (errorCount === 0) {
      onCompleted?.();
    } else {
      setErrorMessage(`Updated ${totalPosts - errorCount} post(s). ${errorCount} post(s) could not be re-rendered automatically.`);
      onCompleted?.();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isUpdating) {
          onClose();
        }
      }}
      title="Update Scheduled Posts?"
      size="lg"
    >
      <div className="space-y-5 p-1">
        {/* Banner header */}
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-white">
              BrandKit Saved Successfully!
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Aapki <strong className="text-amber-400 font-bold">{totalPosts} post(s)</strong> currently Scheduled Queue me publishing ke liye wait kar rahi hain.
              Kya aap in posts ki images ko naye BrandKit details (naya logo, phone number, address) ke sath auto-update karna chahte hain?
            </p>
          </div>
        </div>

        {/* Progress bar if updating */}
        {isUpdating && (
          <div className="space-y-2 p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Re-rendering graphics with new BrandKit...
              </span>
              <span className="text-slate-400 font-mono">
                {progressIndex} / {totalPosts}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                style={{
                  width: `${totalPosts > 0 ? (progressIndex / totalPosts) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Finished Success Banner */}
        {isFinished && !errorMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-bold leading-relaxed">
              🎉 All scheduled posts have been successfully re-rendered and updated with your new BrandKit! They will now publish with your latest branding.
            </p>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* List of Scheduled Posts to Update */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {scheduledPosts.map((item) => {
            const postId = item.post?.id || item.postId;
            const postTitle =
              item.post?.occasionName ||
              item.post?.template?.title ||
              item.post?.festival?.name ||
              "Scheduled Post";
            const status = statusMap[postId];

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.post?.finalGraphicUrl ? (
                    <img
                      src={item.post.finalGraphicUrl}
                      alt={postTitle}
                      className="w-11 h-11 rounded-lg object-cover border border-[#2C384E] bg-slate-950 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-900 border border-[#2C384E] flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                      Graphic
                    </div>
                  )}
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-bold text-white truncate" title={postTitle}>
                      {postTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-teal-400 shrink-0" />
                      <span>
                        {new Date(item.scheduledAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status indicator on right */}
                <div className="shrink-0">
                  {status === "updating" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Updating...
                    </span>
                  ) : status === "done" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Updated
                    </span>
                  ) : status === "error" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      Failed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono font-bold">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-[#2C384E] flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {isFinished ? (
            <Button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md"
            >
              Done & Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                onClick={onClose}
                className="w-full sm:w-auto text-xs border-[#2C384E] text-slate-400 hover:text-white"
              >
                Keep Existing Graphics
              </Button>

              {navigate && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => {
                    onClose();
                    navigate("/posts");
                  }}
                  className="w-full sm:w-auto text-xs border-[#2C384E] text-slate-300 hover:text-amber-400"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Review in Scheduled Queue
                </Button>
              )}

              <Button
                type="button"
                disabled={isUpdating || totalPosts === 0}
                onClick={handleUpdateAll}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Updating Graphics...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                    Auto-Update All Scheduled Posts
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BrandKitSyncModal;
