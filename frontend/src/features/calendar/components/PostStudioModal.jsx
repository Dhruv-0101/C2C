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
} from 'lucide-react';
import { brandKitApi } from '../../../services/brandkit.api';
import { frameApi } from '../../../services/frame.api';
import { templateApi } from '../../../services/template.api';
import { postApi } from '../../../services/post.api';
import { useCanvasCompositor } from '../../../hooks/useCanvasCompositor';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const PostStudioModal = ({ isOpen, onClose, template }) => {
  const queryClient = useQueryClient();
  const canvasRef = useRef(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(template?.id || '');
  const [customBaseImage, setCustomBaseImage] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(true);

  // Sync selectedTemplateId whenever modal opens or template prop changes
  useEffect(() => {
    if (isOpen && template?.id) {
      setSelectedTemplateId(template.id);
    }
  }, [isOpen, template]);

  // Fetch Graphic Templates from DB
  const { data: templatesResponse } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates(),
    enabled: isOpen,
  });

  // Fetch User's BrandKit from DB
  const { data: brandKitResponse } = useQuery({
    queryKey: ['brandKit'],
    queryFn: () => brandKitApi.getBrandKit(),
    enabled: isOpen,
  });

  // Fetch Available Frames from DB
  const { data: framesResponse } = useQuery({
    queryKey: ['frames'],
    queryFn: () => frameApi.getFrames(),
    enabled: isOpen,
  });

  const brandKit = brandKitResponse?.data?.brandKit;
  const frames = framesResponse?.data?.frames || [];

  // Live Overrides for Business Details
  const [customDetails, setCustomDetails] = useState({
    businessName: '',
    phone: '',
    address: '',
    tagline: '',
    showLogo: true,
    showAvatar: true,
    showPhone: true,
    showAddress: true,
  });

  // Default select first frame when frames load
  useEffect(() => {
    if (frames.length > 0 && !selectedFrame) {
      setSelectedFrame(frames[0]);
    }
  }, [frames, selectedFrame]);

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

    // 2. Map sample text from selectedFrame.configJson.elements if field is still empty
    if (selectedFrame?.configJson?.elements) {
      selectedFrame.configJson.elements
        .filter((el) => el.type === 'TEXT')
        .forEach((el) => {
          const key = el.fieldKey || el.dynamicSlot || el.id;
          const slotMap = {
            BUSINESS_NAME: 'businessName',
            PHONE: 'phone',
            WHATSAPP: 'whatsapp',
            EMAIL: 'email',
            INSTAGRAM: 'instagramHandle',
            FACEBOOK: 'facebookHandle',
            ADDRESS: 'address',
            CITY: 'city',
            STATE: 'state',
            COUNTRY: 'country',
            WEBSITE: 'websiteUrl',
            TAGLINE: 'tagline',
          };
          const valKey = slotMap[el.dynamicSlot] || key;

          const sampleVal = el.text || el.customLabel || '';

          if (!newDetails[valKey] && sampleVal) {
            newDetails[valKey] = sampleVal;
          }
          if (key !== valKey && !newDetails[key] && sampleVal) {
            newDetails[key] = sampleVal;
          }
        });
    }

    setCustomDetails((prev) => ({
      ...prev,
      ...newDetails,
    }));
  }, [brandKit, selectedFrame]);

  const templates = templatesResponse?.data?.templates || [];
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || template || templates[0];
  const baseImageUrl = customBaseImage || currentTemplate?.imageUrl || currentTemplate?.fileUrl || currentTemplate?.bannerUrl;

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
      queryClient.invalidateQueries(['posts']);
      setSaveSuccess('🎉 Final composited post saved to your database!');
      setTimeout(() => setSaveSuccess(''), 4000);
    },
  });

  if (!isOpen || !template) return null;

  // Handle Save Post to DB
  const handleSaveToDb = () => {
    if (!dataUrl) return;
    savePostMutation.mutate({
      templateId: template.id || null,
      festivalId: template.festivalId || null,
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
    link.download = `${template.title || 'BrandFlow-Post'}-1080x1080.png`;
    link.href = dataUrl;
    link.click();

    // 2. Save pre-rendered PNG to Cloudinary CDN & Database for future scheduling
    handleSaveToDb();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#131B2A] border border-[#2C384E] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[92vh]">
        {/* Left Column: Live Canvas Preview */}
        <div className="md:w-1/2 bg-[#0B0F17] p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-[#2C384E] overflow-y-auto">
          <div className="relative aspect-square w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 flex items-center justify-center">
            {isRendering && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-amber-400 text-xs font-semibold space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
                <span>Compositing HD Canvas...</span>
              </div>
            )}

            {/* 60 FPS Ultra-Fast Direct HTML5 1080x1080 Canvas */}
            <canvas ref={canvasRef} className="w-full h-full object-contain" />
          </div>
          <p className="text-[11px] text-slate-400 mt-3 text-center">
            High-Resolution 1080x1080 Square Post (Instagram & Facebook Ready)
          </p>
        </div>

        {/* Right Column: Frame Switcher & Custom Business Details */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[85vh]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" /> AI Post Compositor
                </div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  {template.title || 'Festival Post'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Visual Base Graphic Template & Custom Image Upload Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Base Graphic Template</span>
                </label>
                <label className="cursor-pointer text-[11px] text-amber-400 font-semibold hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  <span>Custom Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCustomBaseImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {/* Grid of Graphic Base Templates */}
              <div className="grid grid-cols-3 gap-2.5 max-h-44 overflow-y-auto pr-1">
                {/* Active Custom Upload Preview if selected */}
                {customBaseImage && (
                  <div className="p-1 rounded-xl border-2 border-amber-500 bg-amber-500/10 text-center relative aspect-square">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-1.5 right-1.5 z-10" />
                    <img src={customBaseImage} alt="Custom Background" className="w-full h-full object-cover rounded-lg" />
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold bg-black/80 text-amber-400 py-0.5 rounded text-center truncate">
                      Custom Upload
                    </span>
                  </div>
                )}

                {/* Default Festival/Current Template Option */}
                {template && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setCustomBaseImage(null);
                    }}
                    className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-between relative aspect-square overflow-hidden group ${
                      !customBaseImage && (selectedTemplateId === template.id || !selectedTemplateId)
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
                        : 'border-[#2C384E] bg-[#0B0F17] hover:border-slate-600'
                    }`}
                  >
                    {!customBaseImage && (selectedTemplateId === template.id || !selectedTemplateId) && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-1.5 right-1.5 z-10" />
                    )}
                    {template.imageUrl || template.fileUrl || template.bannerUrl ? (
                      <img src={template.imageUrl || template.fileUrl || template.bannerUrl} alt={template.title} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                        {template.title}
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold bg-black/75 text-white py-0.5 px-1 rounded truncate">
                      {template.title || 'Festival Graphic'}
                    </span>
                  </button>
                )}

                {/* Additional DB Graphic Templates */}
                {templates
                  .filter((t) => t.id !== template?.id)
                  .map((t) => {
                    const isSelected = !customBaseImage && selectedTemplateId === t.id;
                    const imgUrl = t.imageUrl || t.fileUrl || t.bannerUrl;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(t.id);
                          setCustomBaseImage(null);
                        }}
                        className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center justify-between relative aspect-square overflow-hidden group ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/50'
                            : 'border-[#2C384E] bg-[#0B0F17] hover:border-slate-600'
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-1.5 right-1.5 z-10" />
                        )}
                        {imgUrl ? (
                          <img src={imgUrl} alt={t.title} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                            {t.title}
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 right-1 text-[9px] font-semibold bg-black/75 text-white py-0.5 px-1 rounded truncate">
                          {t.title}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Visual Transparent PNG Frame Overlay Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Frame Overlay</span>
                </label>
                <span className="text-[10px] text-amber-400 font-mono truncate max-w-[150px]">
                  {selectedFrame ? selectedFrame.title : 'No Frame Selected'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 max-h-44 overflow-y-auto pr-1">
                {/* Option 1: No Frame */}
                <button
                  type="button"
                  onClick={() => setSelectedFrame(null)}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center relative aspect-square ${
                    selectedFrame === null
                      ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-2 ring-amber-500/50'
                      : 'border-[#2C384E] bg-[#0B0F17] text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {selectedFrame === null && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-1.5 right-1.5" />
                  )}
                  <X className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-[11px] leading-tight font-semibold">No Frame</span>
                </button>

                {/* Database PNG Frames */}
                {frames.map((f) => {
                  const isSelected = selectedFrame?.id === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFrame(f)}
                      className={`p-2 rounded-xl border text-left transition flex flex-col justify-between relative aspect-square group overflow-hidden ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold ring-2 ring-amber-500/50'
                          : 'border-[#2C384E] bg-[#0B0F17] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-1.5 right-1.5 z-10" />
                      )}

                      {/* PNG Frame Thumbnail Image */}
                      <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800 p-1">
                        {f.overlayPngUrl ? (
                          <img src={f.overlayPngUrl} alt={f.title} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-500">PNG</span>
                        )}
                      </div>

                      <span className="text-[10px] font-semibold text-white truncate w-full mt-1.5 text-center block">
                        {f.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Business Details Section */}
            <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#2C384E] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Business Frame Details</span>
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingDetails(!isEditingDetails)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingDetails ? 'Done' : 'Customize Details'}</span>
                  {isEditingDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {isEditingDetails ? (
                <div className="space-y-3 pt-2 border-t border-[#2C384E]">
                  {/* Dynamic Image Upload Slots defined by Admin */}
                  {selectedFrame?.configJson?.elements?.some(
                    (el) => el.slotCategory === 'IMAGE_SLOT' || el.dynamicSlot === 'LOGO_BOX' || el.dynamicSlot === 'AVATAR_CIRCLE'
                  ) && (
                    <div className="space-y-3 pt-2 border-t border-[#2C384E]">
                      <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Required Frame Photo & Logo Slots:</span>
                      </p>
                      {selectedFrame.configJson.elements
                        .filter(
                          (el) => el.slotCategory === 'IMAGE_SLOT' || el.dynamicSlot === 'LOGO_BOX' || el.dynamicSlot === 'AVATAR_CIRCLE'
                        )
                        .map((el) => {
                          const slotKey = el.id || el.fieldKey || el.dynamicSlot;
                          const isAvatar = el.dynamicSlot === 'AVATAR_CIRCLE' || el.type === 'CIRCLE';
                          const label = el.customLabel || el.name || (isAvatar ? 'Profile Headshot Photo' : 'Business Logo Box');

                          const activeUrl =
                            customDetails[slotKey] ||
                            (isAvatar ? customDetails.avatarUrl || brandKit?.avatarUrl : customDetails.logoUrl || brandKit?.logoUrl);

                          return (
                            <div key={el.id} className="p-3 rounded-xl bg-[#131B2A] border border-[#2C384E] space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  {isAvatar ? '👤' : '🏢'} {label}
                                </span>
                                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                  {isAvatar ? 'Circle Ring' : 'Logo Box'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {activeUrl ? (
                                  <img src={activeUrl} alt={label} className="w-10 h-10 rounded-lg object-contain bg-slate-900 border border-slate-700" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                                    No Image
                                  </div>
                                )}

                                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition">
                                  Upload {label}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setCustomDetails((prev) => ({
                                          ...prev,
                                          [slotKey]: reader.result,
                                          ...(el.dynamicSlot === 'AVATAR_CIRCLE' ? { avatarUrl: reader.result } : {}),
                                          ...(el.dynamicSlot === 'LOGO_BOX' ? { logoUrl: reader.result } : {}),
                                        }));
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Render EXACT Dynamic Text Input Fields Configured by Admin */}
                  {selectedFrame?.configJson?.elements
                    ?.filter((el) => (el.slotCategory === 'TEXT_INPUT' || el.type === 'TEXT') && el.dynamicSlot !== 'NONE')
                    .map((el) => {
                      let key = el.fieldKey || el.dynamicSlot;
                      let label = el.customLabel || el.name || 'Text Field';
                      let valKey = key;

                      if (el.dynamicSlot === 'BUSINESS_NAME') { label = 'Business Name'; valKey = 'businessName'; }
                      else if (el.dynamicSlot === 'PHONE') { label = 'Phone / WhatsApp'; valKey = 'phone'; }
                      else if (el.dynamicSlot === 'ADDRESS') { label = 'Address / Location'; valKey = 'address'; }
                      else if (el.dynamicSlot === 'TAGLINE') { label = 'Tagline / Designation'; valKey = 'tagline'; }

                      return (
                        <Input
                          key={el.id}
                          label={label}
                          placeholder={`Enter ${label}...`}
                          value={customDetails[valKey] !== undefined ? customDetails[valKey] : (customDetails[key] || '')}
                          onChange={(e) => setCustomDetails({ ...customDetails, [valKey]: e.target.value, [key]: e.target.value })}
                        />
                      );
                    })}

                  {/* Fallback to standard fields if selectedFrame has no JSON config */}
                  {(!selectedFrame?.configJson?.elements || selectedFrame.configJson.elements.length === 0) && (
                    <>
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
                    </>
                  )}

                  {/* Element Toggles */}
                  <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customDetails.showLogo}
                        onChange={(e) => setCustomDetails({ ...customDetails, showLogo: e.target.checked })}
                        className="accent-amber-500 rounded"
                      />
                      <span>Show Logo</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customDetails.showAvatar}
                        onChange={(e) => setCustomDetails({ ...customDetails, showAvatar: e.target.checked })}
                        className="accent-amber-500 rounded"
                      />
                      <span>Show Headshot</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customDetails.showPhone}
                        onChange={(e) => setCustomDetails({ ...customDetails, showPhone: e.target.checked })}
                        className="accent-amber-500 rounded"
                      />
                      <span>Show Phone</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#2C384E] text-right">
                    <Link to="/brand-kit" className="text-[11px] text-amber-400 hover:underline">
                      Update Master BrandKit in DB ➔
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-slate-300 space-y-0.5">
                  <p className="font-bold text-white text-xs">{customDetails.businessName || brandKit?.businessName || 'Your Business Name'}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    📞 {customDetails.phone || 'No phone'} | 📍 {customDetails.address || 'No location'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#2C384E]">
            <Button
              variant="outline"
              size="lg"
              icon={BookmarkCheck}
              onClick={handleSaveToDb}
              isLoading={savePostMutation.isPending}
              disabled={!dataUrl || isRendering}
              className="w-full sm:w-auto text-xs"
            >
              Save Post to DB
            </Button>

            <Button
              variant="primary"
              size="lg"
              icon={Download}
              onClick={handleDownloadHD}
              disabled={!dataUrl || isRendering}
              className="w-full sm:flex-1 text-xs"
            >
              Download HD Post (PNG)
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PostStudioModal;
