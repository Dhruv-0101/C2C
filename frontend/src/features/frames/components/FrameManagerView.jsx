import React, { useState } from "react";
import { createPortal as createPortalDom } from "react-dom";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Eye,
  Maximize2,
  Square,
  Circle,
  Move,
  CloudUpload,
  Type,
  ArrowUp,
  ArrowDown,
  Layout,
  RotateCw,
  RotateCcw,
  Search,
  X,
  Star,
  Gem,
  Bookmark,
  Shield,
  Minus,
  Hexagon,
  Triangle,
  FileText,
  Grid,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { FeedbackModal } from "@/components/common/FeedbackModal";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import Pagination from "@/components/common/Pagination";
import { MASTER_FRAME_PRESETS } from "../../../constants/framePresets";

/**
 * FrameManagerView
 * Modern, un-cluttered Canva-style Studio presentational component for the Frame Manager Studio.
 */
export const FrameManagerView = ({
  canvasRef,
  modalProps,
  activeTab,
  setActiveTab,
  fullscreenFrame,
  setFullscreenFrame,
  successMsg,
  errorMsg,
  stageBgColor,
  setStageBgColor,
  showSelectionBox = true,
  setShowSelectionBox,
  frameMeta,
  setFrameMeta,
  elements,
  selectedId,
  setSelectedId,
  selectedElement,
  frames,
  framesPaginationMeta,
  isLoadingFrames,
  frameSearch,
  setFrameSearch,
  setFramePage,
  setFrameLimit,
  createFrameMutation,
  deleteFrameMutation,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  handleAddElement,
  updateSelectedElement,
  handleDeleteSelected,
  handleClearStage,
  handleMoveLayer,
  loadPreset,
  handlePublishCanvaFrame,
}) => {
  // Left Sidebar Sub-Tab State
  const [sidebarTab, setSidebarTab] = useState("elements");

  return (
    <div className="space-y-6">
      {/* 1. Studio Top Bar Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
              <span>Interactive Frame Studio</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO BUILDER
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Visual canvas studio for designing transparent brand frame overlays & dynamic text/image slots.
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1.5 rounded-xl border border-[#2C384E]">
            <button
              onClick={() => setActiveTab("canva")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "canva"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Canvas Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("manage")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === "manage"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Active Frames ({framesPaginationMeta?.totalItems ?? frames?.length ?? 0})</span>
            </button>
          </div>

          {activeTab === "canva" && (
            <Button
              variant="primary"
              icon={CloudUpload}
              onClick={handlePublishCanvaFrame}
              isLoading={createFrameMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs py-2 shadow-lg shadow-amber-500/20"
            >
              Publish Frame PNG
            </Button>
          )}
        </div>
      </div>

      {/* Error & Success Feedback Alerts */}
      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. TAB 1: Canvas Studio Workspace */}
      {activeTab === "canva" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT STUDIO SIDEBAR (4 Cols): Tool Tabs & Drawers */}
          <Card className="lg:col-span-4 border-[#2C384E] bg-[#131B2A] p-4 sm:p-5 space-y-4 shadow-xl">
            {/* Sidebar Internal Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B0F17] rounded-xl border border-[#2C384E] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setSidebarTab("elements")}
                className={`py-1.5 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  sidebarTab === "elements"
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Elements</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("presets")}
                className={`py-1.5 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  sidebarTab === "presets"
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("layers")}
                className={`py-1.5 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  sidebarTab === "layers"
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Layers ({elements.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab("info")}
                className={`py-1.5 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  sidebarTab === "info"
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Package</span>
              </button>
            </div>

            {/* SUB-PANEL 1: Add Elements */}
            {sidebarTab === "elements" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Basic Shapes */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Square className="w-3 h-3" /> Basic Shapes & Badges
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddElement("RECTANGLE")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Square className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Rectangle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("CIRCLE")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Circle className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="truncate">Circle Ring</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("CAPSULE")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Maximize2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">Capsule Pill</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("STAR")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span className="truncate">Star Accent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("DIAMOND")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Gem className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate">Diamond</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("TRIANGLE")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Triangle className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="truncate">Triangle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("HEXAGON")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Hexagon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="truncate">Hexagon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("SHIELD")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Shield Badge</span>
                    </button>
                  </div>
                </div>

                {/* Frame Layout & Accents */}
                <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" /> Layout & Accents
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddElement("FRAME_BORDER")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Maximize2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Frame Border</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("RIBBON")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">Banner Ribbon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("LINE")}
                      className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs font-semibold hover:border-amber-500 hover:bg-slate-900/60 transition flex items-center gap-2 col-span-2"
                    >
                      <Minus className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">Divider Line</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Input Slots */}
                <div className="space-y-2 pt-2 border-t border-[#2C384E]">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Type className="w-3 h-3" /> Dynamic Input Slots
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddElement("TEXT")}
                      className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition flex items-center gap-2"
                    >
                      <Type className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">+ Text Slot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddElement("IMAGE_SLOT")}
                      className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold hover:bg-teal-500/20 transition flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="truncate">+ Image Slot</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PANEL 2: Master Presets */}
            {sidebarTab === "presets" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5" /> 15 Premium Master Presets
                  </h4>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {MASTER_FRAME_PRESETS.map((p, idx) => (
                    <div
                      key={p.key}
                      onClick={() => loadPreset(p.key)}
                      className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] hover:border-amber-500/60 hover:bg-slate-900/60 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                          {idx + 1}. {p.title}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {p.description || "Interactive vector blueprint frame"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-[10px] py-1 px-2.5 shrink-0 bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold transition"
                      >
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-PANEL 3: Layer Stack */}
            {sidebarTab === "layers" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Canvas Element Stack
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total: {elements.length}
                  </span>
                </div>

                {elements.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#2C384E] rounded-xl text-xs text-slate-500 space-y-1">
                    <Layers className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-400">No elements added yet.</p>
                    <p className="text-[10px]">Click Elements tab to add shapes, slots & text!</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                    {elements.map((el) => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          el.id === selectedId
                            ? "bg-amber-500/20 border-amber-500 text-white font-bold shadow"
                            : "bg-[#0B0F17] border-[#2C384E] text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="truncate">{el.name || el.customLabel || "Element"}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-800">
                            {el.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-PANEL 4: Frame Metadata */}
            {sidebarTab === "info" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Frame Package Metadata
                </h4>

                <Input
                  label="Frame Package Title"
                  placeholder="e.g. Minimalist Business Frame Blueprint"
                  value={frameMeta.title}
                  onChange={(e) =>
                    setFrameMeta({ ...frameMeta, title: e.target.value })
                  }
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Short description of this frame overlay..."
                    value={frameMeta.description}
                    onChange={(e) =>
                      setFrameMeta({ ...frameMeta, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-600 resize-none"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* CENTER CANVAS STAGE VIEWPORT (5 Cols or Flex-1) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-[#2C384E] bg-[#131B2A] p-4 sm:p-5 space-y-4 shadow-xl flex flex-col items-center">
              {/* Canvas Controls Header */}
              <div className="w-full flex items-center justify-between border-b border-[#2C384E] pb-3 gap-2">
                <div className="flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">
                    1080x1080 Interactive Stage
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1 rounded-xl border border-[#2C384E] text-[10px]">
                  <button
                    type="button"
                    onClick={() => setStageBgColor("WHITE")}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      stageBgColor === "WHITE"
                        ? "bg-white text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageBgColor("DARK")}
                    className={`px-2 py-1 rounded-lg font-bold transition ${
                      stageBgColor === "DARK"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Dark
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSelectionBox && setShowSelectionBox(!showSelectionBox)}
                    className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      showSelectionBox
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-slate-400"
                    }`}
                    title="Toggle selection box outline"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showSelectionBox ? "Outline" : "No Outline"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearStage}
                    className="px-2 py-1 rounded-lg font-bold transition bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                    title="Clear canvas stage"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* 1080x1080 Interactive Stage Canvas */}
              <div className="relative aspect-square w-full max-w-[420px] rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-white shadow-2xl flex items-center justify-center cursor-move my-2">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[10px] text-slate-400 font-mono text-center">
                💡 Drag elements to position • Use right panel to edit colors, text & layers
              </p>
            </Card>
          </div>

          {/* RIGHT ELEMENT INSPECTOR (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            {selectedElement ? (
              <Card className="border-[#2C384E] bg-[#131B2A] p-4 space-y-4 shadow-xl animate-in fade-in duration-200">
                {/* Inspector Header */}
                <div className="flex items-center justify-between border-b border-[#2C384E] pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">
                      Element Inspector
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveLayer("UP")}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Move Layer Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveLayer("DOWN")}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Move Layer Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="p-1 rounded bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                      title="Delete Element"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Input
                  label="Element Layer Label"
                  placeholder="e.g. Phone Number, Logo Box"
                  value={selectedElement.name || selectedElement.customLabel || ""}
                  onChange={(e) =>
                    updateSelectedElement({
                      name: e.target.value,
                      customLabel: e.target.value,
                    })
                  }
                />

                {/* Slot Category Selection */}
                <div className="space-y-2.5 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                  <label className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block">
                    Slot Category
                  </label>

                  <select
                    value={
                      selectedElement.type === "TEXT"
                        ? "TEXT_INPUT"
                        : selectedElement.slotCategory ||
                          (selectedElement.dynamicSlot === "LOGO_BOX" ||
                          selectedElement.dynamicSlot === "AVATAR_CIRCLE"
                            ? "IMAGE_SLOT"
                            : selectedElement.dynamicSlot !== "NONE"
                              ? "TEXT_INPUT"
                              : "STATIC")
                    }
                    disabled={selectedElement.type === "TEXT"}
                    onChange={(e) => {
                      const cat = e.target.value;
                      if (cat === "STATIC") {
                        updateSelectedElement({
                          slotCategory: "STATIC",
                          dynamicSlot: "NONE",
                        });
                      } else if (cat === "TEXT_INPUT") {
                        updateSelectedElement({
                          slotCategory: "TEXT_INPUT",
                          type: selectedElement.type === "TEXT" ? "TEXT" : selectedElement.type,
                          dynamicSlot:
                            selectedElement.dynamicSlot !== "NONE"
                              ? selectedElement.dynamicSlot
                              : "CUSTOM_FIELD",
                          customLabel:
                            selectedElement.customLabel ||
                            selectedElement.name ||
                            "Text Field",
                          name:
                            selectedElement.customLabel ||
                            selectedElement.name ||
                            "Text Field",
                          fieldKey:
                            selectedElement.fieldKey || `field_${Date.now()}`,
                        });
                      } else if (cat === "IMAGE_SLOT") {
                        updateSelectedElement({
                          slotCategory: "IMAGE_SLOT",
                          type: selectedElement.type || "RECTANGLE",
                          dynamicSlot:
                            selectedElement.dynamicSlot === "AVATAR_CIRCLE"
                              ? "AVATAR_CIRCLE"
                              : "LOGO_BOX",
                          customLabel:
                            selectedElement.customLabel ||
                            selectedElement.name ||
                            "Image Slot",
                          name:
                            selectedElement.customLabel ||
                            selectedElement.name ||
                            "Image Slot",
                          fieldKey:
                            selectedElement.fieldKey || `img_${Date.now()}`,
                        });
                      }
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {selectedElement.type === "TEXT" ? (
                      <option value="TEXT_INPUT">✍️ Dynamic Text Input</option>
                    ) : (
                      <>
                        <option value="STATIC">🎨 Static Decorative Shape</option>
                        <option value="TEXT_INPUT">✍️ Dynamic Text Input</option>
                        <option value="IMAGE_SLOT">🖼️ Dynamic PNG Image Slot</option>
                      </>
                    )}
                  </select>

                  {/* BrandKit Key Auto-Fill */}
                  {(selectedElement.slotCategory === "TEXT_INPUT" ||
                    selectedElement.type === "TEXT" ||
                    selectedElement.dynamicSlot !== "NONE") && (
                    <div className="space-y-1.5 pt-2 border-t border-[#2C384E]">
                      <label className="text-[10px] text-slate-300 font-semibold block">
                        BrandKit Key Mapping
                      </label>
                      <select
                        value={selectedElement.dynamicSlot || "CUSTOM_FIELD"}
                        onChange={(e) =>
                          updateSelectedElement({
                            dynamicSlot: e.target.value,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500"
                      >
                        <option value="CUSTOM_FIELD">Manual User Input</option>
                        <option value="BUSINESS_NAME">Business Name</option>
                        <option value="PHONE">Phone Number</option>
                        <option value="WHATSAPP">WhatsApp Number</option>
                        <option value="EMAIL">Email Address</option>
                        <option value="INSTAGRAM">Instagram Handle</option>
                        <option value="FACEBOOK">Facebook Page</option>
                        <option value="ADDRESS">Address / Street</option>
                        <option value="CITY">City</option>
                        <option value="WEBSITE">Website URL</option>
                        <option value="TAGLINE">Tagline / Slogan</option>
                      </select>
                    </div>
                  )}

                  {/* Image Slot BrandKit Mapping */}
                  {(selectedElement.slotCategory === "IMAGE_SLOT" ||
                    selectedElement.dynamicSlot === "LOGO_BOX" ||
                    selectedElement.dynamicSlot === "AVATAR_CIRCLE") && (
                    <div className="space-y-1.5 pt-2 border-t border-[#2C384E]">
                      <label className="text-[10px] text-slate-300 font-semibold block">
                        Image Slot Auto-Fill
                      </label>
                      <select
                        value={selectedElement.dynamicSlot || "LOGO_BOX"}
                        onChange={(e) => {
                          const slot = e.target.value;
                          updateSelectedElement({
                            dynamicSlot: slot,
                            type:
                              slot === "AVATAR_CIRCLE"
                                ? "CIRCLE"
                                : selectedElement.type,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs"
                      >
                        <option value="LOGO_BOX">Business Logo Box</option>
                        <option value="AVATAR_CIRCLE">Profile Headshot Ring</option>
                        <option value="CUSTOM_IMAGE">Custom Photo Slot</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Typography Controls (Visible for TEXT elements OR Shapes with TEXT_INPUT slot category) */}
                {(selectedElement.type === "TEXT" || selectedElement.slotCategory === "TEXT_INPUT") && (
                  <div className="space-y-3 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                    <div className="space-y-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/50 shadow-lg shadow-amber-500/10">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5" />
                          <span>Type / Edit Text Content</span>
                        </label>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                          TYPE HERE ✍️
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Call Us / Discount Offer / Business Tagline"
                        value={selectedElement.text || selectedElement.customLabel || ""}
                        onChange={(e) =>
                          updateSelectedElement({
                            text: e.target.value,
                            customLabel: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F17] border-2 border-amber-500/70 text-white font-bold text-xs focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/40 placeholder:text-slate-500 transition shadow-inner"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">
                          Font
                        </label>
                        <select
                          value={selectedElement.fontFamily || "Space Grotesk"}
                          onChange={(e) =>
                            updateSelectedElement({
                              fontFamily: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs"
                        >
                          <option value="Space Grotesk">Space Grotesk</option>
                          <option value="Plus Jakarta Sans">Plus Jakarta</option>
                          <option value="Outfit">Outfit</option>
                          <option value="Inter">Inter</option>
                          <option value="Playfair Display">Playfair</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Cinzel">Cinzel</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">
                          Weight
                        </label>
                        <select
                          value={selectedElement.fontWeight || "bold"}
                          onChange={(e) =>
                            updateSelectedElement({
                              fontWeight: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-[#131B2A] border border-[#2C384E] text-white text-xs"
                        >
                          <option value="normal">Normal (400)</option>
                          <option value="semibold">SemiBold (600)</option>
                          <option value="bold">Bold (700)</option>
                          <option value="900">Black (900)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fill & Border Colors for Shapes */}
                {selectedElement.type !== "TEXT" && (
                  <div className="space-y-3 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E]">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">
                          Fill
                        </label>
                        <div className="flex items-center gap-1.5 bg-[#131B2A] p-1.5 rounded-lg border border-[#2C384E]">
                          <input
                            type="color"
                            value={selectedElement.fillColor || "#000000"}
                            onChange={(e) =>
                              updateSelectedElement({ fillColor: e.target.value })
                            }
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-[10px] text-white uppercase truncate">
                            {selectedElement.fillColor}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">
                          Border
                        </label>
                        <div className="flex items-center gap-1.5 bg-[#131B2A] p-1.5 rounded-lg border border-[#2C384E]">
                          <input
                            type="color"
                            value={selectedElement.borderColor || "#FFFFFF"}
                            onChange={(e) =>
                              updateSelectedElement({
                                borderColor: e.target.value,
                              })
                            }
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-[10px] text-white uppercase truncate">
                            {selectedElement.borderColor || "#FFFFFF"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#2C384E]">
                      <div className="flex items-center justify-between text-[10px]">
                        <label className="font-bold text-amber-400 uppercase">
                          Border ({selectedElement.borderWidth || 0}px)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={selectedElement.borderWidth || 0}
                          onChange={(e) =>
                            updateSelectedElement({
                              borderWidth: Number(e.target.value),
                            })
                          }
                          className="w-12 px-1 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-amber-400 font-mono font-bold text-center"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={selectedElement.borderWidth || 0}
                        onChange={(e) =>
                          updateSelectedElement({
                            borderWidth: Number(e.target.value),
                          })
                        }
                        className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Transform & Rotation */}
                <div className="space-y-2 p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Rotation
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            rotation:
                              (Number(selectedElement.rotation || 0) - 15 + 360) % 360,
                          })
                        }
                        className="px-1.5 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white font-bold text-[9px]"
                      >
                        -15°
                      </button>
                      <span className="font-mono text-amber-400 font-bold text-xs px-1">
                        {selectedElement.rotation || 0}°
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedElement({
                            rotation:
                              (Number(selectedElement.rotation || 0) + 15) % 360,
                          })
                        }
                        className="px-1.5 py-0.5 rounded bg-[#131B2A] border border-[#2C384E] text-slate-300 hover:text-white font-bold text-[9px]"
                      >
                        +15°
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={selectedElement.rotation || 0}
                    onChange={(e) =>
                      updateSelectedElement({
                        rotation: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                  />
                </div>
              </Card>
            ) : (
              <Card className="border-[#2C384E] bg-[#131B2A] p-6 text-center text-slate-500 space-y-2 border-dashed shadow-xl">
                <Sliders className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-bold text-slate-400">No Element Selected</p>
                <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">
                  Click any shape or text element on the stage to open styling controls!
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB 2: Active Published Frames Management */}
      {activeTab === "manage" && (
        <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#2C384E] pb-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <span>Active Transparent PNG Frame Blueprints</span>
            </h3>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search frames by title..."
                value={frameSearch}
                onChange={(e) => {
                  setFrameSearch(e.target.value);
                  setFramePage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          {isLoadingFrames ? (
            <div className="p-12 text-center text-slate-400 font-semibold text-sm">
              Loading frames...
            </div>
          ) : !frames || frames.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold text-sm">
                No frames found.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the Canvas Studio to design and publish your first frame overlay!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {frames.map((f) => {
                  const displayImgUrl = f.previewUrl || f.overlayPngUrl;
                  return (
                    <Card
                      key={f.id}
                      className="border-[#2C384E] bg-[#0B0F17] p-4 space-y-3 relative group hover:border-amber-500/50 transition shadow-lg"
                    >
                      <div
                        onClick={() => displayImgUrl && setFullscreenFrame(f)}
                        className="aspect-square rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden relative cursor-pointer group/img"
                        title="Click for Full Screen Preview"
                      >
                        {displayImgUrl ? (
                          <>
                            <img
                              src={displayImgUrl}
                              alt={f.title}
                              className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 backdrop-blur-[2px]">
                              <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 transform scale-90 group-hover/img:scale-100 transition-transform">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-700">
                                Full Screen Preview
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">
                            No Preview Image
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="truncate pr-2">
                          <h4 className="text-xs font-bold text-white truncate">
                            {f.title}
                          </h4>
                          {f.description && (
                            <p className="text-[10px] text-slate-400 truncate">
                              {f.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteFrameMutation.mutate(f.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition shrink-0"
                          title="Delete Frame"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {framesPaginationMeta && (
                <Pagination
                  meta={framesPaginationMeta}
                  onPageChange={(newPage) => setFramePage(newPage)}
                  onLimitChange={(newLimit) => {
                    setFrameLimit(newLimit);
                    setFramePage(1);
                  }}
                  pageSizeOptions={[4, 8, 12, 24]}
                />
              )}
            </div>
          )}
        </Card>
      )}

      {/* 4. Feedback Modal */}
      <FeedbackModal {...modalProps} />

      {/* 5. Full Screen Lightbox Modal (Same as Template Lightbox) */}
      <ImageLightbox
        isOpen={!!fullscreenFrame}
        item={
          fullscreenFrame
            ? {
                url: fullscreenFrame.previewUrl || fullscreenFrame.overlayPngUrl,
                graphicUrl: fullscreenFrame.previewUrl || fullscreenFrame.overlayPngUrl,
                title: fullscreenFrame.title,
                categoryName: fullscreenFrame.description || "Frame Blueprint Overlay",
              }
            : null
        }
        onClose={() => setFullscreenFrame(null)}
      />
    </div>
  );
};

export default FrameManagerView;
