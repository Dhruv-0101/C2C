import React from 'react';

/**
 * Modular Frame Canvas Stage Component
 */
export function FrameCanvasStage({ canvasRef, selectedPresetName }) {
  return (
    <div className="bg-[#0B0F17] rounded-2xl border border-[#2C384E] p-6 flex flex-col items-center justify-center relative shadow-inner overflow-hidden min-h-[520px]">
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#131B2A]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2C384E] text-[11px] text-slate-300 z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Stage: Plain White Overlay Stage (1080 × 1080)</span>
      </div>

      <div className="relative shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-700 bg-white">
        <canvas ref={canvasRef} width={1080} height={1080} className="w-[420px] h-[420px] block" />
      </div>

      <p className="text-[11px] text-slate-400 mt-4 text-center">
        Active Blueprint: <span className="text-amber-400 font-bold">{selectedPresetName}</span>
      </p>
    </div>
  );
}
