import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, Bot, Zap, Calendar, TrendingUp } from 'lucide-react';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 font-body relative overflow-hidden">
      {/* Background Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Brand Hero & Features */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen AI Social Engine</span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl xl:text-5xl leading-tight tracking-tight text-white">
              Supercharge your brand with <span className="text-gradient">AI Automation</span>
            </h1>

            <p className="text-slate-400 text-base leading-relaxed">
              BrandFlow empowers modern businesses to generate high-converting social copy, schedule content, generate AI imagery, and scale cross-platform publishing seamlessly.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200">AI Brand Kit</h4>
                <p className="text-xs text-slate-400">Automatic style guide & brand tone voice adaptation.</p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200">Instant Captions</h4>
                <p className="text-xs text-slate-400">Generate viral captions tuned for high engagement.</p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200">Smart Scheduler</h4>
                <p className="text-xs text-slate-400">Auto-publish during peak engagement hours.</p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200">Growth Analytics</h4>
                <p className="text-xs text-slate-400">Real-time performance metrics and audience insights.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Route Outlet */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
