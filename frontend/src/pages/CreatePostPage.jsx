import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  CheckCircle2,
  Building2,
  BookmarkCheck,
  Layers,
  Image as ImageIcon,
  Edit3,
  ChevronRight,
  ChevronLeft,
  Plus,
  Download,
  Share2,
  ArrowLeft,
  Search,
  Check,
  Zap,
} from 'lucide-react';
import { brandKitApi } from '../services/brandkit.api';
import { postApi } from '../services/post.api';
import { useTemplates } from '../hooks/useTemplates';
import { useFrames } from '../hooks/useFrames';
import Pagination from '../components/common/Pagination';
import { useCanvasCompositor } from '../hooks/useCanvasCompositor';
import { QUERY_KEYS } from '../constants/queryKeys';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const CreatePostPage = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const passedTemplate = location.state?.template;
  const templateIdParam = searchParams.get('templateId');

  // Wizard Active Step State (1: Template, 2: Frame, 3: Details, 4: Export)
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(passedTemplate?.id || templateIdParam || '');
  const [customBaseImage, setCustomBaseImage] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Template Search & Central Pagination State (6 per page)
  const [templatePage, setTemplatePage] = useState(1);
  const [templateLimit, setTemplateLimit] = useState(6);
  const [templateSearch, setTemplateSearch] = useState('');

  // Canva Frames Central Pagination State (6 per page)
  const [framePage, setFramePage] = useState(1);
  const [frameLimit, setFrameLimit] = useState(6);
  const [frameSearch, setFrameSearch] = useState('');

  // Modular Hook for Graphic Templates with Central Pagination
  const {
    templates,
    meta: templatesMeta,
    isLoading: isLoadingTemplates,
  } = useTemplates({
    page: templatePage,
    limit: templateLimit,
    search: templateSearch,
  });

  // Modular Hook for Canva Frames with Central Pagination
  const {
    frames,
    meta: framesMeta,
    isLoading: isLoadingFrames,
  } = useFrames({
    page: framePage,
    limit: frameLimit,
    search: frameSearch,
  });

  // Fetch User's BrandKit from DB
  const { data: brandKitResponse } = useQuery({
    queryKey: ['brandKit'],
    queryFn: () => brandKitApi.getBrandKit(),
  });

  const brandKit = brandKitResponse?.data?.brandKit;

  // Determine current active base template
  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) ||
    passedTemplate ||
    templates[0] ||
    null;

  // Auto-select initial template ID if none selected
  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  // Default select first frame when frames load
  useEffect(() => {
    if (frames.length > 0 && !selectedFrame) {
      setSelectedFrame(frames[0]);
    }
  }, [frames, selectedFrame]);

  // Live Overrides for Business Details
  const [customDetails, setCustomDetails] = useState({
    businessName: '',
    phone: '',
    address: '',
    tagline: '',
    whatsapp: '',
    email: '',
    instagramHandle: '',
    facebookHandle: '',
    city: '',
    state: '',
    country: '',
    websiteUrl: '',
    showLogo: true,
    showAvatar: true,
    showPhone: true,
    showAddress: true,
  });

  // Populate customDetails whenever brandKit or selectedFrame loads
  useEffect(() => {
    const newDetails = {};

    // 1. First map all fields from user's BrandKit
    if (brandKit?.businessName) newDetails.businessName = brandKit.businessName;
    if (brandKit?.phone || brandKit?.whatsapp) newDetails.phone = brandKit.phone || brandKit.whatsapp;
    if (brandKit?.whatsapp) newDetails.whatsapp = brandKit.whatsapp;
    if (brandKit?.email) newDetails.email = brandKit.email;
    if (brandKit?.instagramHandle) newDetails.instagramHandle = brandKit.instagramHandle;
    if (brandKit?.facebookHandle) newDetails.facebookHandle = brandKit.facebookHandle;
    if (brandKit?.address) newDetails.address = brandKit.address;
    if (brandKit?.city) newDetails.city = brandKit.city;
    if (brandKit?.state) newDetails.state = brandKit.state;
    if (brandKit?.country) newDetails.country = brandKit.country;
    if (brandKit?.websiteUrl) newDetails.websiteUrl = brandKit.websiteUrl;
    if (brandKit?.tagline) newDetails.tagline = brandKit.tagline;

    setCustomDetails((prev) => ({
      ...prev,
      ...newDetails,
    }));
  }, [brandKit, selectedFrame]);

  const baseImageUrl =
    customBaseImage ||
    currentTemplate?.baseImageUrl ||
    currentTemplate?.imageUrl ||
    currentTemplate?.fileUrl ||
    currentTemplate?.bannerUrl;

  // HTML5 Canvas Compositor Engine Hook
  const { isRendering, dataUrl } = useCanvasCompositor(
    canvasRef,
    baseImageUrl,
    selectedFrame,
    brandKit,
    customDetails
  );

  // Save Generated Post Mutation
  const savePostMutation = useMutation({
    mutationFn: (postData) => postApi.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
      setSaveSuccess('🎉 Final composited post saved to Cloudinary, DB & Vault!');
      setTimeout(() => setSaveSuccess(''), 4000);
    },
  });

  // Handle Save Post to DB
  const handleSaveToDb = () => {
    if (!dataUrl) return;
    savePostMutation.mutate({
      templateId: currentTemplate?.id || null,
      festivalId: currentTemplate?.festivalId || null,
      frameId: selectedFrame?.id || null,
      base64Graphic: dataUrl,
      userConfigJson: customDetails,
      status: 'DRAFT',
    });
  };

  // Handle Download HD PNG & Save to Cloud/DB
  const handleDownloadHD = () => {
    if (!dataUrl) return;

    // 1. Trigger client browser file download
    const link = document.createElement('a');
    link.download = `${currentTemplate?.title || 'BrandFlow-Post'}-1080x1080.png`;
    link.href = dataUrl;
    link.click();

    // 2. Automatically save pre-rendered PNG to Cloudinary CDN & Database for future scheduling
    handleSaveToDb();
  };

  const steps = [
    { id: 1, title: 'Select Base Template', subtitle: 'Choose graphic or upload custom' },
    { id: 2, title: 'Choose Canva Frame', subtitle: 'Pick vector overlay design' },
    { id: 3, title: 'BrandKit Details', subtitle: 'Auto-fill business details' },
    { id: 4, title: 'Review & Export HD', subtitle: 'Save draft or download PNG' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Wizard Progress Stepper */}
      <div className="bg-[#131B2A] border border-[#2C384E] p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" /> Interactive Post Wizard
            </div>
            <h1 className="font-heading text-2xl font-extrabold text-white">
              Create Branded Social Media Graphic
            </h1>
            <p className="text-xs text-slate-400">
              Follow the guided step-by-step studio while previewing your post live in real-time.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-[#2C384E]">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
                    : isCompleted
                    ? 'bg-[#0B0F17] border-emerald-500/50 hover:border-emerald-400'
                    : 'bg-[#0B0F17]/60 border-[#2C384E] opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : isCompleted
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                </div>
                <div className="truncate">
                  <p
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (6 Cols): Focused Step Control Panel */}
        <div className="lg:col-span-6 space-y-6">
          {/* STEP 1: Select Base Template */}
          {currentStep === 1 && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Step 1: Select Base Graphic Template</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pick a pre-designed festival graphic or upload your custom background image.</p>
                </div>

                <label className="cursor-pointer text-xs text-amber-400 font-semibold hover:underline bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition hover:bg-amber-500/20">
                  <Plus className="w-3.5 h-3.5" /> Upload Custom Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setCustomBaseImage(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Template Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => {
                    setTemplateSearch(e.target.value);
                    setTemplatePage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
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
                          ? 'border-amber-500 ring-2 ring-amber-500/40'
                          : 'border-[#2C384E] bg-[#0B0F17] hover:border-slate-500'
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

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-end pt-3 border-t border-[#2C384E]">
                <Button variant="primary" onClick={() => setCurrentStep(2)}>
                  Next Step: Choose Canva Frame <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: Choose Canva Frame */}
          {currentStep === 2 && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-5 space-y-4 shadow-xl">
              <div className="border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Step 2: Apply Canva Vector Frame Overlay</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Select a vector frame containing text slots, logo boxes, and avatar rings.</p>
              </div>

              {/* Clean 6-Item Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[220px]">
                {isLoadingFrames ? (
                  <div className="col-span-3 p-12 text-center text-slate-400 text-xs">Loading Canva frames...</div>
                ) : frames.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                    No active Canva frames available.
                  </div>
                ) : (
                  frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame)}
                      className={`relative aspect-square rounded-xl border overflow-hidden p-2 flex flex-col items-center justify-center transition ${
                        selectedFrame?.id === frame.id
                          ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/10'
                          : 'border-[#2C384E] bg-[#0B0F17] hover:border-slate-500'
                      }`}
                    >
                      {frame.overlayPngUrl ? (
                        <img src={frame.overlayPngUrl} alt={frame.title} className="w-full h-full object-contain" />
                      ) : (
                        <Layers className="w-8 h-8 text-slate-500 mb-1" />
                      )}
                      <span className="text-[11px] font-bold text-slate-200 truncate w-full text-center mt-1">
                        {frame.title}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Modular Central Pagination */}
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

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                  Next Step: BrandKit Info <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Customize BrandKit Details */}
          {currentStep === 3 && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-5 space-y-4 shadow-xl">
              <div className="border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Step 3: Customize BrandKit Details & Overrides</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Live business info auto-filled into vector frame slots. Edit details to update immediately.</p>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Input
                  label="Business Name"
                  value={customDetails.businessName}
                  onChange={(e) => setCustomDetails({ ...customDetails, businessName: e.target.value })}
                />

                <Input
                  label="Phone / WhatsApp"
                  value={customDetails.phone}
                  onChange={(e) => setCustomDetails({ ...customDetails, phone: e.target.value })}
                />

                <Input
                  label="Address / Location"
                  value={customDetails.address}
                  onChange={(e) => setCustomDetails({ ...customDetails, address: e.target.value })}
                />

                <Input
                  label="Tagline / Designation"
                  value={customDetails.tagline}
                  onChange={(e) => setCustomDetails({ ...customDetails, tagline: e.target.value })}
                />
              </div>

              {/* Element Display Toggles */}
              <div className="pt-3 border-t border-[#2C384E] space-y-2">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Element Visibility Controls
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-[#0B0F17] p-2 rounded-lg border border-[#2C384E]">
                    <input
                      type="checkbox"
                      checked={customDetails.showLogo}
                      onChange={(e) => setCustomDetails({ ...customDetails, showLogo: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Show Business Logo</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-[#0B0F17] p-2 rounded-lg border border-[#2C384E]">
                    <input
                      type="checkbox"
                      checked={customDetails.showAvatar}
                      onChange={(e) => setCustomDetails({ ...customDetails, showAvatar: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Show Headshot Avatar</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-[#0B0F17] p-2 rounded-lg border border-[#2C384E]">
                    <input
                      type="checkbox"
                      checked={customDetails.showPhone}
                      onChange={(e) => setCustomDetails({ ...customDetails, showPhone: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Show Phone Number</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer bg-[#0B0F17] p-2 rounded-lg border border-[#2C384E]">
                    <input
                      type="checkbox"
                      checked={customDetails.showAddress}
                      onChange={(e) => setCustomDetails({ ...customDetails, showAddress: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Show Address</span>
                  </label>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button variant="primary" onClick={() => setCurrentStep(4)}>
                  Next Step: Review & Export <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: Review & Export HD Graphic */}
          {currentStep === 4 && (
            <Card className="border-[#2C384E] bg-[#131B2A] p-5 space-y-4 shadow-xl">
              <div className="border-b border-[#2C384E] pb-3">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Step 4: Final Review & High-Resolution Export</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Your composited social post graphic is ready for download or saving.</p>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-[#0B0F17] border border-[#2C384E] text-xs">
                <div className="flex justify-between border-b border-[#2C384E] pb-2">
                  <span className="text-slate-400 font-semibold">Active Template:</span>
                  <span className="text-amber-400 font-bold">{currentTemplate?.title || 'Custom Upload'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2C384E] pb-2">
                  <span className="text-slate-400 font-semibold">Canva Frame Overlay:</span>
                  <span className="text-white font-bold">{selectedFrame?.title || 'Default Overlay'}</span>
                </div>
                <div className="flex justify-between border-b border-[#2C384E] pb-2">
                  <span className="text-slate-400 font-semibold">Business Name:</span>
                  <span className="text-white font-bold">{customDetails.businessName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Export Canvas Specs:</span>
                  <span className="text-emerald-400 font-bold">1080 x 1080 Square PNG (HD)</span>
                </div>
              </div>

              {/* Main Export Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={handleDownloadHD}
                  className="w-full justify-center text-sm font-bold py-3"
                >
                  Download 1080x1080 HD PNG
                </Button>

                <Button
                  variant="outline"
                  icon={BookmarkCheck}
                  onClick={handleSaveToDb}
                  isLoading={savePostMutation.isPending}
                  className="w-full justify-center border-[#2C384E] text-slate-300 hover:text-white"
                >
                  Save Post Draft to Vault
                </Button>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[#2C384E]">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Details
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (6 Cols): Persistent "What's Cooking: Live Real-Time Preview" Stage */}
        <div className="lg:col-span-6 bg-[#0B0F17] border border-[#2C384E] p-6 rounded-2xl flex flex-col items-center justify-center relative shadow-2xl min-h-[520px]">
          {/* Top Status Floating Badge */}
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

            {/* 60 FPS Ultra-Fast Direct HTML5 1080x1080 Canvas */}
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
