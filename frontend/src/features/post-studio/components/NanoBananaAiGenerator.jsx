import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Wand2,
  RefreshCw,
  CheckCircle2,
  Info,
  Layers,
  Flame,
  ArrowRight,
  Eye,
  Trash2,
  Mic,
  MicOff,
  Globe,
  X,
  Gift,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAiPostImage } from '../hooks/useAiPostImage';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useAiJobTracker } from '../hooks/useAiJobTracker';
import { AiQueueTrackerCard } from './AiQueueTrackerCard';

const PROMPT_PRESETS = [
  { label: '🪔 Festive Celebration', prompt: 'Grand Indian Diwali festive celebration with glowing clay diyas, elegant golden sparkles, and traditional marigold floral decor' },
  { label: '🏷️ 50% Flash Sale', prompt: 'Modern bold 50% OFF weekend flash sale promotional visual with dynamic gradient lighting and floating confetti' },
  { label: '💎 Luxury Jewellery', prompt: 'Ultra-luxurious diamond and gold necklace display on velvet podium with soft dramatic spotlight and cinematic reflections' },
  { label: '☕ Cafe & Dining Promo', prompt: 'Artisanal cappuccino with latte art and freshly baked croissants on a rustic warm wooden cafe table with morning sunlight' },
  { label: '🏡 Modern Real Estate', prompt: 'Stunning luxury modern architectural villa with landscaped garden, glass facade, warm interior lighting at golden hour sunset' },
  { label: '✨ New Arrival', prompt: 'Exclusive new collection launch showcase on minimalist marble pedestal with pastel silk backdrop and soft studio shadows' },
];

const STYLE_PRESETS = [
  { id: 'Photorealistic', label: 'Photorealistic', icon: '📸' },
  { id: 'Festive Luxury', label: 'Festive Luxury', icon: '🪔' },
  { id: 'Modern Minimalist', label: 'Minimalist', icon: '🏛️' },
  { id: 'Studio Product', label: 'Studio Product', icon: '📦' },
  { id: 'Vibrant 3D Render', label: '3D Render', icon: '🎨' },
  { id: 'Warm Indian Heritage', label: 'Indian Heritage', icon: '🚩' },
];

/**
 * 🍌 NanoBananaAiGenerator Component
 * State-of-the-art commercial AI creative visual studio powered by Google Gemini Nano Banana 2.1.
 * Mobile-first, touch-optimized, and resilient with native Voice-to-Prompt support.
 */
export const NanoBananaAiGenerator = ({
  onSelectImage,
  activeImage,
  onClearImage,
  brandKit,
  onOpenCaptionGenerator,
  openPlanModal,
  subscription,
  postsRemaining = 0,
  isExpired = false,
  planName = 'FREE',
  activateFreeMutation,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic');
  const [generationNotice, setGenerationNotice] = useState(null);
  const basePromptRef = useRef('');

  const { generatePostImage, isGeneratingImage, imageError } = useAiPostImage();

  // ⏱️ BullMQ Asynchronous Queue & Timing Tracker
  const jobTracker = useAiJobTracker({
    type: 'image',
    onCompleted: (completedResult) => {
      const imgUrl = completedResult?.imageUrl;
      if (imgUrl) {
        onSelectImage(imgUrl);
        if (completedResult.isPendingBilling && completedResult.message) {
          setGenerationNotice(completedResult.message);
        } else {
          setGenerationNotice('Creative generated successfully with Nano Banana 2.1 ✨');
        }
      }
    },
    onError: (err) => {
      console.error('AI image generation worker failed:', err);
    },
  });

  // 🎙️ Voice-to-Text Regional Engine
  const {
    isListening,
    isSupported,
    voiceError,
    selectedLanguage,
    setSelectedLanguage,
    stopListening,
    toggleListening,
    supportedLanguages,
  } = useVoiceInput({
    defaultLanguage: 'hi-IN',
    onTranscriptUpdate: (spokenChunk, isFinal) => {
      const base = basePromptRef.current;
      const combined = base ? `${base} ${spokenChunk}` : spokenChunk;
      setPrompt(combined.slice(0, 500));
      if (isFinal) {
        basePromptRef.current = combined.slice(0, 500);
      }
    },
  });

  const handleToggleVoice = () => {
    if (!isListening) {
      basePromptRef.current = prompt.trim();
    }
    toggleListening();
  };

  const handleApplyPreset = (preset) => {
    setPrompt(preset.prompt);
    basePromptRef.current = preset.prompt;
  };

  const handleClearPrompt = () => {
    setPrompt('');
    basePromptRef.current = '';
    if (isListening) {
      stopListening();
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    if (isListening) {
      stopListening();
    }

    setGenerationNotice(null);

    try {
      const res = await generatePostImage({
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio: '1:1',
        occasionName: brandKit?.businessName || '',
      });

      // API Response Envelope: res = { success: true, message: "...", data: { isQueued, ... } }
      const resData = res?.data || res;

      if (resData?.isQueued) {
        // Enqueued in BullMQ Queue - start live countdown and position tracking
        jobTracker.startTracking(resData);
      } else {
        // Immediate synchronous completion or fallback
        const imgUrl = resData?.result?.imageUrl || resData?.imageUrl;
        if (imgUrl) {
          onSelectImage(imgUrl);
          if (resData?.result?.isPendingBilling && resData?.result?.message) {
            setGenerationNotice(resData.result.message);
          } else {
            setGenerationNotice('Creative generated successfully with Nano Banana 2.1 ✨');
          }
        }
      }
    } catch (err) {
      console.error('AI image generation failed:', err);
      const isPlanError =
        err?.response?.status === 403 ||
        err?.response?.data?.code === 'PLAN_REQUIRED' ||
        err?.response?.data?.code === 'PLAN_EXPIRED' ||
        err?.response?.data?.message?.toLowerCase().includes('plan');

      if (isPlanError) {
        setGenerationNotice(
          err?.response?.data?.message || 'A subscription plan is required to generate AI visuals. Please activate your free posts or upgrade.'
        );
        if (openPlanModal) {
          openPlanModal();
        }
      } else {
        setGenerationNotice(err?.response?.data?.message || 'Failed to generate visual. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-3.5 bg-gradient-to-br from-[#131B2A] via-[#101726] to-[#0B0F17] border border-[#2C384E] rounded-2xl p-3.5 sm:p-5 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#2C384E]/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-extrabold text-lg shadow-glow shrink-0">
            🍌
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-heading font-extrabold text-xs sm:text-sm text-white truncate">
                Nano Banana 2.1 AI Visual Creator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                Gemini Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Generate commercial post backdrops without rigid static templates.
            </p>
          </div>
        </div>

        {activeImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearImage}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 self-start sm:self-auto shrink-0 min-h-[32px]"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Reset Graphic</span>
          </Button>
        )}
      </div>

      {/* Plan Notice Banner inside Nano Banana AI Generator */}
      {(!subscription?.hasPlan || postsRemaining <= 0) && (
        <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
          !subscription?.hasPlan
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            {!subscription?.hasPlan ? (
              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block">
                {!subscription?.hasPlan
                  ? 'Plan Required to Generate'
                  : 'Post Quota Exhausted'}
              </span>
              <span className="text-[11px] text-slate-300 block truncate">
                {!subscription?.hasPlan
                  ? 'Activate 5 Free Posts or choose a plan to create visuals.'
                  : 'Upgrade your plan to generate more AI backdrops.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            {!subscription?.hasPlan && activateFreeMutation && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => activateFreeMutation.mutate()}
                disabled={activateFreeMutation.isPending}
                className="text-xs font-bold py-1 px-3 min-h-[30px]"
              >
                {activateFreeMutation.isPending ? 'Activating...' : 'Activate Free (5 Posts)'}
              </Button>
            )}
            {openPlanModal && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openPlanModal}
                className="text-xs py-1 px-2.5 min-h-[30px] border-[#2C384E] text-slate-200 hover:text-white"
              >
                <span>{!subscription?.hasPlan ? 'Plans' : 'Upgrade'}</span>
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Prompt Presets */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Inspiration Presets (Tap to fill)</span>
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar -mx-0.5 px-0.5">
          {PROMPT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1.5 rounded-xl bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] hover:border-amber-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition whitespace-nowrap shrink-0 cursor-pointer active:scale-95 min-h-[32px]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Box with Voice to Prompt */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Creative Visual Prompt</span>
          </label>

          {/* Voice Engine Controls (Language + Mic Pill) */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Regional Dialect Selector */}
            <div className="relative flex items-center max-w-[130px] sm:max-w-none">
              <Globe className="w-3.5 h-3.5 text-amber-400/80 absolute left-2 pointer-events-none" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isListening}
                className="w-full appearance-none bg-[#0B0F17] hover:bg-slate-900 text-slate-200 text-[11px] font-semibold border border-[#2C384E] focus:border-amber-500 rounded-xl pl-7 pr-6 py-1 transition cursor-pointer outline-none truncate"
                title="Select spoken language for voice recognition"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0 min-h-[30px] ${
                isListening
                  ? 'bg-rose-500/20 border border-rose-500 text-rose-300 animate-pulse shadow-glow'
                  : 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Bas karein (Stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bolkar Likhein 🎙️</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Audio Listening Soundwave Banner */}
        {isListening && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-rose-950/40 border border-rose-500/40 text-xs text-rose-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="flex items-end gap-1 h-3.5 pb-0.5">
                <span className="w-1 h-3.5 bg-rose-400 animate-bounce rounded-full" style={{ animationDuration: '600ms' }} />
                <span className="w-1 h-4 bg-amber-400 animate-bounce rounded-full" style={{ animationDuration: '450ms', animationDelay: '150ms' }} />
                <span className="w-1 h-2 bg-rose-400 animate-bounce rounded-full" style={{ animationDuration: '700ms', animationDelay: '300ms' }} />
                <span className="w-1 h-3.5 bg-yellow-300 animate-bounce rounded-full" style={{ animationDuration: '500ms', animationDelay: '200ms' }} />
              </div>
              <span className="font-medium text-[11px] leading-tight">
                🎙️ Sun rahe hain... Apni bhasha me boliye! Text neeche live type ho raha hai.
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/50 text-rose-200 shrink-0 cursor-pointer self-end sm:self-auto min-h-[28px]"
            >
              Done (Rokein)
            </button>
          </div>
        )}

        {/* Voice Error Notice */}
        {voiceError && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="flex-1">{voiceError}</span>
          </div>
        )}

        {/* Editable Textarea */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Apni bhasha me boliye ya type kijiye: e.g. Diwali pe mithai ke dabbe aur dry fruits par 20% discount..."
            className="w-full rounded-xl bg-[#0B0F17] border border-[#2C384E] focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 p-3 pr-8 text-xs text-white placeholder-slate-500 resize-none transition outline-none"
          />

          {prompt && (
            <button
              type="button"
              onClick={handleClearPrompt}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Clear prompt text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Helpful User Instruction */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-400/90">
            💡 <span>Bolne ke baad aap text me kuch bhi edit ya change kar sakte hain.</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">{prompt.length}/500</span>
        </div>
      </div>

      {/* Visual Style Selector Chips */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Aesthetic Art Style
        </label>
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 gap-2">
          {STYLE_PRESETS.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer min-h-[38px] ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-[#0B0F17] border-[#2C384E] text-slate-400 hover:text-white hover:border-slate-600'
                }`}
              >
                <span className="text-sm shrink-0">{style.icon}</span>
                <span className="truncate">{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live BullMQ Queue & Dynamic Countdown Tracker */}
      {jobTracker.isTracking && (
        <AiQueueTrackerCard
          status={jobTracker.status}
          queuePosition={jobTracker.queuePosition}
          countdownSeconds={jobTracker.countdownSeconds}
          progress={jobTracker.progress}
          step={jobTracker.step}
          title="Google Gemini Nano Banana 2.1"
          onMinimize={() => jobTracker.stopTracking()}
        />
      )}

      {/* Generation Status Notices */}
      {generationNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="flex-1 text-[11px] font-medium leading-relaxed">{generationNotice}</span>
        </div>
      )}

      {(imageError || jobTracker.error) && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="text-[11px]">
            {jobTracker.error?.message || imageError?.message || 'Generation failed, please try again.'}
          </span>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <Button
          type="button"
          variant="primary"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGeneratingImage || jobTracker.isTracking}
          className="flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-glow flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[42px]"
        >
          {jobTracker.isTracking ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>
                {jobTracker.status === 'WAITING'
                  ? `Position #${jobTracker.queuePosition} in Queue (~${jobTracker.countdownSeconds}s)`
                  : `Synthesizing Asset (${jobTracker.progress}%) · ~${jobTracker.countdownSeconds}s`}
              </span>
            </>
          ) : isGeneratingImage ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Connecting to Queue Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate with Nano Banana 2.1</span>
            </>
          )}
        </Button>

        {activeImage && onOpenCaptionGenerator && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenCaptionGenerator}
            className="text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-xl cursor-pointer min-h-[42px]"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generate AI Caption</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NanoBananaAiGenerator;
