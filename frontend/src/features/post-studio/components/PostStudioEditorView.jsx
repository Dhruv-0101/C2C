import React from "react";
import {
  Sparkles,
  Download,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Upload,
  CheckCircle2,
  Zap,
  Share2,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import Pagination from "../../../components/common/Pagination";

/**
 * PostStudioEditorView
 * Pure Presentational Component rendering the wizard steps (Templates, Canva Frames, Business Details, Export) and persistent Live Canvas stage.
 */
export const PostStudioEditorView = ({
  canvasRef,
  navigate,
  currentStep,
  setCurrentStep,
  selectedFrame,
  setSelectedFrame,
  selectedTemplateId,
  setSelectedTemplateId,
  customBaseImage,
  setCustomBaseImage,
  saveSuccess,
  templates,
  templatesMeta,
  isLoadingTemplates,
  templateSearch,
  setTemplateSearch,
  setTemplatePage,
  setTemplateLimit,
  frames,
  framesMeta,
  isLoadingFrames,
  setFramePage,
  setFrameLimit,
  customDetails,
  setCustomDetails,
  currentTemplate,
  isRendering,
  savePostMutation,
  handleSaveToDb,
  handleDownloadHD,
  onOpenPublisherModal,
}) => {
  const steps = [
    { num: 1, title: "Select Base Graphic" },
    { num: 2, title: "Choose Canva Frame" },
    { num: 3, title: "BrandKit Details" },
    { num: 4, title: "Publish & Export" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Wizard Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>AI Post Studio & Canva Frame Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Composite master graphic backgrounds with Canva vector frames & your AI BrandKit.
          </p>
        </div>

        {/* Wizard Stepper Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-glow"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-[#0B0F17] text-slate-400 border border-[#2C384E]"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-extrabold">
                  {isCompleted ? "✓" : step.num}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {saveSuccess && <Alert variant="success" message={saveSuccess} />}

      {/* Main Studio Viewport (Left Controls, Right Live Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (6 Cols): Wizard Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* STEP 1: SELECT BASE GRAPHIC */}
          {currentStep === 1 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white">
                  Step 1: Choose Master Graphic Background
                </h3>
                <span className="text-xs font-semibold text-amber-400 font-mono">1 / 4</span>
              </div>

              {/* Custom Base Image File Upload Option */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Or Upload Custom 1080x1080 Background Image</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCustomBaseImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                />
              </div>

              {/* Search Base Templates */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => {
                    setTemplateSearch(e.target.value);
                    setTemplatePage(1);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>

              {/* Clean 6-Item Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingTemplates ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading base templates...</div>
                ) : templates.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                    No matching templates found.
                  </div>
                ) : (
                  templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplateId(t.id);
                        setCustomBaseImage(null);
                      }}
                      className={`relative aspect-square rounded-xl border overflow-hidden transition group ${
                        selectedTemplateId === t.id && !customBaseImage
                          ? "border-amber-500 ring-2 ring-amber-500/40"
                          : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                      }`}
                    >
                      <img
                        src={t.baseImageUrl || t.imageUrl || t.fileUrl}
                        alt={t.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5 truncate">
                        <p className="text-[10px] font-bold text-white truncate">{t.title}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Modular Central Pagination */}
              {templatesMeta && (
                <div className="pt-2 border-t border-[#2C384E]">
                  <Pagination
                    meta={templatesMeta}
                    onPageChange={(p) => setTemplatePage(p)}
                    onLimitChange={(l) => {
                      setTemplateLimit(l);
                      setTemplatePage(1);
                    }}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-[#2C384E]">
                <Button variant="primary" onClick={() => setCurrentStep(2)}>
                  <span>Next: Choose Canva Frame</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: CHOOSE CANVA FRAME */}
          {currentStep === 2 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Step 2: Select Canva Vector Frame Overlay</span>
                </h3>
                <span className="text-xs font-semibold text-amber-400 font-mono">2 / 4</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingFrames ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading vector frames...</div>
                ) : frames.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                    No Canva vector frames created yet.
                  </div>
                ) : (
                  frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative aspect-square rounded-xl border p-2 overflow-hidden transition group ${
                        selectedFrame?.id === frame.id
                          ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40"
                          : "border-[#2C384E] bg-[#0B0F17] hover:border-slate-500"
                      }`}
                    >
                      <img
                        src={frame.overlayPngUrl}
                        alt={frame.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1.5 truncate">
                        <p className="text-[10px] font-bold text-white truncate">{frame.title}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {framesMeta && (
                <div className="pt-2 border-t border-[#2C384E]">
                  <Pagination
                    meta={framesMeta}
                    onPageChange={(p) => setFramePage(p)}
                    onLimitChange={(l) => {
                      setFrameLimit(l);
                      setFramePage(1);
                    }}
                    pageSizeOptions={[6, 12, 24]}
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                  <span>Next: BrandKit Details</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: BRANDKIT OVERRIDES */}
          {currentStep === 3 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Step 3: Business & Contact Details Overrides</span>
                </h3>
                <span className="text-xs font-semibold text-amber-400 font-mono">3 / 4</span>
              </div>

              <div className="space-y-4">
                <Input
                  label="Business Name"
                  value={customDetails.businessName}
                  onChange={(e) => setCustomDetails({ ...customDetails, businessName: e.target.value })}
                />
                <Input
                  label="Phone / WhatsApp Number"
                  value={customDetails.phone}
                  onChange={(e) => setCustomDetails({ ...customDetails, phone: e.target.value })}
                />
                <Input
                  label="Address / Location"
                  value={customDetails.address}
                  onChange={(e) => setCustomDetails({ ...customDetails, address: e.target.value })}
                />
                <Input
                  label="Tagline / Offer Message"
                  value={customDetails.tagline}
                  onChange={(e) => setCustomDetails({ ...customDetails, tagline: e.target.value })}
                />
              </div>

              {/* Toggles for Canvas Visibility */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Live Canvas Element Toggles
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customDetails.showLogo}
                      onChange={(e) => setCustomDetails({ ...customDetails, showLogo: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Render Brand Logo</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customDetails.showAvatar}
                      onChange={(e) => setCustomDetails({ ...customDetails, showAvatar: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Render Doctor Photo</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(4)}>
                  <span>Next: Publish & Export</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: EXPORT & PUBLISH */}
          {currentStep === 4 && (
            <Card className="p-6 bg-[#131B2A] border-[#2C384E] space-y-5">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step 4: Publish & Export Final Composited Post</span>
                </h3>
                <span className="text-xs font-semibold text-emerald-400 font-mono">4 / 4</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Active Base Graphic:</span>
                  <span className="text-white font-bold">{currentTemplate?.title || "Custom Graphic"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Active Canva Frame:</span>
                  <span className="text-amber-400 font-bold">{selectedFrame?.title || "Default Overlay"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Business Name:</span>
                  <span className="text-white font-bold">{customDetails.businessName || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Export Canvas Specs:</span>
                  <span className="text-emerald-400 font-bold">1080 x 1080 Square PNG (HD)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {/* 🚀 Social Publisher Button */}
                <Button
                  variant="primary"
                  icon={Share2}
                  onClick={onOpenPublisherModal}
                  className="w-full justify-center text-sm font-extrabold py-3.5 bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg"
                >
                  🚀 Share / Publish to Social Media
                </Button>

                <Button
                  variant="outline"
                  icon={Download}
                  onClick={handleDownloadHD}
                  className="w-full justify-center text-xs font-bold py-2.5"
                >
                  Download 1080x1080 HD PNG
                </Button>

                <Button
                  variant="outline"
                  icon={BookmarkCheck}
                  onClick={handleSaveToDb}
                  isLoading={savePostMutation.isPending}
                  className="w-full justify-center border-[#2C384E] text-slate-300 hover:text-white text-xs"
                >
                  Save Post Draft to Vault
                </Button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (6 Cols): Persistent Live Real-Time Preview Stage */}
        <div className="lg:col-span-6 bg-[#0B0F17] border border-[#2C384E] p-6 rounded-2xl flex flex-col items-center justify-center relative shadow-2xl min-h-[520px]">
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-extrabold shadow-lg">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>✨ What's Cooking: Live Real-Time Preview</span>
          </div>

          <div className="relative aspect-square w-full max-w-lg rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center mt-6">
            {isRendering && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-amber-400 text-xs font-semibold space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                <span>Compositing 1080x1080 HD Canvas...</span>
              </div>
            )}

            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400" />
            High-Resolution 1080x1080 Square Post (Instagram & Facebook Ready)
          </p>
        </div>
      </div>
    </div>
  );
};
