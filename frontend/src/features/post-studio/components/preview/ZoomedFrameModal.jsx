import React from "react";
import { createPortal } from "react-dom";
import { Maximize2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * ZoomedFrameModal
 * High-Res 1080x1080 Frame Lightbox Modal with slot inspection badges.
 */
export const ZoomedFrameModal = ({
  zoomedFrame,
  setZoomedFrame,
  setSelectedFrame,
  isDark = true,
}) => {
  if (!zoomedFrame) return null;

  return createPortal(
    <div
      onClick={() => setZoomedFrame(null)}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none overflow-hidden touch-none cursor-zoom-out"
    >
      {/* Top Header Controls Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0 z-10 pointer-events-auto">
        <div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xl"
          style={{
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark ? "#334155" : "#CBD5E1",
            color: isDark ? "#FFFFFF" : "#0F172A",
          }}
        >
          <Maximize2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>High-Res 1080x1080 Graphic Preview</span>
        </div>

        <button
          onClick={() => setZoomedFrame(null)}
          className="p-2.5 rounded-full border transition cursor-pointer shadow-xl min-w-[36px] min-h-[36px] flex items-center justify-center"
          style={{
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)",
            borderColor: isDark ? "#334155" : "#CBD5E1",
            color: isDark ? "#CBD5E1" : "#475569",
          }}
          title="Close Lightbox (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 w-full flex items-center justify-center p-3 sm:p-4 cursor-default overflow-hidden"
      >
        <img
          src={zoomedFrame.previewUrl || zoomedFrame.overlayPngUrl}
          alt={zoomedFrame.title}
          className="max-h-full max-w-full aspect-square rounded-2xl shadow-2xl border-2 border-amber-500/80 object-contain block shrink-0 select-none"
          style={{
            backgroundColor: isDark ? "#0B0F17" : "#FFFFFF",
          }}
        />
      </div>

      {/* Lightbox Complete Frame Details & Actions Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-auto z-10 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border shadow-2xl space-y-2.5 shrink-0 cursor-default"
        style={{
          backgroundColor: isDark ? "rgba(19, 27, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
          borderColor: isDark ? "#2C384E" : "#CBD5E1",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="truncate pr-2">
            <h3
              className="font-heading font-extrabold text-sm sm:text-base truncate"
              style={{
                color: isDark ? "#FFFFFF" : "#0F172A",
              }}
            >
              {zoomedFrame.title}
            </h3>
            <p
              className="text-xs truncate mt-0.5"
              style={{
                color: isDark ? "#94A3B8" : "#64748B",
              }}
            >
              {zoomedFrame.description || "Customizable Brand Frame Overlay"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomedFrame(null)}
              className="text-xs"
              style={{
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#CBD5E1",
                color: isDark ? "#E2E8F0" : "#334155",
              }}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => {
                setSelectedFrame(zoomedFrame);
                setZoomedFrame(null);
              }}
              className="text-xs font-extrabold bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg px-4"
            >
              Select & Apply This Frame
            </Button>
          </div>
        </div>

        {/* Supported Slot Badges */}
        {(() => {
          let rawCfg = zoomedFrame.configJson;
          if (typeof rawCfg === "string") {
            try {
              rawCfg = JSON.parse(rawCfg);
            } catch (e) {}
          }
          const elements = Array.isArray(rawCfg)
            ? rawCfg
            : rawCfg?.elements && Array.isArray(rawCfg.elements)
            ? rawCfg.elements
            : [];

          const hasLogo = elements.some(
            (el) => el.dynamicSlot === "LOGO_BOX" || el.fieldKey === "logoUrl"
          );
          const hasAvatar = elements.some(
            (el) => el.dynamicSlot === "AVATAR_CIRCLE" || el.fieldKey === "avatarUrl"
          );
          const hasPhone = elements.some(
            (el) => el.dynamicSlot === "PHONE" || el.dynamicSlot === "WHATSAPP"
          );
          const hasAddress = elements.some((el) => el.dynamicSlot === "ADDRESS");
          const hasSocial = elements.some((el) =>
            ["INSTAGRAM", "FACEBOOK", "LINKEDIN"].includes(el.dynamicSlot)
          );
          const hasUpi = elements.some(
            (el) => el.dynamicSlot === "UPI_QR" || el.dynamicSlot === "UPI_VPA"
          );

          const badgeStyle = {
            backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
            borderColor: isDark ? "#2C384E" : "#E2E8F0",
            color: isDark ? "#CBD5E1" : "#475569",
          };

          return (
            <div
              className="flex flex-wrap items-center gap-1.5 text-[11px] pt-2 border-t"
              style={{ borderColor: isDark ? "rgba(44, 56, 78, 0.7)" : "#E2E8F0" }}
            >
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold">
                ✓ 1080×1080 HD Square Overlay
              </span>
              {hasLogo && (
                <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                  🖼️ Brand Logo
                </span>
              )}
              {hasAvatar && (
                <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                  👤 Owner Portrait
                </span>
              )}
              {hasPhone && (
                <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                  📞 Phone & WhatsApp
                </span>
              )}
              {hasAddress && (
                <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                  📍 Store Address
                </span>
              )}
              {hasSocial && (
                <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                  📱 Social Handles
                </span>
              )}
              {hasUpi && (
                <span className="px-2 py-0.5 rounded-lg border" style={badgeStyle}>
                  💳 UPI QR / Payment
                </span>
              )}
            </div>
          );
        })()}
      </div>
    </div>,
    document.body
  );
};
