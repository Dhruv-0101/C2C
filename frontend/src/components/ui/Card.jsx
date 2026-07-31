import React from 'react';
import clsx from 'clsx';

/**
 * Reusable Glassmorphism Card Container
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={clsx(
        'glass-panel rounded-2xl p-6 sm:p-8 shadow-glass transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
