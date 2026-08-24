import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Download,
  X,
  Sparkles,
  CheckCircle2,
  Building2,
  BookmarkCheck,
  Layers,
  Image as ImageIcon,
  Edit3,
  ChevronDown,
  ChevronUp,
  Plus,
  Share2,
} from 'lucide-react';
import { brandKitApi } from '../../../services/brandkit.api';
import { frameApi } from '../../../services/frame.api';
import { templateApi } from '../../../services/template.api';
import { postApi } from '../../../services/post.api';
import { useCanvasCompositor } from '../../../hooks/useCanvasCompositor';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { SocialPublisherModal } from '../../post-studio/components/SocialPublisherModal';

export const PostStudioModal = ({ isOpen, onClose, template }) => {
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);

  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(template || null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'frames' | 'details'
  const [isPublisherOpen, setIsPublisherOpen] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (template) setSelectedTemplate(template);
  }, [template]);

  // Fetch BrandKit from API
  const { data: brandKitResponse, isLoading: isLoadingBrandKit } = useQuery({
    queryKey: ['brandKit'],
    queryFn: () => brandKitApi.getBrandKit(),
    enabled: isOpen,
  });

  // Fetch Templates from API
  const { data: templatesResponse, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates(),
    enabled: isOpen,
  });

  // Fetch Canva Vector Frames from API
  const { data: framesResponse, isLoading: isLoadingFrames } = useQuery({
    queryKey: ['frames'],
    queryFn: () => frameApi.getFrames(),
    enabled: isOpen,
  });

  const brandKit = brandKitResponse?.data?.brandKit;
  const templates = templatesResponse?.data?.templates || [];
  const frames = framesResponse?.data?.frames || [];

  // Default select first template & frame if none selected
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  useEffect(() => {
    if (!selectedFrame && frames.length > 0) {
      setSelectedFrame(frames[0]);
    }
  }, [frames, selectedFrame]);

  // Editable Brand Details State
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

  // Sync customDetails when brandKit or selectedFrame updates
  useEffect(() => {
    const newDetails = {};
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

    setCustomDetails((prev) => ({ ...prev, ...newDetails }));
  }, [brandKit, selectedFrame]);

  const baseImageUrl = selectedTemplate?.baseImageUrl || selectedTemplate?.imageUrl || selectedTemplate?.bannerUrl;

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
      setSaveSuccess('🎉 Final post saved to Cloudinary, DB & Vault!');
      setTimeout(() => setSaveSuccess(''), 4000);
    },
  });

  if (!isOpen) return null;

  const handleSaveToDb = () => {
    if (!dataUrl) return;
    savePostMutation.mutate({
      templateId: selectedTemplate?.id || null,
      festivalId: selectedTemplate?.festivalId || null,
      frameId: selectedFrame?.id || null,
      base64Graphic: dataUrl,
      userConfigJson: customDetails,
      status: 'DRAFT',
    });
  };

  const handleDownloadHD = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${selectedTemplate?.title || 'BrandFlow-Post'}-1080x1080.png`;
    link.href = dataUrl;
    link.click();
    handleSaveToDb();
  };

  const publisherPayload = {
    templateId: selectedTemplate?.id || null,
    festivalId: selectedTemplate?.festivalId || null,
    base64Graphic: dataUrl,
    occasionName: selectedTemplate?.title || 'Branded Social Graphic',
    customText: customDetails?.tagline || customDetails?.businessName,
    userConfigJson: customDetails,
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="w-full max-w-5xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                BrandFlow Studio — Master Graphic Compositor
              </h3>
              <p className="text-xs text-slate-400">
                1080x1080 HD Canva Frame Engine with AI BrandKit & Overlay Slots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveSuccess && <Alert variant="success" message={saveSuccess} />}

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1">
          {/* LEFT: Live Preview Stage (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#0B0F17] border border-[#2C384E] p-4 rounded-xl relative shadow-2xl min-h-[380px]">
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[11px] font-extrabold shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live 1080x1080 Compositor Engine</span>
            </div>

            <div className="relative aspect-square w-full max-w-md rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center mt-6">
              {isRendering && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-amber-400 text-xs font-semibold space-y-2">
                  <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                  <span>Compositing 1080x1080 HD Canvas...</span>
                </div>
              )}

              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              HD 1080x1080 Square Post (Instagram & Facebook Ready)
            </p>
          </div>

          {/* RIGHT: Control Tabs & Options (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Tab Controls */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-xs font-bold shrink-0">
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                  activeTab === 'templates'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Graphic</span>
              </button>

              <button
                onClick={() => setActiveTab('frames')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                  activeTab === 'frames'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Frame</span>
              </button>

              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${
                  activeTab === 'details'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>
            </div>

            {/* Tab 1: Select Master Graphic Template */}
            {activeTab === 'templates' && (
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Base Graphic Background
                  </h4>
                  <span className="text-[11px] text-amber-400 font-mono font-bold">
                    {templates.length} Available
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {isLoadingTemplates ? (
                    <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
                      Loading templates...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="col-span-2 p-6 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                      No templates found.
                    </div>
                  ) : (
                    templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`relative aspect-square rounded-xl border p-1 overflow-hidden transition group ${
                          selectedTemplate?.id === t.id
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40'
                            : 'border-[#2C384E] bg-[#0B0F17] hover:border-slate-500'
                        }`}
                      >
                        <img
                          src={t.baseImageUrl || t.imageUrl}
                          alt={t.title}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 truncate rounded-b-lg">
                          <p className="text-[10px] font-bold text-white truncate">{t.title}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Select Canva Vector Frame */}
            {activeTab === 'frames' && (
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Canva Vector Overlay Frame
                  </h4>
                  <span className="text-[11px] text-amber-400 font-mono font-bold">
                    {frames.length} Active Frames
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {isLoadingFrames ? (
                    <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
                      Loading Canva frames...
                    </div>
                  ) : frames.length === 0 ? (
                    <div className="col-span-2 p-6 text-center text-slate-400 text-xs border border-dashed border-[#2C384E] rounded-xl">
                      No Canva vector frames created yet.
                    </div>
                  ) : (
                    frames.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setSelectedFrame(frame)}
                        className={`relative aspect-square rounded-xl border p-2 overflow-hidden transition group ${
                          selectedFrame?.id === frame.id
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40'
                            : 'border-[#2C384E] bg-[#0B0F17] hover:border-slate-500'
                        }`}
                      >
                        <img
                          src={frame.overlayPngUrl}
                          alt={frame.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 truncate rounded-b-lg">
                          <p className="text-[10px] font-bold text-white truncate">{frame.title}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Custom BrandKit Details */}
            {activeTab === 'details' && (
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1 text-xs">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  BrandKit Detail Overrides
                </h4>

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
                  label="Tagline / Offer Text"
                  value={customDetails.tagline}
                  onChange={(e) => setCustomDetails({ ...customDetails, tagline: e.target.value })}
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="space-y-2 pt-3 border-t border-[#2C384E] mt-auto">
              <Button
                variant="primary"
                size="lg"
                icon={Share2}
                onClick={() => setIsPublisherOpen(true)}
                disabled={!dataUrl || isRendering}
                className="w-full justify-center text-xs font-extrabold bg-gradient-to-r from-amber-500 to-teal-500 text-slate-950 border-0 shadow-lg"
              >
                🚀 Share / Publish to Social Media
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={BookmarkCheck}
                  onClick={handleSaveToDb}
                  isLoading={savePostMutation.isPending}
                  disabled={!dataUrl || isRendering}
                  className="w-full text-[11px]"
                >
                  Save Draft
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleDownloadHD}
                  disabled={!dataUrl || isRendering}
                  className="w-full text-[11px]"
                >
                  Download PNG
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SocialPublisherModal
        isOpen={isPublisherOpen}
        onClose={() => setIsPublisherOpen(false)}
        postData={publisherPayload}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VAULT.ALL });
        }}
      />
    </div>,
    document.body
  );
};

export default PostStudioModal;
