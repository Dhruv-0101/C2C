import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Download, X, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/shared/hooks';

/**
 * ImageLightbox
 * Reusable full-screen high-resolution image modal lightbox with caption inspector.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen] - Whether the lightbox modal is currently visible.
 * @param {Object|string} [props.item] - Image item object or URL string.
 * @param {string} [props.imageUrl] - Direct image URL prop fallback.
 * @param {Function} props.onClose - Callback function triggered to close the lightbox.
 * @param {Function} [props.onDownload] - Optional callback function to trigger high-res PNG download.
 */
export const ImageLightbox = ({ isOpen, item, imageUrl: directUrl, onClose, onDownload }) => {
  const [copied, setCopied] = useState(false);
  const { isDark } = useTheme();

  const activeUrl =
    directUrl ||
    (typeof item === "string" ? item : null) ||
    item?.post?.finalGraphicUrl ||
    item?.finalGraphicUrl ||
    item?.graphicUrl ||
    item?.baseImageUrl ||
    item?.url;

  const isVisible = isOpen !== undefined ? isOpen : Boolean(activeUrl);

  // Lock background body scroll when open & listen for ESC key
  useEffect(() => {
    if (!isVisible) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !activeUrl) return null;

  const title =
    (typeof item === "object" && (item?.post?.occasionName || item?.occasionName || item?.title || item?.name)) ||
    "High-Resolution Branded Graphic";
  const category =
    (typeof item === "object" && (item?.post?.category?.name || item?.post?.festival?.name || item?.categoryName || item?.category?.name || item?.festival?.name)) ||
    "1080x1080 Square Post";

  const captionText =
    (typeof item === "object" &&
      (item?.caption ||
        item?.captions?.[0]?.captionText ||
        item?.post?.caption ||
        item?.post?.captions?.[0]?.captionText)) ||
    "";

  const rawHashtags =
    (typeof item === "object" &&
      (item?.hashtags ||
        item?.captions?.[0]?.hashtags ||
        item?.post?.hashtags ||
        item?.post?.captions?.[0]?.hashtags)) ||
    [];

  const hashtags = Array.isArray(rawHashtags) ? rawHashtags : [];

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload(activeUrl, title);
    } else {
      const link = document.createElement("a");
      link.href = activeUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, "-")}-1080x1080.png`;
      link.target = "_blank";
      link.click();
    }
  };

  const handleCopyCaption = () => {
    const fullText =
      hashtags.length > 0
        ? `${captionText}\n\n${hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`
        : captionText;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      onClick={onClose}
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
          onClick={onClose}
          className="p-2.5 rounded-full border transition cursor-pointer shadow-xl"
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

      {/* Center Image Container - 100% Uncropped & Uncovered View */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 w-full flex items-center justify-center py-2 sm:py-3 cursor-default"
      >
        <div
          className="h-full max-h-full max-w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50 flex items-center justify-center"
          style={{
            backgroundColor: isDark ? "#0B0F17" : "#FFFFFF",
          }}
        >
          <img
            src={activeUrl}
            alt={title}
            className="w-full h-full object-contain"
            style={{
              backgroundColor: isDark ? "#0B0F17" : "#FFFFFF",
            }}
          />
        </div>
      </div>

      {/* Lightbox Bottom Details & Action Control Bar */}
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
              {title}
            </h3>
            <p
              className="text-xs truncate mt-0.5"
              style={{
                color: isDark ? "#94A3B8" : "#64748B",
              }}
            >
              {category}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              icon={Download}
              onClick={handleDownloadClick}
              className="py-1.5 px-3 sm:px-4 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 border-0"
            >
              Download HD PNG
            </Button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer"
              style={{
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderColor: isDark ? "#334155" : "#E2E8F0",
                color: isDark ? "#E2E8F0" : "#334155",
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Caption & Copy Section if present */}
        {captionText && (
          <div
            className="p-2.5 rounded-xl border space-y-1.5"
            style={{
              backgroundColor: isDark ? "#0B0F17" : "#F8FAFC",
              borderColor: isDark ? "#2C384E" : "#E2E8F0",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 font-mono flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>Post Caption & Copy</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition cursor-pointer"
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#CBD5E1",
                  color: isDark ? "#E2E8F0" : "#334155",
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Caption</span>
                  </>
                )}
              </button>
            </div>
            <p
              className="text-xs leading-relaxed max-h-20 sm:max-h-24 overflow-y-auto custom-scrollbar whitespace-pre-wrap select-text pr-1"
              style={{
                color: isDark ? "#CBD5E1" : "#334155",
              }}
            >
              {captionText}
            </p>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-500/20"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ImageLightbox;
