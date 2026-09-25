import React from 'react';

/**
 * CanvasPreview Component
 * Dedicated preview viewport for HD 1080x1080 canvas compositing with loading overlay.
 */
export const CanvasPreview = ({ canvasRef, isRendering = false, className = '' }) => {
  return (
    <div
      className={`relative aspect-square w-full max-w-[370px] max-h-[370px] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center my-auto mx-auto shrink-0 ${className}`}
    >
      {isRendering && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-amber-400 text-xs font-semibold space-y-2">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          <span>Compositing 1080x1080 HD Canvas...</span>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};

export default CanvasPreview;
