import React from 'react';
import { CreativeStudioLoader } from './CreativeStudioLoader';

/**
 * PageLoader Component
 *
 * Full-screen root layout fallback for initial application bootstrap and route chunk lazy-loading.
 * Features BrandFlow's signature AI Fox Cartoon Artist Studio Loader, responsive layout preservation,
 * and automatic Dark / Light mode adaptation.
 *
 * @param {Object} props
 * @param {string} [props.title] - Optional custom headline.
 * @param {string} [props.subtitle] - Optional custom status text.
 * @param {boolean} [props.showSidebar=true] - Whether to render the ghost sidebar layout.
 */
export const PageLoader = ({
  title = 'Crafting Your Social Studio',
  subtitle,
  showSidebar = true,
}) => {
  return (
    <CreativeStudioLoader
      variant="fullscreen"
      title={title}
      subtitle={subtitle}
      showSidebar={showSidebar}
      interactive={true}
    />
  );
};

export default PageLoader;
