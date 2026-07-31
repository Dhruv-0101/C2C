import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  X,
  Eye,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';
import { templateApi } from '../../services/template.api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

/**
 * Interactive Post Creator Studio Modal for SMB End-Users
 * Uses Sharp server compositing to overlay business brand kit details onto uploaded templates
 */
export const PostCreatorModal = ({ isOpen, onClose, initialTemplate = null }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate?.id || '');

  // Form State for User Post Customization
  const [headlineText, setHeadlineText] = useState('✨ Festival Special Offer — 30% OFF');

  // User Brand Kit Overrides
  const [brandKit, setBrandKit] = useState({
    businessName: 'Royal Electronics & Retail',
    phone: '+91 98765 43210',
    websiteUrl: 'www.royalelectronics.com',
    primaryColor: '#F59E0B',
    secondaryColor: '#0D9488',
  });

  const [renderedPostUrl, setRenderedPostUrl] = useState(null);

  // Fetch available templates
  const { data: templatesResponse } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templateApi.getTemplates(),
    enabled: isOpen,
  });

  const templates = templatesResponse?.data?.templates || [];
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || initialTemplate || templates[0];

  useEffect(() => {
    if (currentTemplate) {
      setSelectedTemplateId(currentTemplate.id);
      if (currentTemplate.baseImageUrl) {
        setRenderedPostUrl(currentTemplate.baseImageUrl);
      }
    }
  }, [currentTemplate]);

  // Run Sharp Server Compositing Render
  const handleRenderSharpPost = async () => {
    if (!currentTemplate?.id) return;
    setIsRendering(true);
    setErrorMsg('');

    try {
      const sharpRes = await templateApi.compositePost({
        templateId: currentTemplate.id,
        brandKit,
        customText: headlineText,
      });

      if (sharpRes.data?.finalGraphicUrl) {
        setRenderedPostUrl(sharpRes.data.finalGraphicUrl);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to render composited post image.');
    } finally {
      setIsRendering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-6 space-y-6 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">Post Customizer Studio</h3>
              <p className="text-xs text-slate-400">Customize headline text & brand kit to composite onto system templates using Sharp.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Live Graphic Render Preview Canvas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Eye className="w-4 h-4" /> Live Composited Post Output
              </label>
              <span className="text-[10px] font-mono text-slate-400">Sharp Compositing Engine</span>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black flex items-center justify-center group">
              {isRendering ? (
                <div className="flex flex-col items-center gap-3 text-amber-400 text-sm font-semibold">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span>Compositing Business Details with Sharp...</span>
                </div>
              ) : renderedPostUrl ? (
                <img src={renderedPostUrl} alt="Composited Post Output" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-500 text-xs">Select a template to render</div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold">
                ✨ Ready to Publish
              </div>
            </div>

            {/* Quick Publish Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" icon={Share2} className="w-full">
                Schedule & Publish Post
              </Button>
              <Button variant="outline" className="shrink-0" onClick={onClose}>
                Save to Drafts
              </Button>
            </div>
          </div>

          {/* RIGHT: System Template Selector & Brand Kit Form */}
          <div className="space-y-5 bg-[#0B0F17] p-5 rounded-2xl border border-[#2C384E]">
            {/* System Template Selector */}
            {templates.length > 0 ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Select System Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#131B2A] border border-[#2C384E] text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.festival?.name || t.category?.name || 'General'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#131B2A] text-slate-400 text-xs text-center border border-[#2C384E]">
                No templates uploaded in system yet.
              </div>
            )}

            {/* CUSTOM HEADLINE & BRAND KIT OVERRIDES */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders className="w-4 h-4" /> Brand Kit & Greeting Text Overrides
              </label>

              <Input
                label="Headline Greeting Text"
                placeholder="e.g. ✨ Festival Special Offer — 30% OFF"
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Business Name"
                  value={brandKit.businessName}
                  onChange={(e) => setBrandKit({ ...brandKit, businessName: e.target.value })}
                />
                <Input
                  label="Phone / WhatsApp"
                  value={brandKit.phone}
                  onChange={(e) => setBrandKit({ ...brandKit, phone: e.target.value })}
                />
              </div>

              <Button
                type="button"
                variant="primary"
                className="w-full text-xs py-3 mt-2"
                onClick={handleRenderSharpPost}
                isLoading={isRendering}
              >
                Render Branded Post with Sharp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
