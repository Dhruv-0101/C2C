import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Download, X } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * ImageLightbox
 * Reusable full-screen high-resolution image modal lightbox.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen] - Whether the lightbox modal is currently visible.
 * @param {Object|string} [props.item] - Image item object or URL string.
 * @param {string} [props.imageUrl] - Direct image URL prop fallback.
 * @param {Function} props.onClose - Callback function triggered to close the lightbox.
 * @param {Function} [props.onDownload] - Optional callback function to trigger high-res PNG download.
 */
export const ImageLightbox = ({ isOpen, item, imageUrl: directUrl, onClose, onDownload }) => {
  const activeUrl =
    directUrl ||
    (typeof item === "string" ? item : null) ||
    item?.graphicUrl ||
    item?.finalGraphicUrl ||
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
    (typeof item === "object" && (item?.occasionName || item?.title || item?.customText)) ||
    "High-Resolution Branded Graphic";
  const category =
    (typeof item === "object" && (item?.categoryName || item?.category?.name || item?.festival?.name)) ||
    "1080x1080 Square Post";

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

  return createPortal(
    <div
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-hidden touch-none cursor-zoom-out"
    >
      {/* Top Header Controls Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0 z-10 pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-white text-xs font-bold shadow-xl">
          <Maximize2 className="w-4 h-4 text-amber-400" />
          <span>High-Res 1080x1080 Graphic Preview</span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer shadow-xl"
          title="Close Lightbox (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Image Container - 100% Uncropped & Uncovered View */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 min-h-0 w-full flex items-center justify-center py-3 cursor-default"
      >
        <div className="h-full max-h-full max-w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-[#0B0F17] flex items-center justify-center">
          <img
            src={activeUrl}
            alt={title}
            className="w-full h-full object-contain bg-[#0B0F17]"
          />
        </div>
      </div>

      {/* Lightbox Bottom Details & Action Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0 z-10 bg-[#131B2A]/95 backdrop-blur-xl px-5 py-3 rounded-2xl border border-[#2C384E] shadow-2xl"
      >
        <div className="truncate pr-4">
          <h3 className="font-heading font-extrabold text-sm text-white truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">{category}</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            icon={Download}
            onClick={handleDownloadClick}
            className="py-2 px-4 text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 border-0"
          >
            Download HD PNG
          </Button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

