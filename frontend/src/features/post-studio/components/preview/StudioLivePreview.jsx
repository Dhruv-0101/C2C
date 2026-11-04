import React from "react";
import {
  Zap,
  Sparkles,
  Film,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CanvasPreview } from "../CanvasPreview";

/**
 * StudioLivePreview
 * Sticky 1080x1080 HD composited canvas stage & 9:16 vertical video reel simulator.
 */
export const StudioLivePreview = ({
  mobileStudioTab = "editor",
  activeVideo = null,
  livePreviewVideoRef,
  isSimulatorPlaying = true,
  isSimulatorMuted = true,
  setIsSimulatorMuted,
  handleToggleSimulatorPlayback,
  brandKit,
  customDetails,
  canvasRef,
  isRendering = false,
}) => {
  return (
    <div
      className={`lg:col-span-6 flex flex-col gap-3.5 lg:sticky lg:top-20 lg:self-start z-10 transition-all ${
        mobileStudioTab === "editor" ? "hidden lg:flex" : "flex"
      }`}
    >
      <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between shrink-0 gap-2.5 shadow-2xl">
        {/* Header matching Left Wizard Steps */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="truncate">Live Preview</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              1080×1080 HD composited view.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1080×1080 HD</span>
            </span>
          </div>
        </div>

        {/* Live Preview (9:16 Vertical Reel Simulator or Square Canvas Box) */}
        {activeVideo?.videoUrl ? (
          <div className="relative flex flex-col items-center justify-center p-2 min-h-[440px] bg-gradient-to-b from-slate-950/80 to-slate-900/90 rounded-2xl border border-slate-800">
            {/* Smartphone Bezel - Clicking toggles video play/pause */}
            <div
              onClick={handleToggleSimulatorPlayback}
              className="group/phone relative w-[260px] sm:w-[280px] aspect-[9/16] rounded-[32px] border-[5px] border-slate-700/80 bg-black overflow-hidden shadow-2xl flex flex-col justify-between cursor-pointer select-none"
              title={isSimulatorPlaying ? "Click anywhere to pause video" : "Click anywhere to play video"}
            >
              {/* Top Dynamic Island Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-900 rounded-full z-20 flex items-center justify-center pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>

              {/* Reel Video Player */}
              <video
                ref={livePreviewVideoRef}
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnailUrl}
                playsInline
                loop
                autoPlay
                muted={isSimulatorMuted}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Semi-transparent gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

              {/* Center Play Overlay Indicator when Paused */}
              {!isSimulatorPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-14 h-14 rounded-full bg-black/75 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-150">
                    <Play className="w-6 h-6 ml-1 text-white fill-white" />
                  </div>
                </div>
              )}

              {/* Hover Pause Cue for Desktop Users */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/phone:opacity-100 transition-opacity z-20">
                {isSimulatorPlaying && (
                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-semibold flex items-center gap-1.5 shadow-lg">
                    <Pause className="w-3.5 h-3.5 fill-white" />
                    <span>Click to pause</span>
                  </div>
                )}
              </div>

              {/* Top Bar UI */}
              <div className="relative z-10 flex items-center justify-between p-3 text-white text-xs font-bold pt-6 pointer-events-auto">
                <span className="flex items-center gap-1 text-[11px] font-extrabold tracking-wide">
                  <Film className="w-3.5 h-3.5 text-pink-400" />
                  <span>Reels</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSimulatorMuted && setIsSimulatorMuted((prev) => !prev);
                    }}
                    className="p-1 rounded-full bg-black/50 hover:bg-black/80 text-white/90 transition border border-white/10"
                    title={isSimulatorMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isSimulatorMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-pink-400" />}
                  </button>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-pink-500/30 border border-pink-400/40 text-pink-200 uppercase font-mono">
                    Meta Preview
                  </span>
                </div>
              </div>

              {/* Right Action Bar (Simulated Instagram/FB Reels Actions) */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-2.5 bottom-16 z-10 flex flex-col items-center gap-3 text-white pointer-events-auto"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition cursor-pointer">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  </div>
                  <span className="text-[9px] font-bold">1.4k</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition cursor-pointer">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[9px] font-bold">86</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition cursor-pointer">
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>

                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition cursor-pointer">
                  <Bookmark className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Bottom Creator & Caption Info */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 p-3 pb-3 space-y-1.5 text-white pointer-events-auto"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 border border-white p-0.5 shrink-0 flex items-center justify-center text-[10px] font-extrabold text-slate-950">
                    {brandKit?.brandName ? brandKit.brandName[0].toUpperCase() : "B"}
                  </div>
                  <span className="text-[11px] font-extrabold truncate max-w-[130px]">
                    @{brandKit?.brandName ? brandKit.brandName.toLowerCase().replace(/\s+/g, "") : "yourbusiness"}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold border border-white/40 text-white">
                    Follow
                  </span>
                </div>

                <p className="text-[10px] text-slate-200 line-clamp-2 leading-tight">
                  {customDetails?.caption || activeVideo.fileName?.replace(/\.[^/.]+$/, "") || "Watch our latest updates! #brandflow #reels"}
                </p>

                <div className="flex items-center gap-1 text-[9px] text-slate-300 font-medium">
                  <Music2 className={`w-2.5 h-2.5 text-pink-400 ${isSimulatorPlaying ? "animate-spin" : ""}`} />
                  <span className="truncate max-w-[170px]">Original Audio • {brandKit?.brandName || "BrandFlow"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CanvasPreview canvasRef={canvasRef} isRendering={isRendering} />
        )}

        {/* Live Preview Canvas Footer Status Bar */}
        <div className="mt-auto shrink-0 pt-2 border-t border-[#2C384E] w-full flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                activeVideo?.videoUrl
                  ? isSimulatorPlaying
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-amber-400"
                  : "bg-emerald-400 animate-pulse"
              }`}
            />
            <span className="font-semibold text-slate-300">
              {activeVideo?.videoUrl
                ? isSimulatorPlaying
                  ? "Live 9:16 Reel Simulator"
                  : "Live 9:16 Reel Simulator (Paused)"
                : "Live HD Compositor"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeVideo?.videoUrl && (
              <button
                type="button"
                onClick={handleToggleSimulatorPlayback}
                className="text-[11px] font-medium text-pink-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition cursor-pointer"
              >
                {isSimulatorPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isSimulatorPlaying ? "Pause Video" : "Play Video"}</span>
              </button>
            )}
            <span className="text-[11px] font-mono text-slate-400">
              {activeVideo?.videoUrl ? "9:16 • Vertical Reel (MP4)" : "1080×1080 • Square PNG"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
