import React from 'react';
import { TopProgressBar } from './TopProgressBar';

/**
 * AuthLoader Component
 * Centered glassmorphic card skeleton for authentication chunk lazy-loading.
 * Prevents full layout swaps while preserving surrounding auth hero banner and headers.
 */
export const AuthLoader = () => {
  return (
    <div className="w-full max-w-md animate-in fade-in duration-200">
      <TopProgressBar />
      <div className="rounded-3xl border border-slate-700/50 bg-[#131B2A]/90 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-2xl">
        {/* Auth Header */}
        <div className="text-center space-y-2 pb-2">
          <div className="w-12 h-12 rounded-2xl mx-auto skeleton-shimmer mb-3" />
          <div className="h-6 w-44 rounded-xl mx-auto skeleton-shimmer" />
          <div className="h-3.5 w-64 rounded-md mx-auto skeleton-shimmer opacity-60" />
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded skeleton-shimmer opacity-70" />
            <div className="h-11 w-full rounded-xl skeleton-shimmer" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-24 rounded skeleton-shimmer opacity-70" />
            <div className="h-11 w-full rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Action Button */}
        <div className="h-12 w-full rounded-xl skeleton-shimmer mt-6" />

        {/* Footer Link */}
        <div className="h-3.5 w-48 rounded mx-auto skeleton-shimmer opacity-50" />
      </div>
    </div>
  );
};

export default AuthLoader;
