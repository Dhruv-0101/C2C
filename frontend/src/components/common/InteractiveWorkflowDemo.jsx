import React, { useState, useEffect } from 'react';
import {
  MousePointer2,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  Calendar,
  Zap,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { Card } from '../ui/Card';

export const InteractiveWorkflowDemo = () => {
  const [step, setStep] = useState(1);

  // Auto-cycle through the 4 steps
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev % 4) + 1);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full glass-panel p-6 sm:p-8 rounded-3xl border border-[#2C384E] bg-gradient-to-b from-[#131B2A] to-[#0B0F17] shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C384E] pb-4 mb-6">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Live Post Creation Simulation
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-white">
            See How Fast Posts Are Created
          </h3>
        </div>

        {/* Live Step Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => setStep(num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                step === num
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>Step {num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Steps List */}
        <div className="lg:col-span-5 space-y-4 text-left">
          {/* Step 1 Card */}
          <div
            onClick={() => setStep(1)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              step === 1
                ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 translate-x-1'
                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-70'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${step === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">1. Select Graphic Base</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pick festival or marketing graphic background.</p>
            </div>
          </div>

          {/* Step 2 Card */}
          <div
            onClick={() => setStep(2)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              step === 2
                ? 'bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-500/5 translate-x-1'
                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-70'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${step === 2 ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">2. Overlay Canva Frame</h4>
              <p className="text-xs text-slate-400 mt-0.5">Snap transparent PNG frame with photo slots.</p>
            </div>
          </div>

          {/* Step 3 Card */}
          <div
            onClick={() => setStep(3)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              step === 3
                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5 translate-x-1'
                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-70'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${step === 3 ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">3. Auto-Fill BrandKit</h4>
              <p className="text-xs text-slate-400 mt-0.5">Logo, phone number & headshot auto-fill live.</p>
            </div>
          </div>

          {/* Step 4 Card */}
          <div
            onClick={() => setStep(4)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              step === 4
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5 translate-x-1'
                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 opacity-70'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${step === 4 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-white">4. Post Ready & Export!</h4>
              <p className="text-xs text-slate-400 mt-0.5">1080x1080 HD graphics composited in 0ms.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated 1080x1080 Canvas Stage */}
        <div className="lg:col-span-7 flex justify-center relative">
          <div className="w-full max-w-md aspect-square rounded-2xl bg-[#0B0F17] border border-[#2C384E] p-3 shadow-2xl relative overflow-hidden group">
            {/* Animated Canvas Render */}
            <div className="w-full h-full rounded-xl bg-slate-950 relative overflow-hidden border border-slate-800 flex flex-col justify-between p-4 transition-all duration-500">
              
              {/* Layer 1: Background Graphic */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 bg-cover bg-center ${
                  step >= 1 ? 'opacity-100' : 'opacity-20'
                }`}
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(11, 15, 23, 0.2), rgba(11, 15, 23, 0.7)), url("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1080&auto=format&fit=crop")',
                }}
              />

              {/* Top Header inside Post */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className={`transition-all duration-500 ${
                    step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <div className="px-3 py-1 rounded-lg bg-black/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Building2 className="w-3.5 h-3.5" /> Sunrise Real Estate
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-slate-300">
                  1080 x 1080 HD
                </div>
              </div>

              {/* Middle Headline inside Post */}
              <div className="relative z-10 text-center space-y-1 my-auto">
                {step >= 1 && (
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider animate-in fade-in duration-500">
                    ✨ Happy Diwali Celebration
                  </div>
                )}
                <h4 className="font-heading font-extrabold text-2xl text-white drop-shadow-md">
                  Wishing You Light & Prosperity
                </h4>
              </div>

              {/* Layer 2: Canva Frame Overlay Footer */}
              <div
                className={`relative z-10 p-3 rounded-xl border transition-all duration-500 flex items-center justify-between ${
                  step >= 2
                    ? 'bg-slate-900/90 border-amber-500/60 shadow-xl opacity-100 translate-y-0'
                    : 'bg-transparent border-transparent opacity-0 translate-y-4'
                }`}
              >
                {/* Circular Profile Avatar Slot */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full border-2 border-amber-400 bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 transition-all duration-500 ${
                      step >= 3 ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                      alt="Owner Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-left text-xs">
                    <p className="font-bold text-white">
                      {step >= 3 ? 'Dhruv Sharma' : 'Owner Headshot Ring'}
                    </p>
                    <p className="text-[11px] text-amber-300 font-mono">
                      {step >= 3 ? '📞 +91 98765 43210' : 'Dynamic Text Vector'}
                    </p>
                  </div>
                </div>

                {/* Frame Badge */}
                <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                  Gold Frame PNG
                </div>
              </div>

              {/* Animated Floating Mouse Cursor Simulator */}
              <div
                className="absolute z-30 transition-all duration-700 pointer-events-none"
                style={{
                  top: step === 1 ? '40%' : step === 2 ? '80%' : step === 3 ? '20%' : '50%',
                  left: step === 1 ? '50%' : step === 2 ? '75%' : step === 3 ? '30%' : '50%',
                }}
              >
                <div className="relative">
                  <MousePointer2 className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-lg animate-pulse" />
                  <div className="absolute top-5 left-5 bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                    {step === 1 && 'Clicking Graphic...'}
                    {step === 2 && 'Applying Canva Frame...'}
                    {step === 3 && 'Auto-Filling BrandKit...'}
                    {step === 4 && 'Exporting 1080x1080!'}
                  </div>
                </div>
              </div>

              {/* Step 4 Export Overlay Notification */}
              {step === 4 && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/40">
                    <Download className="w-6 h-6 animate-bounce" />
                  </div>
                  <h4 className="font-heading font-extrabold text-xl text-white">Post Rendered & Exported!</h4>
                  <p className="text-xs text-slate-300 mt-1">1080x1080 Square Graphic Ready for Publishing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
