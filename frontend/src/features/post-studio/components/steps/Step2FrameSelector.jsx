import React from "react";
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";

/**
 * Step2FrameSelector
 * Renders Step 2: Choose Brand Frame, frame search, grid selection, and pagination.
 */
export const Step2FrameSelector = ({
  setCurrentStep,
  selectedFrame,
  setSelectedFrame,
  frames = [],
  framesMeta,
  isLoadingFrames = false,
  frameSearch = "",
  setFrameSearch,
  framePage = 1,
  setFramePage,
  frameLimit = 8,
  setFrameLimit,
  setZoomedFrame,
}) => {
  return (
    <Card className="p-3.5 sm:p-5 bg-[#131B2A] border-[#2C384E] flex flex-col justify-between min-h-[500px] lg:min-h-[570px] gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#2C384E] pb-2.5 shrink-0">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2 truncate">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Step 2: Frame</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            Choose brand overlay or template only.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="min-h-[36px]">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCurrentStep(selectedFrame ? 3 : 4)}
            className="shadow-lg font-bold min-h-[36px]"
          >
            <span>{selectedFrame ? "Next: Details" : "Next: Export"}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* No Frame Quick Toggle Option (Saves grid space) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1 rounded-full shrink-0 ${selectedFrame === null ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
            {selectedFrame === null ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-200 truncate">
              {selectedFrame === null ? "No Frame Selected (Template Only)" : `Selected: ${selectedFrame.title}`}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {selectedFrame === null ? "Base graphic image will be exported without frame overlays." : "Brand overlay will be composited on graphic."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedFrame(selectedFrame === null ? (frames[0] || null) : null)}
          className={`w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer min-h-[34px] ${
            selectedFrame === null
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
              : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
          }`}
        >
          {selectedFrame === null ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Frame Active</span>
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Remove Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Brand Frame Search Bar */}
      <div className="relative shrink-0">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search brand frames by title..."
          value={frameSearch}
          onChange={(e) => {
            setFrameSearch && setFrameSearch(e.target.value);
            setFramePage && setFramePage(1);
          }}
          className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
        />
        {frameSearch && (
          <button
            type="button"
            onClick={() => {
              setFrameSearch && setFrameSearch("");
              setFramePage && setFramePage(1);
            }}
            className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Scrollable Frame Grid Viewport (Flex Fill Viewport Height) */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar my-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {isLoadingFrames ? (
            <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading brand frames...</div>
          ) : frames.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
              {frameSearch ? `No custom brand frames matching "${frameSearch}".` : "No custom brand frames created yet."}
            </div>
          ) : (
            frames.map((frame) => (
              <div key={frame.id} className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFrame(frame);
                    setZoomedFrame && setZoomedFrame(frame);
                  }}
                  className={`relative aspect-square rounded-xl border p-1.5 overflow-hidden transition group flex flex-col items-center justify-center ${
                    selectedFrame?.id === frame.id
                      ? "border-amber-500 bg-gradient-to-b from-amber-500/20 to-[#131B2A] ring-2 ring-amber-500/50 shadow-glow"
                      : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                  }`}
                  title="Click to select and preview frame"
                >
                  <div className="w-full h-full bg-[#0B0F17] overflow-hidden rounded-lg flex items-center justify-center">
                    {(frame.previewUrl || frame.overlayPngUrl) ? (
                      <img
                        src={frame.previewUrl || frame.overlayPngUrl}
                        alt={frame.title}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm shadow-md">
                          {frame.title?.substring(0, 2).toUpperCase() || "FR"}
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Complete Frame Details BELOW the frame image box */}
                <div className="text-center px-1">
                  <p className="text-xs font-bold text-slate-200 truncate" title={frame.title}>
                    {frame.title}
                  </p>
                  {frame.description && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5" title={frame.description}>
                      {frame.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {framesMeta && (
        <div className="mt-auto pt-2 border-t border-[#2C384E] shrink-0">
          <Pagination
            meta={framesMeta}
            currentPage={framePage}
            totalPages={framesMeta?.totalPages || 1}
            onPageChange={(p) => setFramePage(p)}
            onLimitChange={(l) => {
              setFrameLimit && setFrameLimit(l);
              setFramePage && setFramePage(1);
            }}
            pageSizeOptions={[6, 8, 12, 24]}
            className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 px-3 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs text-slate-300 shadow-sm mt-1"
          />
        </div>
      )}
    </Card>
  );
};
