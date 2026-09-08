import React from "react";
import {
  Palette,
  Plus,
  Trash2,
  ArrowLeft,
  Eye,
  Pipette,
  Sliders,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { ColorPickerInput } from "../../../components/common/ColorPickerInput";
import Pagination from "../../../components/common/Pagination";
import {
  FONT_HEADER_OPTIONS,
  FONT_BODY_OPTIONS,
  GRADIENT_PRESETS,
} from "../containers/DesignStylesManagerContainer";

/**
 * DesignStylesManagerView
 * Pure Presentational Component rendering design style cards, real-time live preview cards, and full-screen creation view.
 */
export const DesignStylesManagerView = ({
  displayMode = "list",
  handleOpenCreate,
  handleCancel,
  errorMsg,
  gradientAngle,
  setGradientAngle,
  blendColor1,
  setBlendColor1,
  blendColor2,
  setBlendColor2,
  blendColor3,
  setBlendColor3,
  useThreeColors,
  setUseThreeColors,
  formData,
  setFormData,
  designStyles,
  meta,
  page,
  setPage,
  setLimit,
  isLoading,
  error,
  createDesignStyleMutation,
  deleteDesignStyleMutation,
  handleApplyPreset,
  handleFormSubmit,
}) => {
  // RENDER MODE 1: FORM VIEW (NO MODAL / NO POPUP - FULL SCREEN 2-COLUMN CREATOR)
  if (displayMode === "form") {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Navigation Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={handleCancel}
              className="border-[#2C384E] text-slate-300 hover:text-white"
            >
              Back
            </Button>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
                <Pipette className="w-5 h-5 text-amber-400" />
                <span>Configure Master Design Style & Color Palette</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set master brand colors, gradient mix blends, and typography pairs with real-time live preview.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}

        {/* 2-COLUMN MAIN STUDIO LAYOUT: Left Form (7 Cols), Right Live Graphic Preview (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (7 COLS): Form Controls */}
          <Card className="lg:col-span-7 border-[#2C384E] bg-[#131B2A] p-6 space-y-6 shadow-xl">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <Input
                label="Design Style Name"
                placeholder="e.g. Royal Festive Gold, Neon Cyberpunk, Luxe Emerald"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Description"
                placeholder="Short description of where this design system is recommended..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              {/* REAL-TIME GRADIENT MIX BLEND CONTROLS */}
              <div className="p-4 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sliders className="w-4 h-4" /> Real-Time Gradient Mix Blend Generator
                  </label>

                  <button
                    type="button"
                    onClick={() => setUseThreeColors((prev) => !prev)}
                    className="text-[11px] font-semibold text-teal-400 hover:underline"
                  >
                    {useThreeColors ? "Use 2-Color Blend" : "+ Add 3rd Color Stop"}
                  </button>
                </div>

                {/* Preset Blend Quick Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm border border-white/20 transition hover:scale-105"
                        style={{ background: preset.rule }}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Angle Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" /> Gradient Angle
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{gradientAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientAngle}
                    onInput={(e) => setGradientAngle(Number(e.target.value))}
                    onChange={(e) => setGradientAngle(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Live Mix Blend Color Pickers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <ColorPickerInput
                    label="Blend Start Color"
                    value={blendColor1}
                    onChange={setBlendColor1}
                  />

                  <ColorPickerInput
                    label="Blend Middle / End"
                    value={blendColor2}
                    onChange={setBlendColor2}
                  />

                  {useThreeColors && (
                    <ColorPickerInput
                      label="Blend Stop 3 Color"
                      value={blendColor3}
                      onChange={setBlendColor3}
                    />
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 bg-[#131B2A] p-2.5 rounded-xl border border-[#2C384E] truncate">
                  Rule: <span className="text-amber-300">{formData.gradient}</span>
                </div>
              </div>

              {/* Color Swatch Pickers Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Brand Color Swatches</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ColorPickerInput
                    label="Primary (Headline)"
                    value={formData.primaryColor}
                    onChange={(val) => setFormData({ ...formData, primaryColor: val })}
                  />

                  <ColorPickerInput
                    label="Secondary (Badge)"
                    value={formData.secondaryColor}
                    onChange={(val) => setFormData({ ...formData, secondaryColor: val })}
                  />

                  <ColorPickerInput
                    label="Accent (Button)"
                    value={formData.accentColor}
                    onChange={(val) => setFormData({ ...formData, accentColor: val })}
                  />

                  <ColorPickerInput
                    label="Background"
                    value={formData.backgroundColor}
                    onChange={(val) => setFormData({ ...formData, backgroundColor: val })}
                  />
                </div>
              </div>

              {/* Font Typography Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Header Typography Font</label>
                  <select
                    value={formData.fontHeader}
                    onChange={(e) => setFormData({ ...formData, fontHeader: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {FONT_HEADER_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Body Typography Font</label>
                  <select
                    value={formData.fontBody}
                    onChange={(e) => setFormData({ ...formData, fontBody: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {FONT_BODY_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold"
                  isLoading={createDesignStyleMutation.isPending}
                  isDisabled={!formData.name.trim()}
                >
                  Save Master Design Style
                </Button>
              </div>
            </form>
          </Card>

          {/* RIGHT COLUMN (5 COLS): Sticky Live Graphic Mockup Preview */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
            <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Eye className="w-4 h-4" /> Live Graphic Mockup Preview
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formData.fontHeader} / {formData.fontBody}
                </span>
              </div>

              {/* REAL-TIME LIVE GRAPHIC PREVIEW CARD */}
              <div
                className="p-6 sm:p-7 rounded-2xl border border-white/20 shadow-2xl space-y-4 transition-all duration-300 min-h-[320px] flex flex-col justify-between"
                style={{
                  background: formData.gradient || formData.backgroundColor,
                  backgroundColor: formData.backgroundColor,
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md transition-all"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      Special Festive Promo
                    </span>
                    <span className="text-[10px] text-white/80 font-mono uppercase tracking-wider font-bold">
                      BrandFlow Render Engine
                    </span>
                  </div>

                  <h3
                    className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-md transition-all leading-snug"
                    style={{
                      fontFamily: `'${formData.fontHeader}', sans-serif`,
                      color: formData.primaryColor,
                    }}
                  >
                    ✨ Exclusive Celebration Offer 30% OFF
                  </h3>

                  <p
                    className="text-xs sm:text-sm font-normal leading-relaxed text-slate-100 opacity-95 transition-all"
                    style={{
                      fontFamily: `'${formData.fontBody}', sans-serif`,
                    }}
                  >
                    Experience the sacred festival of celebrations. Customize your master color swatches, gradient mix
                    blends, and font typography in real-time.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/20 pt-3 text-xs">
                  <span
                    className="px-4 py-2 rounded-xl font-extrabold text-white shadow-lg tracking-wide transition-all"
                    style={{ backgroundColor: formData.accentColor }}
                  >
                    Claim Offer Now
                  </span>

                  <span className="text-xs font-mono font-bold text-white/90">
                    📞 +91 98765 43210
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-mono text-center">
                💡 Live preview updates instantly as you tweak colors, gradients & font pairs.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // RENDER MODE 2: LIST VIEW (MAIN GRID DASHBOARD)
  return (
    <Card className="border-[#2C384E] bg-[#131B2A] p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-white">Master Design System & Color Palettes</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure master brand colors, gradient mix blends, and typography pairs for end-users.
            </p>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Create Design Style
        </Button>
      </div>

      {error && <Alert variant="error" message={error.message} />}

      {/* Grid of Master Design Styles */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-semibold">
          Loading design system presets...
        </div>
      ) : !designStyles || designStyles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#2C384E] rounded-2xl text-slate-400 text-sm space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-300">No design styles created yet.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Create Design Style" above to add master color palettes, gradient blends & font pairs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designStyles.map((style) => (
            <div
              key={style.id}
              className="p-5 rounded-2xl bg-[#0B0F17] border border-[#2C384E] space-y-4 hover:border-amber-500/50 transition group shadow-lg"
            >
              {/* Card Header & Delete Action */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-amber-400 transition">
                    {style.name}
                  </h3>
                  {style.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{style.description}</p>}
                </div>

                <button
                  onClick={() => deleteDesignStyleMutation.mutate(style.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                  title="Delete Design Style"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* REAL-TIME CARD GRAPHIC MOCKUP PREVIEW */}
              <div
                className="p-4 rounded-xl border border-white/10 shadow-lg space-y-2.5 transition-all"
                style={{
                  background: style.gradient || style.backgroundColor,
                  backgroundColor: style.backgroundColor,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: style.secondaryColor }}
                  >
                    Live Theme Preview
                  </span>
                  <span
                    className="text-[9px] font-bold text-white/80"
                    style={{ fontFamily: `'${style.fontBody}', sans-serif` }}
                  >
                    {style.fontHeader} / {style.fontBody}
                  </span>
                </div>

                <h4
                  className="text-base font-extrabold leading-tight tracking-tight drop-shadow-sm"
                  style={{
                    fontFamily: `'${style.fontHeader}', sans-serif`,
                    color: style.primaryColor,
                  }}
                >
                  ✨ Festive Special 30% OFF
                </h4>

                <p
                  className="text-[11px] font-normal leading-relaxed text-slate-100 opacity-90 line-clamp-2"
                  style={{
                    fontFamily: `'${style.fontBody}', sans-serif`,
                  }}
                >
                  Real-time visual rendering of custom colors, typography pairs, and mix blends.
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[10px]">
                  <span
                    className="px-2.5 py-1 rounded-md font-bold text-white shadow-sm"
                    style={{ backgroundColor: style.accentColor }}
                  >
                    Shop Collection
                  </span>
                  <span className="font-mono text-white/90">+91 98765 43210</span>
                </div>
              </div>

              {/* Color Swatch Circles */}
              <div className="flex items-center justify-between text-xs border-t border-[#2C384E] pt-3">
                <span className="text-slate-400 font-medium">Color Palette:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-white/30 shadow-md"
                    style={{ backgroundColor: style.primaryColor }}
                    title={`Primary: ${style.primaryColor}`}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/30 shadow-md"
                    style={{ backgroundColor: style.secondaryColor }}
                    title={`Secondary: ${style.secondaryColor}`}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/30 shadow-md"
                    style={{ backgroundColor: style.accentColor }}
                    title={`Accent: ${style.accentColor}`}
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/30 shadow-md"
                    style={{ backgroundColor: style.backgroundColor }}
                    title={`Background: ${style.backgroundColor}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Central Pagination Controls */}
      {meta && (
        <Pagination
          meta={meta}
          currentPage={page}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </Card>
  );
};

export default DesignStylesManagerView;
