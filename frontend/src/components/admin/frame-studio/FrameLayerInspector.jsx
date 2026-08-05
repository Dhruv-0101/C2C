import React from 'react';
import { Type, Square, Sliders, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Input } from '../../ui/Input';

/**
 * Modular Frame Layer Inspector Component
 */
export function FrameLayerInspector({
  layers,
  selectedLayerId,
  setSelectedLayerId,
  updateSelectedLayer,
  moveLayerOrder,
  deleteLayer,
}) {
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="space-y-6">
      {/* Layer List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            Layer Stack Inspector
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">{layers.length} Layers</span>
        </div>

        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {layers.map((layer, idx) => (
            <div
              key={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                selectedLayerId === layer.id
                  ? 'bg-amber-500/10 border-amber-500 text-white font-bold'
                  : 'bg-[#0B0F17] border-[#2C384E] text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {layer.type === 'text' ? (
                  <Type className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                )}
                <span className="truncate">{layer.text || layer.name || `Layer ${idx + 1}`}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayerOrder(layer.id, 'up');
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Move Up"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveLayerOrder(layer.id, 'down');
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Move Down"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayer(layer.id);
                  }}
                  className="p-1 hover:bg-rose-500/20 text-rose-400 rounded"
                  title="Delete Layer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Layer Property Controls */}
      {selectedLayer && (
        <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-4">
          <h4 className="text-xs font-bold text-slate-200 border-b border-[#2C384E] pb-2">
            Selected Layer Settings
          </h4>

          {selectedLayer.type === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Text Content</label>
                <Input
                  type="text"
                  value={selectedLayer.text || ''}
                  onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                  className="py-1.5 text-xs bg-[#131B2A] border-[#2C384E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Font Size (px)</label>
                  <Input
                    type="number"
                    value={selectedLayer.fontSize || 24}
                    onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                    className="py-1.5 text-xs bg-[#131B2A] border-[#2C384E]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedLayer.color || '#FFFFFF'}
                    onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                    className="w-full h-8 rounded bg-[#131B2A] border border-[#2C384E] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Opacity</span>
              <span>{Math.round((selectedLayer.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={selectedLayer.opacity ?? 1}
              onChange={(e) => updateSelectedLayer({ opacity: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
