import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Download, X } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * ImageLightbox
 * Reusable full-screen high-resolution image modal lightbox.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the lightbox modal is currently visible.
 * @param {Object} props.item - Image item object containing graphicUrl/baseImageUrl, title/occasionName, categoryName.
 * @param {Function} props.onClose - Callback function triggered to close the lightbox.
 * @param {Function} [props.onDownload] - Optional callback function to trigger high-res PNG download.
 */
export const ImageLightbox = ({ isOpen, item, onClose, onDownload }) => {
  // Listen for ESC key press to close lightbox automatically
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const imageUrl = item.graphicUrl || item.baseImageUrl || item.url;
  const title = item.occasionName || item.title || "Social Graphic";
  const category = item.categoryName || item.festival?.name || item.category || "General";

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-lg animate-in fade-in duration-200 select-none cursor-zoom-out"
    >
      {/* Center Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[68vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2C384E] bg-[#0B0F17] flex items-center justify-center my-auto mb-20 cursor-default"
      >
        <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
      </div>

      {/* Lightbox Bottom Details & Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-5 left-4 right-4 max-w-4xl mx-auto flex items-center justify-between z-10 bg-[#131B2A]/95 backdrop-blur-xl px-6 py-3.5 rounded-2xl border border-[#2C384E] shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-white truncate max-w-md">
              {title}
            </h3>
            <p className="text-xs text-slate-400 truncate">Category: {category}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onDownload && (
            <Button
              variant="primary"
              icon={Download}
              onClick={() => onDownload(imageUrl, title)}
              className="py-1.5 text-xs font-bold"
            >
              Download HD
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close Full Screen View"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
