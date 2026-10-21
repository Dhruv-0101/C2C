import React from 'react';
import { TopProgressBar } from './TopProgressBar';
import { CreativeStudioLoader } from './CreativeStudioLoader';

/**
 * ContentLoader Component
 *
 * High-performance, nested Suspense fallback for Dashboard, Admin & Workspace content areas.
 * Replaces the old boring grey rectangular shimmer with BrandFlow's AI Fox Cartoon Studio Wall Card.
 *
 * @param {Object} props
 * @param {string} [props.title='Loading Workspace Studio...'] - Header title.
 * @param {string} [props.subtitle] - Optional subtitle text.
 */
export const ContentLoader = ({
  title = 'Loading Workspace Studio...',
  subtitle,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 sm:py-8 animate-in fade-in duration-200">
      <TopProgressBar />
      <CreativeStudioLoader
        variant="inline"
        title={title}
        subtitle={subtitle}
        interactive={true}
      />
    </div>
  );
};

export default ContentLoader;
