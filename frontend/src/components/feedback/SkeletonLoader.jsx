import React from 'react';

/**
  * ✨ ULTRA-PREMIUM SHIMMER SKELETON LOADER SUITE
  * Enterprise linear-gradient shimmer loading states for Cards, Grids, KPIs, Tables & Forms.
  */

/**
  * Basic primitive skeleton block with linear-gradient shimmer sweep
  */
export const SkeletonLoader = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const variantClasses = {
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    text: 'h-4 rounded-md',
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`skeleton-shimmer ${variantClasses[variant] || 'rounded-xl'} ${className}`}
          style={{
            width: width || (variant === 'circular' ? height : '100%'),
            height: height || (variant === 'text' ? '1rem' : 'auto'),
          }}
        />
      ))}
    </>
  );
};

/**
  * Shimmer Skeleton Card for Aspect-Ratio Visual Assets (Vault Items, Templates, Posts)
  */
export const SkeletonCard = ({
  variant = 'post', // 'post' | 'template' | 'vault' | 'festival'
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-700/50 bg-[#131B2A]/80 p-4 space-y-3.5 backdrop-blur-sm ${className}`}
    >
      {/* Visual Thumbnail Area */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden skeleton-shimmer">
        <div className="absolute top-2.5 right-2.5 w-16 h-5 rounded-full bg-slate-700/40" />
      </div>

      {/* Card Content & Details */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-3/5 rounded-md skeleton-shimmer" />
          <div className="h-4 w-12 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-3 w-4/5 rounded skeleton-shimmer opacity-70" />
      </div>

      {/* Footer / Actions placeholder for posts & vault */}
      {(variant === 'post' || variant === 'vault') && (
        <div className="pt-2 flex items-center justify-between border-t border-slate-700/40">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full skeleton-shimmer" />
            <div className="w-5 h-5 rounded-full skeleton-shimmer" />
          </div>
          <div className="w-14 h-6 rounded-lg skeleton-shimmer" />
        </div>
      )}
    </div>
  );
};

/**
  * Shimmer Skeleton Grid Container
  */
export const SkeletonGrid = ({
  variant = 'vault', // 'vault' | 'template' | 'post' | 'festival'
  count = 8,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  className = '',
}) => {
  const items = Array.from({ length: count });

  return (
    <div className={`grid ${columns} gap-4 sm:gap-6 ${className}`}>
      {items.map((_, idx) => (
        <SkeletonCard key={idx} variant={variant} />
      ))}
    </div>
  );
};

/**
  * KPI Metric Stat Card Skeleton (Analytics & Dashboard)
  */
export const SkeletonKPI = ({ count = 4, className = '' }) => {
  const items = Array.from({ length: count });

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-700/50 bg-[#131B2A]/80 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 rounded skeleton-shimmer opacity-80" />
            <div className="w-8 h-8 rounded-xl skeleton-shimmer" />
          </div>
          <div className="space-y-1.5">
            <div className="h-7 w-28 rounded-lg skeleton-shimmer" />
            <div className="h-3 w-16 rounded skeleton-shimmer opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
  * Table Shimmer Skeleton (Transactions, Users, SubAdmins, Posts)
  */
export const SkeletonTable = ({
  rows = 5,
  cols = 5,
  headers = [],
  className = '',
}) => {
  const rowItems = Array.from({ length: rows });
  const colItems = Array.from({ length: cols });

  return (
    <div className={`overflow-x-auto rounded-2xl border border-[#2C384E] bg-[#131B2A] ${className}`}>
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0B0F17] text-slate-400 uppercase font-semibold text-[11px] border-b border-[#2C384E]">
          <tr>
            {headers && headers.length > 0 ? (
              headers.map((h, idx) => (
                <th key={idx} className="py-3.5 px-4">{h}</th>
              ))
            ) : (
              colItems.map((_, cIdx) => (
                <th key={cIdx} className="py-3.5 px-4">
                  <div className="h-3.5 w-20 rounded skeleton-shimmer opacity-70" />
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2C384E]/50">
          {rowItems.map((_, rIdx) => (
            <tr key={rIdx} className="border-b border-[#2C384E]/40">
              {colItems.map((_, cIdx) => (
                <td key={cIdx} className="py-3.5 px-4">
                  {cIdx === 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl skeleton-shimmer shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 rounded skeleton-shimmer" />
                        <div className="h-2.5 w-16 rounded skeleton-shimmer opacity-60" />
                      </div>
                    </div>
                  ) : cIdx === colItems.length - 1 ? (
                    <div className="h-7 w-16 rounded-lg skeleton-shimmer ml-auto" />
                  ) : cIdx % 2 === 1 ? (
                    <div className="h-6 w-20 rounded-full skeleton-shimmer" />
                  ) : (
                    <div
                      className="h-3.5 rounded skeleton-shimmer"
                      style={{ width: `${50 + ((rIdx + cIdx) % 3) * 20}%` }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
  * Form Shimmer Skeleton (BrandKit Form & Profile)
  */
export const SkeletonForm = ({ fields = 6, className = '' }) => {
  const fieldItems = Array.from({ length: fields });

  return (
    <div className={`space-y-6 rounded-2xl border border-slate-700/50 bg-[#131B2A]/80 p-6 sm:p-8 ${className}`}>
      <div className="flex items-center gap-6 pb-6 border-b border-slate-700/50">
        <div className="w-24 h-24 rounded-2xl skeleton-shimmer shrink-0" />
        <div className="space-y-2 w-full max-w-sm">
          <div className="h-5 w-40 rounded skeleton-shimmer" />
          <div className="h-3.5 w-60 rounded skeleton-shimmer opacity-70" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fieldItems.map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3.5 w-24 rounded skeleton-shimmer opacity-80" />
            <div className="h-11 w-full rounded-xl skeleton-shimmer" />
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <div className="h-11 w-32 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
};

export default SkeletonLoader;

