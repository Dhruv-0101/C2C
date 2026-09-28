import React from 'react';
import { SkeletonKPI, SkeletonGrid } from './SkeletonLoader';
import { TopProgressBar } from './TopProgressBar';

/**
 * ContentLoader Component
 * High-performance, nested Suspense fallback for Dashboard & Admin content areas.
 * Preserves the surrounding Sidebar and Header layout to eliminate layout shift (0 CLS).
 */
export const ContentLoader = ({ titleWidth = 'w-60', showKPIs = true, cardCount = 6 }) => {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <TopProgressBar />

      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/40">
        <div className="space-y-2">
          <div className={`h-8 ${titleWidth} rounded-xl skeleton-shimmer`} />
          <div className="h-4 w-80 max-w-full rounded-md skeleton-shimmer opacity-60" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-xl skeleton-shimmer" />
          <div className="h-10 w-36 rounded-xl skeleton-shimmer" />
        </div>
      </div>

      {/* KPI Stats Cards Skeleton (if enabled) */}
      {showKPIs && <SkeletonKPI count={4} />}

      {/* Content Grid Skeleton */}
      <SkeletonGrid count={cardCount} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
    </div>
  );
};

export default ContentLoader;
