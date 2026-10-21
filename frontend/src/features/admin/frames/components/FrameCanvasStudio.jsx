import React from 'react';
import { Card } from '@/components/ui/Card';

/**
 * FrameCanvasStudio Component
 * Frame visual preview card for canvas blueprints.
 */
export const FrameCanvasStudio = ({ frame, width = 400, height = 400 }) => {
  return (
    <Card className="p-3 sm:p-4 bg-[#131B2A] border-[#2C384E] flex items-center justify-center">
      <div
        className="relative bg-slate-900 border-2 border-amber-500/80 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center aspect-square w-full max-w-[400px]"
      >
        {frame?.previewUrl ? (
          <img src={frame.previewUrl} alt={frame.name || 'Frame Preview'} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center p-4 text-xs text-slate-500 italic">
            Frame Canvas Studio Preview
          </div>
        )}
      </div>
    </Card>
  );
};

export default FrameCanvasStudio;
