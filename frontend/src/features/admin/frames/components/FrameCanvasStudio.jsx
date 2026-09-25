import React from 'react';
import { Card } from '@/components/ui/Card';

/**
 * FrameCanvasStudio Component
 * Frame visual preview card for canvas blueprints.
 */
export const FrameCanvasStudio = ({ frame, width = 400, height = 400 }) => {
  return (
    <Card className="p-4 bg-[#131B2A] border-[#2C384E] flex items-center justify-center">
      <div
        className="relative bg-slate-900 border border-dashed border-slate-700 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ width, height }}
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
