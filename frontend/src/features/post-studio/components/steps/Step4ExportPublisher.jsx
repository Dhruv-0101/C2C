import React from "react";
import {
  CheckCircle2,
  ChevronLeft,
  CalendarClock,
  Download,
  Lock,
  Send,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Step4ExportPublisher
 * Renders Step 4: Export & Publish with Schedule/Download sub-tabs, Option A credit indicators, and download triggers.
 */
export const Step4ExportPublisher = ({
  setCurrentStep,
  selectedFrame,
  exportTab = "schedule",
  setExportTab,
  isDownloading = false,
  setIsDownloading,
  isExpired = false,
  planName = "FREE",
  postsRemaining = 0,
  isCreditAlreadyPaid = false,
  openPlanModal,
  isRendering = false,
  activeVideo,
  onOpenPublisherModal,
  currentTemplate,
  customBaseImage,
  savePostMutation,
  isEditingScheduled = false,
  handleSaveToDb,
  handleDownloadHD,
}) => {
  return (
    <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:h-[570px] lg:min-h-[570px] lg:max-h-[570px] overflow-hidden shrink-0 gap-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Step 4: Export & Publish</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            Schedule post to social platforms or download HD PNG.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep(selectedFrame ? 3 : 2)} className="min-h-[34px]">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
      </div>

      {/* Step 4 Sub-Tabs Ribbon */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0F17] rounded-xl border border-[#2C384E] shrink-0">
        <button
          type="button"
          onClick={() => setExportTab("schedule")}
          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
            exportTab === "schedule"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Schedule Post</span>
        </button>
        <button
          type="button"
          onClick={() => setExportTab("download")}
          className={`py-2 px-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
            exportTab === "download"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Download HD</span>
        </button>
      </div>

      {/* Scrollable Step 4 Body (Flex Fill Viewport Height) */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1 space-y-3">
        {/* Active Plan Quota Box */}
        <div
          className={`p-3 rounded-xl border space-y-1.5 text-xs ${
            isExpired
              ? "bg-red-500/10 border-red-500/40 text-red-300"
              : "bg-[#0B0F17] border-[#2C384E]"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Active Plan:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase">
              {planName} PLAN
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-semibold">Posts Quota Remaining:</span>
            <span
              className={`font-mono font-extrabold ${
                isExpired ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {postsRemaining} Posts Left
            </span>
          </div>

          {/* Option A: Paid Post Credit Banner */}
          {isCreditAlreadyPaid ? (
            <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Post Paid via AI Generation (0 extra credits on export)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                PAID DRAFT
              </span>
            </div>
          ) : isExpired ? (
            <div className="pt-2 border-t border-red-500/30 flex items-center justify-between">
              <span className="text-[11px] text-red-400 font-bold">⚠️ Plan Quota Exhausted</span>
              <button
                type="button"
                onClick={openPlanModal}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
              >
                Purchase Plan
              </button>
            </div>
          ) : null}
        </div>

        {/* Compositing Loading Overlay / Banner */}
        {isRendering && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
            <span>Compositing 1080×1080 HD graphic... Please wait.</span>
          </div>
        )}

        {/* TAB 1: SCHEDULE POST */}
        {exportTab === "schedule" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <CalendarClock className="w-4 h-4" />
                <span>Automated Queue Publishing</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Schedule this graphic to publish automatically at peak audience engagement times or upcoming festival dates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="primary"
                icon={!isCreditAlreadyPaid && isExpired ? Lock : Send}
                disabled={(isRendering && !activeVideo?.videoUrl) || (!isCreditAlreadyPaid && isExpired)}
                onClick={() => onOpenPublisherModal && onOpenPublisherModal("NOW")}
                className="w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white shadow-lg min-h-[44px]"
              >
                {activeVideo?.videoUrl ? "🚀 Publish Reel Now" : "🚀 Publish Now"}
              </Button>

              <Button
                type="button"
                variant="primary"
                icon={!isCreditAlreadyPaid && isExpired ? Lock : (isRendering && !activeVideo?.videoUrl ? Loader2 : CalendarClock)}
                disabled={(isRendering && !activeVideo?.videoUrl) || (!isCreditAlreadyPaid && isExpired)}
                onClick={() => onOpenPublisherModal && onOpenPublisherModal("SCHEDULE")}
                className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 border-0 shadow-lg min-h-[44px] ${
                  !isCreditAlreadyPaid && isExpired
                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-500 to-amber-500 text-slate-950"
                }`}
              >
                {isRendering && !activeVideo?.videoUrl
                  ? "Rendering HD Graphic..."
                  : !isCreditAlreadyPaid && isExpired
                  ? "🔒 Upgrade Plan to Schedule"
                  : activeVideo?.videoUrl
                  ? "📅 Schedule Reel for Later"
                  : "📅 Schedule for Later"}
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: DOWNLOAD HD */}
        {exportTab === "download" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Resolution & Specs:</span>
                <span className="text-emerald-400 font-bold font-mono">1080 × 1080 Square PNG</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Base Graphic:</span>
                <span className="text-white font-bold truncate max-w-[200px] text-right">
                  {currentTemplate?.title || (customBaseImage ? "Custom Graphic" : "No Template (Clean Canvas)")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Brand Overlay:</span>
                <span className="text-amber-400 font-bold truncate max-w-[200px] text-right">
                  {selectedFrame?.title || "No Frame"}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                variant="primary"
                icon={!isCreditAlreadyPaid && isExpired && !isEditingScheduled ? Lock : (isDownloading || savePostMutation?.isPending || isRendering ? Loader2 : Download)}
                disabled={isRendering || isDownloading || savePostMutation?.isPending || (!isCreditAlreadyPaid && isExpired && !isEditingScheduled)}
                onClick={async () => {
                  if (!isCreditAlreadyPaid && isExpired && !isEditingScheduled && postsRemaining <= 0) {
                    openPlanModal && openPlanModal();
                    return;
                  }
                  if (isEditingScheduled) {
                    handleSaveToDb && handleSaveToDb();
                    return;
                  }
                  setIsDownloading && setIsDownloading(true);
                  try {
                    await handleDownloadHD();
                  } finally {
                    setTimeout(() => setIsDownloading && setIsDownloading(false), 800);
                  }
                }}
                className={`w-full justify-center text-xs sm:text-sm font-extrabold py-3.5 border-0 shadow-lg cursor-pointer min-h-[44px] ${
                  !isCreditAlreadyPaid && isExpired && !isEditingScheduled
                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950"
                }`}
              >
                {isRendering
                  ? "Rendering 1080×1080 Graphic..."
                  : isDownloading || savePostMutation?.isPending
                    ? "Downloading & Saving to Vault..."
                    : isEditingScheduled
                      ? "Update Scheduled Post Graphic"
                      : !isCreditAlreadyPaid && isExpired
                        ? "🔒 Upgrade Plan to Download"
                        : "Download HD PNG & Save to Vault"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#2C384E] shrink-0 mt-auto">
        <Button variant="outline" size="sm" onClick={() => setCurrentStep(selectedFrame ? 3 : 2)} className="min-h-[34px]">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
        </Button>
      </div>
    </Card>
  );
};
