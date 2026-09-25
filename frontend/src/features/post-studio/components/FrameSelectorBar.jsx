import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

/**
 * FrameSelectorBar Component
 * Horizontal scrolling quick brand frame switcher bar.
 */
export const FrameSelectorBar = ({ frames = [], selectedFrameId, onSelectFrame }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 custom-scrollbar">
      <button
        type="button"
        onClick={() => onSelectFrame(null)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border shrink-0 ${
          !selectedFrameId
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-sm ring-1 ring-amber-500/40'
            : 'bg-[#131B2A] text-slate-400 border-[#2C384E] hover:text-white hover:border-slate-600'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>No Frame</span>
        {!selectedFrameId && <CheckCircle2 className="w-3 h-3 text-amber-400 ml-0.5" />}
      </button>

      {frames.map((frame) => {
        const isSelected = selectedFrameId === frame.id;
        return (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelectFrame(frame)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border shrink-0 ${
              isSelected
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-sm ring-1 ring-amber-500/40'
                : 'bg-[#131B2A] text-slate-400 border-[#2C384E] hover:text-white hover:border-slate-600'
            }`}
          >
            <span>{frame.title || frame.name}</span>
            {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
};

export default FrameSelectorBar;
