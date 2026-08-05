import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, Layers, Building2, Calendar, Share2 } from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export const AuthLayout = () => {
  return (
    <div className="h-screen flex flex-col justify-between bg-[#0B0F17] text-slate-100 font-body relative overflow-hidden">
      {/* Background Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />

      <Header />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Brand Hero & Features */}
          <div className="lg:col-span-6 space-y-5 hidden lg:block pr-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Branded Social Media Platform</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl xl:text-4xl leading-tight tracking-tight text-white">
              Supercharge your brand with <span className="text-gradient">Custom Marketing</span>
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              BrandFlow empowers small businesses to composite Canva-style frame overlays, auto-fill master BrandKits, and schedule festival marketing content seamlessly.
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
                <h4 className="font-semibold text-xs text-slate-200">Canva Frame Studio</h4>
                <p className="text-[11px] text-slate-400">Dynamic 0ms vector layer text slots.</p>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-semibold text-xs text-slate-200">Festival Calendar</h4>
                <p className="text-[11px] text-slate-400">Pre-designed Diwali & event graphics.</p>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <h4 className="font-semibold text-xs text-slate-200">Multi-Platform Export</h4>
                <p className="text-[11px] text-slate-400">1080x1080 HD graphics ready for social.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Form Box */}
          <div className="lg:col-span-6 w-full flex justify-center">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
