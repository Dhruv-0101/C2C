import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  RefreshCw,
  Info,
  Trash2,
  Mic,
  MicOff,
  Globe,
  X,
  ImagePlus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useAiPostImage } from '../hooks/useAiPostImage';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useAiJobTracker } from '../hooks/useAiJobTracker';
import { AiQueueTrackerCard } from './AiQueueTrackerCard';
import {
  generatePuterImage,
  isPuterExhausted,
  markPuterExhausted,
  clearPuterExhausted,
  isPuterConnected,
  getPuterUser,
  getPuterUsage,
  connectPuter,
  disconnectPuter,
  getPuter,
} from '../services/puter.service';

/**
 * Available Puter Image Models with estimated credit costs
 */
export const PUTER_MODELS = [
  {
    key: 'NATIVE',
    id: null,
    name: 'Puter Native Flare',
    badge: 'Fast & Economic ⚡',
    cost: 20,
    description: 'Lowest credit burn (~20 Puter credits), rapid generation',
  },
  {
    key: 'NANO_BANANA_2_1',
    id: 'openrouter:google/gemini-nano-banana-2.1',
    name: 'Gemini Nano Banana 2.1',
    badge: 'Indian Festival & Retail 🍌',
    cost: 25,
    description: 'Deep Indian cultural nuance & rich festive lighting (~25 cr)',
  },
  {
    key: 'FLUX_1_SCHNELL',
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'FLUX.1 Schnell',
    badge: 'Ultra Photorealistic 🚀',
    cost: 25,
    description: 'High-definition commercial graphics & studio lighting (~25 cr)',
  },
];

/**
 * Available Google Gemini Server Models (BrandFlow Plan Tier)
 */
export const GEMINI_MODELS = [
  {
    key: 'gemini-nano-banana-2.1',
    name: 'Gemini Nano Banana 2.1',
    badge: 'Commercial & Festive 🍌',
    cost: '1 Post Credit',
    description: 'Rich Indian nuance, vivid festive lighting & retail promotions',
  },
  {
    key: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    badge: 'Clean Modern Visuals ⚡',
    cost: '1 Post Credit',
    description: 'Modern corporate, minimalist brand designs & fast rendering',
  },
  {
    key: 'gemini-3-pro',
    name: 'Gemini 3 Pro Multimodal',
    badge: 'Photo Matching 📸',
    cost: '1 Post Credit',
    description: 'Preserves face & details when reference photo is attached',
  },
];

/**
 * 🍌 NanoBananaAiGenerator Component
 * State-of-the-art commercial AI creative visual studio.
 * Supports dual engines (Puter Free Tier & Google Gemini Plan Tier) with smart model selection,
 * low-credit transition dialogs, and Option A credit protection.
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
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle] = useState('Photorealistic');
  const [generationNotice, setGenerationNotice] = useState(null);
  const [isPuterGenerating, setIsPuterGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('');

  // Engine selection: 'PUTER' (Free) vs 'GEMINI' (Plan)
  const [selectedEngine, setSelectedEngine] = useState('PUTER');
  const [selectedPuterModel, setSelectedPuterModel] = useState('NATIVE');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState('gemini-nano-banana-2.1');

  // Low-balance dialog state
  const [lowBalancePrompt, setLowBalancePrompt] = useState(null);

  // Puter state
  const [puterConnected, setPuterConnected] = useState(isPuterConnected());
  const [puterUser, setPuterUser] = useState(null);
  const [puterUsage, setPuterUsage] = useState(null);
  const [isConnectingPuter, setIsConnectingPuter] = useState(false);
  const [isRefreshingUsage, setIsRefreshingUsage] = useState(false);
  const basePromptRef = useRef('');
  const fileInputRef = useRef(null);

  // Check Puter authentication status and live credit balance on mount
  useEffect(() => {
    let isMounted = true;
    getPuter()
      .then(async () => {
        if (!isMounted) return;
        const connected = isPuterConnected();
        setPuterConnected(connected);
        if (connected) {
          const [user, usage] = await Promise.all([
            getPuterUser(),
            getPuterUsage(),
          ]);
          if (isMounted) {
            if (user) setPuterUser(user);
            if (usage) {
              setPuterUsage(usage);
              if (usage.remainingCredits > 0) {
                clearPuterExhausted();
              }
            }
          }
        } else {
          clearPuterExhausted();
          setPuterUsage(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        clearPuterExhausted();
        setPuterConnected(false);
        setPuterUsage(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshPuterUsage = async () => {
    try {
      setIsRefreshingUsage(true);
      const u = await getPuterUsage();
      if (u) {
        setPuterUsage(u);
        if (u.remainingCredits > 0) {
          clearPuterExhausted();
        }
      }
    } catch (e) {
    } finally {
      setIsRefreshingUsage(false);
    }
  };

  const handleConnectPuter = async () => {
    try {
      setIsConnectingPuter(true);
      const { user, usage } = await connectPuter();
      clearPuterExhausted();
      setPuterConnected(true);
      setPuterUser(user);
      setPuterUsage(usage);
      setSelectedEngine('PUTER');
      setGenerationNotice('Puter Free Plan connected successfully! Enjoy free AI visuals 🎁');
    } catch (err) {
      console.warn('Puter connect dismissed or failed:', err);
    } finally {
      setIsConnectingPuter(false);
    }
  };

  const handleDisconnectPuter = async () => {
    try {
      await disconnectPuter();
      clearPuterExhausted();
      setPuterConnected(false);
      setPuterUser(null);
      setPuterUsage(null);
      setSelectedEngine('GEMINI');
      setGenerationNotice('Puter disconnected. Switched to Google Gemini AI Engine ⚡');
    } catch (err) {}
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Kripya valid image file (JPG, PNG, WebP) upload karein.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo ka size 10MB se chhota hona chahiye.');
      return;
    }
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImage(e.target.result);
      // Photo attached: auto-route to Gemini Multimodal for identity matching
      setSelectedEngine('GEMINI');
      setSelectedGeminiModel('gemini-3-pro');
      setGenerationNotice('📸 Photo attached — Switched to Google Gemini Multimodal Engine to preserve subject face & details.');
    };
    reader.readAsDataURL(file);
  };

  const handleClearReferenceImage = () => {
    setReferenceImage(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { generatePostImage, isGeneratingImage, imageError } = useAiPostImage();

  // ⏱️ BullMQ Asynchronous Queue & Timing Tracker for Google Gemini
  const jobTracker = useAiJobTracker({
    type: 'image',
    onCompleted: (completedResult) => {
      const res = completedResult?.result || completedResult;
      const imgUrl = res?.imageUrl;
      if (imgUrl) {
        // Option A: Invalidate subscription queries so header counter decrements immediately
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.STATUS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.ALL });

        onSelectImage(imgUrl, {
          isCreditAlreadyPaid: true,
          engine: 'GEMINI',
          model: selectedGeminiModel,
        });

        if (res.isPendingBilling && res.message) {
          setGenerationNotice(res.message);
        } else {
          setGenerationNotice('✨ Generated with Google Gemini! 1 post credit used for generation (0 credits needed when you download or publish).');
        }
      }
    },
    onError: (err) => {
      console.error('AI image generation worker failed:', err);
      setGenerationNotice(err?.message || 'AI generation encountered an issue. Please try again.');
    },
  });

  // 🎙️ Voice-to-Text Regional Engine
  const {
    isListening,
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

  const handleClearPrompt = () => {
    setPrompt('');
    basePromptRef.current = '';
    if (isListening) {
      stopListening();
    }
  };

  /**
   * Execute Google Gemini server-side BullMQ generation
   */
  const executeGeminiGeneration = async (overrideModel) => {
    const modelToUse = overrideModel || selectedGeminiModel;
    const res = await generatePostImage({
      prompt: prompt.trim(),
      referenceImage: referenceImage || null,
      style: selectedStyle,
      aspectRatio: '1:1',
      occasionName: brandKit?.businessName || '',
      model: modelToUse,
    });

    const resData = res?.data || res;

    if (resData?.isQueued) {
      // Enqueued in BullMQ Queue - start live countdown and position tracking
      jobTracker.startTracking(resData);
    } else {
      // Immediate synchronous completion or fallback
      const imgUrl = resData?.result?.imageUrl || resData?.imageUrl;
      if (imgUrl) {
        // Invalidate subscription so header post count immediately drops by 1
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.STATUS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUBSCRIPTION.ALL });

        onSelectImage(imgUrl, {
          isCreditAlreadyPaid: true,
          engine: 'GEMINI',
          model: modelToUse,
        });

        if (resData?.result?.isPendingBilling && resData?.result?.message) {
          setGenerationNotice(resData.result.message);
        } else {
          setGenerationNotice('✨ Generated with Google Gemini! 1 post credit used for generation (0 credits needed when you download or publish).');
        }
      }
    }
  };

  const handleGeminiError = (err) => {
    console.error('AI image generation failed:', err);
    const isPlanError =
      err?.response?.status === 403 ||
      err?.response?.data?.code === 'PLAN_REQUIRED' ||
      err?.response?.data?.code === 'PLAN_EXPIRED' ||
      err?.response?.data?.message?.toLowerCase().includes('plan');

    if (isPlanError) {
      setGenerationNotice(
        err?.response?.data?.message || 'A subscription plan or post credit is required to generate AI visuals with Google Gemini. Please activate your free posts or upgrade.'
      );
      if (openPlanModal) {
        openPlanModal();
      }
    } else {
      setGenerationNotice(err?.response?.data?.message || 'Failed to generate visual. Please try again.');
    }
  };

  /**
   * Primary Generation Dispatcher
   */
  const handleGenerate = async (e, forceBypassPuterCheck = false) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    if (isListening) {
      stopListening();
    }

    setGenerationNotice(null);

    // ==========================================
    // 1. PUTER ENGINE (Free Tier)
    // ==========================================
    if (selectedEngine === 'PUTER') {
      if (referenceImage) {
        setGenerationNotice('📸 Reference photos require face & detail preservation. Please switch to Google Gemini Multimodal Engine.');
        setSelectedEngine('GEMINI');
        return;
      }

      if (!puterConnected) {
        setGenerationNotice('Connecting to Puter Free Plan...');
        try {
          await handleConnectPuter();
        } catch {
          return;
        }
      }

      const activePuterModelObj = PUTER_MODELS.find((m) => m.key === selectedPuterModel) || PUTER_MODELS[0];
      const modelCost = activePuterModelObj.cost || 20;
      const currentCredits = puterUsage?.remainingCredits ?? 0;

      // Smart low-balance check: if model costs more than user's remaining Puter credits
      if (!forceBypassPuterCheck && puterUsage?.remainingCredits != null && currentCredits < modelCost) {
        setLowBalancePrompt({
          neededCost: modelCost,
          remainingCredits: currentCredits,
          modelName: activePuterModelObj.name,
        });
        return;
      }

      setIsPuterGenerating(true);
      setGenerationNotice(`Creating visual with Puter (${activePuterModelObj.name})... 🍌`);

      try {
        const res = await generatePuterImage({
          prompt: prompt.trim(),
          style: selectedStyle,
          modelId: activePuterModelObj.id,
        });

        if (res?.imageUrl) {
          // Free Puter visual: Option A (Credit NOT paid upfront -> Deduct 1 credit at publish/download)
          onSelectImage(res.imageUrl, {
            isCreditAlreadyPaid: false,
            engine: 'PUTER',
            model: activePuterModelObj.name,
          });
          setGenerationNotice('Creative visual generated with Puter AI! Free tier ($0 server cost) ✨');
          setIsPuterGenerating(false);
          refreshPuterUsage();
          return;
        }
      } catch (puterErr) {
        console.warn('Puter AI generation issue:', puterErr.message);
        const errMsg = (puterErr?.message || '').toLowerCase();
        const isQuota =
          errMsg.includes('funding') ||
          errMsg.includes('balance') ||
          errMsg.includes('quota') ||
          errMsg.includes('credit') ||
          errMsg.includes('limit') ||
          errMsg.includes('subscription');

        if (isQuota) {
          markPuterExhausted();
          refreshPuterUsage();
          setGenerationNotice('⚡ Puter quota reached. Now creating your post with Google Gemini AI Engine...');
          setSelectedEngine('GEMINI');
          try {
            await executeGeminiGeneration();
          } catch (err) {
            handleGeminiError(err);
          }
        } else {
          setGenerationNotice('⚡ Puter server busy. Seamlessly creating your visual with Google Gemini AI Engine...');
          setSelectedEngine('GEMINI');
          try {
            await executeGeminiGeneration();
          } catch (err) {
            handleGeminiError(err);
          }
        }
      } finally {
        setIsPuterGenerating(false);
      }
      return;
    }

    // ==========================================
    // 2. GOOGLE GEMINI ENGINE (Plan Tier)
    // ==========================================
    if (isExpired || postsRemaining <= 0) {
      setGenerationNotice('⚠️ Your BrandFlow post quota is exhausted. Please activate your free posts or choose a plan.');
      if (openPlanModal) {
        openPlanModal();
      }
      return;
    }

    setGenerationNotice(
      referenceImage
        ? '📸 Photo attached — generating post with Google Gemini Multimodal Engine...'
        : `⚡ Generating post with Google Gemini (${GEMINI_MODELS.find((m) => m.key === selectedGeminiModel)?.name || 'Nano Banana 2.1'})...`
    );

    try {
      await executeGeminiGeneration();
    } catch (err) {
      handleGeminiError(err);
    }
  };

  const activePuterModelObj = PUTER_MODELS.find((m) => m.key === selectedPuterModel) || PUTER_MODELS[0];
  const activeGeminiModelObj = GEMINI_MODELS.find((m) => m.key === selectedGeminiModel) || GEMINI_MODELS[0];

  return (
    <div className="space-y-3.5 bg-gradient-to-br from-[#131B2A] via-[#101726] to-[#0B0F17] border border-[#2C384E] rounded-2xl p-3.5 sm:p-5 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#2C384E]/80 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-extrabold text-lg shadow-glow shrink-0">
            ✨
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-extrabold text-xs sm:text-sm text-white truncate">
              AI Creative Studio
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              Commercial visuals tailored for your brand & festivals
            </p>
          </div>
        </div>

        {activeImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearImage}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 shrink-0 min-h-[30px]"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Reset Graphic</span>
          </Button>
        )}
      </div>

      {/* 🚀 ENGINE SELECTOR TABS: Puter AI (Free) vs Google Gemini (Plan) */}
      <div className="p-1 rounded-xl bg-[#0A0E17] border border-[#2C384E]/80 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setSelectedEngine('PUTER')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedEngine === 'PUTER'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span className="text-sm">🍌</span>
          <span className="truncate">Puter AI (Free Tier)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedEngine === 'PUTER' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            $0 Cost
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEngine('GEMINI')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedEngine === 'GEMINI'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-current" />
          <span className="truncate">Google Gemini (Plan)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedEngine === 'GEMINI' ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {postsRemaining} Posts
          </span>
        </button>
      </div>

      {/* ENGINE 1 DETAILS: Puter Account Status & Live Balance */}
      {selectedEngine === 'PUTER' && (
        <div className="rounded-xl border border-[#2C384E] bg-gradient-to-r from-[#141E2E] to-[#0F1724] p-3 shadow-md space-y-2.5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Puter Free Account:</span>
              {puterConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  @{puterUser?.username || 'user'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Not Connected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {puterConnected ? (
                <>
                  <button
                    type="button"
                    onClick={refreshPuterUsage}
                    disabled={isRefreshingUsage}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingUsage ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshingUsage ? 'Checking...' : 'Check Balance'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectPuter}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium cursor-pointer"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectPuter}
                  disabled={isConnectingPuter}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 transition shadow-md active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isConnectingPuter ? 'Connecting...' : 'Connect Puter Account 🍌'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Puter Credit Pill & Info */}
          <div className="flex items-center justify-between text-xs bg-[#0B0F17]/70 p-2 rounded-lg border border-[#2C384E]/40">
            <span className="text-slate-400 text-[11px]">Available Puter Balance:</span>
            <span className="font-mono font-extrabold text-amber-300 text-xs">
              {puterUsage?.remainingCredits != null
                ? `${Math.round(puterUsage.remainingCredits)} Credits (~${Math.max(0, Math.floor(puterUsage.remainingCredits / (activePuterModelObj?.cost || 20)))} Free Images)`
                : puterConnected
                ? '500 Credits Active (~25 Free Images)'
                : 'Connect to check'}
            </span>
          </div>

          {/* Model Selection for Puter */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Choose AI Image Model:</span>
              <span className="text-[10px] text-slate-400 font-normal">Select generation model</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PUTER_MODELS.map((m) => {
                const isSelected = selectedPuterModel === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedPuterModel(m.key)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-glow text-white'
                        : 'bg-[#0B0F17] hover:bg-slate-900 border-[#2C384E] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{m.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 shrink-0">
                        ~{m.cost} cr
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ENGINE 2 DETAILS: Google Gemini Plan Tier Models */}
      {selectedEngine === 'GEMINI' && (
        <div className="rounded-xl border border-teal-500/30 bg-gradient-to-r from-[#0C1C26] to-[#0A1620] p-3 shadow-md space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold text-white">Google Gemini Plan Engine</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/30">
              {postsRemaining} Post Credits Left
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Option A Protection: 1 post credit is deducted for AI generation. You will <strong>never be charged twice</strong> when downloading HD or publishing!
          </p>

          {/* Model Selection for Gemini */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Choose Gemini Model:</span>
              <span className="text-[10px] text-teal-300/80 font-mono">1 Post Credit</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {GEMINI_MODELS.map((m) => {
                const isSelected = selectedGeminiModel === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedGeminiModel(m.key)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500/20 border-teal-400 shadow-glow text-white'
                        : 'bg-[#0B0F17] hover:bg-slate-900 border-[#2C384E] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{m.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-teal-500/20 text-teal-300 shrink-0">
                        1 Credit
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ SMART LOW-BALANCE SWITCH DIALOG / BANNER */}
      {lowBalancePrompt && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-amber-500/15 border border-amber-500/40 text-xs text-amber-200 animate-in fade-in space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span className="font-extrabold text-white">Low Puter Balance:</span>{' '}
              <span className="text-slate-200">
                You have <strong>{Math.round(lowBalancePrompt.remainingCredits)} Puter credits</strong> left, but <em>{lowBalancePrompt.modelName}</em> requires ~{lowBalancePrompt.neededCost} credits.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/30">
            {lowBalancePrompt.remainingCredits >= 20 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPuterModel('NATIVE');
                  setLowBalancePrompt(null);
                  handleGenerate(null, true);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
              >
                Switch to Puter Native Flare (~20 cr)
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedEngine('GEMINI');
                setLowBalancePrompt(null);
                handleGenerate(null, true);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition cursor-pointer"
            >
              Switch to Google Gemini Engine ⚡
            </button>

            <button
              type="button"
              onClick={() => {
                setLowBalancePrompt(null);
                handleGenerate(null, true);
              }}
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
            >
              Try anyway
            </button>

            <button
              type="button"
              onClick={() => setLowBalancePrompt(null)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Prompt Input Box with Voice to Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1.5 flex-nowrap overflow-x-auto no-scrollbar pb-0.5">
          <label className="text-xs font-bold text-white flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Visual Prompt</span>
          </label>

          {/* Voice Engine Controls & Photo Attach in a single compact row */}
          <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
            {/* Hidden File Input for Reference Photo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
              className="hidden"
            />

            {/* Attach Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0 whitespace-nowrap min-h-[28px] ${
                referenceImage
                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-glow'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border border-[#2C384E] text-slate-300 hover:text-white'
              }`}
              title="Attach a photo of person, employee, doctor, client, dish, etc."
            >
              <ImagePlus className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{referenceImage ? 'Badlein 📸' : 'Photo Jodiye 📸'}</span>
            </button>

            {/* Regional Dialect Selector */}
            <div className="relative flex items-center shrink-0">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isListening}
                className="appearance-none bg-[#0B0F17] hover:bg-slate-900 text-slate-200 text-[10px] font-semibold border border-[#2C384E] focus:border-amber-500 rounded-lg px-2 py-1 pr-3.5 transition cursor-pointer outline-none truncate whitespace-nowrap min-h-[28px]"
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
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0 whitespace-nowrap min-h-[28px] ${
                isListening
                  ? 'bg-rose-500/20 border border-rose-500 text-rose-300 animate-pulse shadow-glow'
                  : 'bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <MicOff className="w-3 h-3" />
                  <span>Rokein</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-amber-400" />
                  <span>Bolkar Likhein 🎙️</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Attached Photo Preview Badge */}
        {referenceImage && (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={referenceImage}
                alt="Reference preview"
                className="w-10 h-10 rounded-lg object-cover border border-amber-400/40 shrink-0 shadow-sm"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white">📸 Photo Attached</span>
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                    Face & Details Matched
                  </span>
                  <span className="text-[10px] font-medium text-teal-200 bg-teal-950/60 border border-teal-500/40 px-1.5 py-0.5 rounded-md">
                    ⚡ Google Gemini Multimodal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {imageFileName || 'reference-photo.jpg'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearReferenceImage}
              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white transition cursor-pointer shrink-0"
              title="Remove attached photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
            placeholder={
              referenceImage
                ? "Boliye ya type kijiye: e.g. Inki photo ke sath Happy Birthday Rahul likhein, corporate celebration background..."
                : "Apni bhasha me boliye ya type kijiye: e.g. Diwali pe mithai ke dabbe aur dry fruits par 20% discount offer..."
            }
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
      </div>

      {/* Live BullMQ Queue & Dynamic Countdown Tracker for Gemini */}
      {jobTracker.isTracking && (
        <AiQueueTrackerCard
          status={jobTracker.status}
          queuePosition={jobTracker.queuePosition}
          countdownSeconds={jobTracker.countdownSeconds}
          progress={jobTracker.progress}
          step={jobTracker.step}
          title="Google Gemini Creative Queue"
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
          disabled={!prompt.trim() || isGeneratingImage || isPuterGenerating || jobTracker.isTracking}
          className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-extrabold shadow-glow flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[42px] ${
            selectedEngine === 'PUTER'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950'
              : 'bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950'
          }`}
        >
          {isPuterGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Generating with Puter ({activePuterModelObj.name})...</span>
            </>
          ) : jobTracker.isTracking ? (
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
              <span>Generating Visual with Google Gemini...</span>
            </>
          ) : selectedEngine === 'PUTER' ? (
            <>
              <span className="text-sm">🍌</span>
              <span>Generate Free with Puter (~{activePuterModelObj.cost} Credits) ✨</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Generate with Gemini (1 Post Credit) ✨</span>
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
