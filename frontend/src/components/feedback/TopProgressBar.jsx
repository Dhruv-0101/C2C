import React from 'react';

/**
 * TopProgressBar Component
 * Sleek, zero-CLS glowing progress line fixed at the viewport top during route transitions.
 */
export const TopProgressBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent overflow-hidden">
      <div className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-top-progress" />
    </div>
  );
};

export default TopProgressBar;
