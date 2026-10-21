import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Layers,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAiCarousel } from '../hooks/useAiCarousel';

const PRESET_TOPIC_IDEAS = [
  { label: '🩺 Healthcare', prompt: '20 Cancer Prevention & Healthy Lifestyle Tips' },
  { label: '🏠 Real Estate', prompt: '5 Critical Mistakes First-Time Homebuyers Must Avoid' },
  { label: '💪 Fitness', prompt: '7 Daily Habits To Supercharge Your Metabolism & Energy' },
  { label: '🍽️ Restaurant', prompt: '3 Secret Ingredients That Make Our Dishes Unforgettable' },
  { label: '🚀 Business', prompt: '5 Proven Strategies To Scale Your Revenue in 90 Days' },
  { label: '💰 Finance', prompt: '4 Essential Rules For Smart Long-Term Wealth Building' },
];

const TONE_OPTIONS = [
  { id: 'PROFESSIONAL', label: 'Professional / Educational' },
  { id: 'PROMOTIONAL', label: 'Promotional / High-Converting' },
  { id: 'FRIENDLY', label: 'Friendly & Casual' },
  { id: 'URGENT', label: 'Urgent & Compelling' },
  { id: 'WITTY', label: 'Witty & Engaging' },
  { id: 'FESTIVE', label: 'Festive & Joyful' },
];

/**
 * 🎠 AiCarouselGeneratorModal
 * Modal allowing users to generate a complete multi-slide social media carousel deck
 * in seconds using Gemini Flash + Smart Synthesizer.
 */
export const AiCarouselGeneratorModal = ({
  isOpen,
  onClose,
  brandKit,
  onApplyDeck,
}) => {
  const [topic, setTopic] = useState('');
  const [numberOfSlides, setNumberOfSlides] = useState(5);
  const [tone, setTone] = useState('PROFESSIONAL');
  const [errorMsg, setErrorMsg] = useState('');

  const { generateCarousel, isGenerating } = useAiCarousel();

  if (!isOpen) return null;

  const handleSelectPreset = (presetPrompt) => {
    setTopic(presetPrompt);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('Please enter a topic or select one of the suggested ideas.');
      return;
    }

    try {
      setErrorMsg('');
      const response = await generateCarousel({
        topic: topic.trim(),
        numberOfSlides: Number(numberOfSlides),
        tone,
        industry: brandKit?.category?.name || undefined,
        targetAudience: brandKit?.targetAudience || undefined,
      });

      const deck = response?.data || response;
      if (deck && Array.isArray(deck.slides)) {
        onApplyDeck(deck);
        onClose();
      } else {
        setErrorMsg('Failed to generate carousel deck. Please try again.');
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Carousel deck generation failed.'
      );
    }
  };

  return createPortal(
    <div className="modal-backdrop-overlay fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto font-sans">
      <div className="w-full max-w-xl bg-[#131B2A] border border-[#2C384E] rounded-2xl p-5 space-y-4 shadow-2xl my-auto text-slate-100 max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2C384E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white leading-tight flex items-center gap-2">
                AI Carousel Deck Generator
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                  Swipeable Studio
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Transform any concept into an editorial 2-10 slide Instagram & Facebook deck.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}

        {/* Generator Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. What is your carousel about? <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 20 Cancer Prevention Tips, 5 Steps to Buy Your Dream Home, 3 Things to Know About Dental Implants..."
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
              required
            />
          </div>

          {/* Quick Preset Ideas */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              💡 Or click a trending concept:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPIC_IDEAS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(item.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#0B0F17] hover:bg-slate-800 border border-[#2C384E] hover:border-amber-500/50 text-[11px] text-slate-300 hover:text-amber-300 font-medium transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Grid: Number of Slides + Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Number of Slides */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Number of Slides
              </label>
              <div className="flex items-center gap-1.5 bg-[#0B0F17] border border-[#2C384E] rounded-xl p-1">
                {[3, 4, 5, 6, 7, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumberOfSlides(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                      numberOfSlides === num
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                3. Content Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-[#2C384E] rounded-xl text-white text-xs font-medium focus:outline-none focus:border-amber-500"
              >
                {TONE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand Context Notice */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-300 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              The AI automatically includes a <strong>Hook slide</strong>, <strong>actionable content slides</strong>, and a <strong>Call-to-Action slide</strong> formatted for {brandKit?.businessName || 'your business'}, along with caption & tags!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#2C384E] flex items-center justify-end gap-2.5">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="py-2 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isGenerating}
              icon={Sparkles}
              className="py-2 px-5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {isGenerating ? 'Generating Slides...' : `Generate ${numberOfSlides}-Slide Deck ✨`}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AiCarouselGeneratorModal;
