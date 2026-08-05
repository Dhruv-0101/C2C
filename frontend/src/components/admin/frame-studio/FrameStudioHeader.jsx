import React from 'react';
import { Layers, Plus, Sparkles, Wand2, Upload, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

/**
 * Modular Frame Studio Header Component
 */
export function FrameStudioHeader({
  activeTab,
  setActiveTab,
  frameSearch,
  setFrameSearch,
  handleDownloadCanvasOverlay,
  isCompiling,
  setIsUploadModalOpen,
  CANVA_PRESETS_COUNT,
}) {
  return (
    <div className="bg-[#131B2A] border-b border-[#2C384E] p-4 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Canva Frame Studio</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              v2.0 Pro Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Design dynamic vector overlays & transparent PNG frames with client-side compositing.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-[#0B0F17] p-1 rounded-xl border border-[#2C384E]">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Vector Studio
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Library ({CANVA_PRESETS_COUNT})
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="w-48">
            <Input
              type="text"
              placeholder="Search frames..."
              value={frameSearch}
              onChange={(e) => setFrameSearch(e.target.value)}
              className="py-1.5 text-xs bg-[#0B0F17] border-[#2C384E]"
            />
          </div>
        )}

        <Button
          variant="secondary"
          icon={Wand2}
          onClick={handleDownloadCanvasOverlay}
          disabled={isCompiling}
          className="text-xs py-2 bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          {isCompiling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Export PNG'}
        </Button>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsUploadModalOpen(true)}
          className="text-xs py-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold hover:brightness-110"
        >
          Publish Frame
        </Button>
      </div>
    </div>
  );
}
