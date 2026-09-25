import React from 'react';
import { Sparkles, Layers, Building2, Calendar, Share2 } from 'lucide-react';

/**
 * Visual brand hero artwork and feature highlights for authentication screens
 */
export const AuthHeroBanner = () => {
  return (
    <div className="space-y-5 pr-4 text-left">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Branded Social Media Platform</span>
      </div>

      <h1 className="font-heading font-extrabold text-3xl xl:text-4xl leading-tight tracking-tight text-white">
        Supercharge your brand with <span className="text-gradient">Custom Marketing</span>
      </h1>

      <p className="text-slate-400 text-sm leading-relaxed">
        BrandFlow empowers small businesses to composite custom brand frame overlays, auto-fill master BrandKits, and schedule festival marketing content seamlessly.
      </p>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-semibold text-xs text-slate-200">Master BrandKit</h4>
          <p className="text-[11px] text-slate-400">Auto-fill logo, address & phone once.</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-semibold text-xs text-slate-200">Brand Frame Studio</h4>
          <p className="text-[11px] text-slate-400">Instant auto-filling brand text & logo slots.</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-semibold text-xs text-slate-200">Festival Calendar</h4>
          <p className="text-[11px] text-slate-400">Pre-designed festival & event graphics.</p>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <h4 className="font-semibold text-xs text-slate-200">Auto Publishing</h4>
          <p className="text-[11px] text-slate-400">Push to Meta, IG, LinkedIn & X in 1 click.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthHeroBanner;
