import React from "react";
import { Sparkles } from "lucide-react";

/**
 * PageLoader Component
 * Full-screen / full-container loading fallback for React.lazy route chunk dynamic splitting.
 * Follows BrandFlow enterprise dark theme design system (#0B0F17 background with amber accents).
 */
export const PageLoader = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0F17] text-white p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

      <div className="relative z-10 flex flex-col items-center space-y-5 text-center">
        {/* Animated Brand Pulse Icon */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/30 shadow-xl shadow-amber-500/5 animate-bounce">
          <Sparkles className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Loading Message & Spinner Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Loading BrandFlow...</span>
          </div>

          <div className="w-48 h-1 bg-[#131B2A] rounded-full overflow-hidden border border-[#2C384E]">
            <div className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
