import React from 'react';
import { SkeletonGrid, SkeletonKPI } from './SkeletonLoader';
import { TopProgressBar } from './TopProgressBar';

/**
 * PageLoader Component
 * Full-screen skeleton layout fallback for initial app bootstrap and root route chunk loading.
 * Preserves layout geometry, sidebar structure, and content flow with linear-gradient shimmers.
 */
export const PageLoader = () => {
  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-white flex flex-col animate-in fade-in duration-200">
      <TopProgressBar />

      {/* Top Navigation Bar Skeleton */}
      <div className="h-16 border-b border-[#2C384E] bg-[#131B2A]/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
          <div className="h-5 w-32 rounded-lg skeleton-shimmer" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-9 w-48 rounded-xl skeleton-shimmer hidden sm:block" />
          <div className="w-9 h-9 rounded-full skeleton-shimmer" />
        </div>
      </div>

      {/* Main App Body Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton (Hidden on Mobile) */}
        <div className="w-64 border-r border-[#2C384E] bg-[#131B2A]/50 p-4 space-y-3 hidden md:block">
          <div className="h-4 w-24 rounded skeleton-shimmer opacity-70 mb-4" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-10 w-full rounded-xl skeleton-shimmer" />
          ))}
          <div className="pt-8 space-y-2">
            <div className="h-3.5 w-20 rounded skeleton-shimmer opacity-50" />
            <div className="h-10 w-full rounded-xl skeleton-shimmer" />
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Page Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-7 w-60 rounded-xl skeleton-shimmer" />
              <div className="h-4 w-96 rounded skeleton-shimmer opacity-60" />
            </div>
            <div className="h-10 w-36 rounded-xl skeleton-shimmer" />
          </div>

          {/* Metric KPIs Skeleton */}
          <SkeletonKPI count={4} />

          {/* Content Grid Skeleton */}
          <SkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;

