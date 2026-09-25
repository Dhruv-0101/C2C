import React from 'react';

/**
 * Universal Shimmer Skeleton Loader for Cards, Tables & Text
 */
export const SkeletonLoader = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-slate-800/80 rounded-lg';

  const variantClasses = {
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    text: 'h-4 rounded',
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
          style={{
            width: width || (variant === 'circular' ? height : '100%'),
            height: height || (variant === 'text' ? '1rem' : 'auto'),
          }}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
