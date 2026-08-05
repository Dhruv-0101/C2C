import React from 'react';
import { Sparkles, Trash2, Check } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Modular Frame Presets Drawer Component
 */
export function FramePresetsDrawer({
  canvaPresets,
  selectedPresetId,
  handleSelectPreset,
  dbFrames,
  deleteFrameMutation,
}) {
  return (
    <div className="space-y-6">
      {/* Canva Master Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Master Vector Blueprint Presets
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">{canvaPresets.length} Presets</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {canvaPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                selectedPresetId === preset.id
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-[#0B0F17] border-[#2C384E] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold truncate pr-2">{preset.name}</span>
                {selectedPresetId === preset.id && (
                  <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cloud DB Published Frames */}
      {dbFrames && dbFrames.length > 0 && (
        <div className="border-t border-[#2C384E] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Published Database Frames
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{dbFrames.length} Active</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {dbFrames.map((frame) => (
              <div
                key={frame.id}
                className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {frame.overlayPngUrl && (
                    <img
                      src={frame.overlayPngUrl}
                      alt={frame.title}
                      className="w-8 h-8 rounded-lg bg-slate-900 object-cover border border-slate-700 flex-shrink-0"
                    />
                  )}
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{frame.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{frame.description || 'Custom Frame'}</p>
                  </div>
                </div>

                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={() => deleteFrameMutation.mutate(frame.id)}
                  disabled={deleteFrameMutation.isPending}
                  className="px-2 py-1 text-[10px] hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
