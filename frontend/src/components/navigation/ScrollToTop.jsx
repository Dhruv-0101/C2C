import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 🔝 ScrollToTop Component
 * Automatically resets scroll position to the very top (0, 0) whenever the route changes.
 * Ensures pages like Privacy Policy, Terms of Service, and System Status always open from the start.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
