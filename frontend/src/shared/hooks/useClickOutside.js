import { useEffect, useRef } from 'react';

/**
 * Universal Click Outside hook
 * @param {Function} handler - Callback to execute on outside click
 * @returns {React.RefObject} Ref to attach to the container
 */
export const useClickOutside = (handler) => {
  const domNode = useRef();

  useEffect(() => {
    const maybeHandler = (event) => {
      if (domNode.current && !domNode.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', maybeHandler);
    return () => {
      document.removeEventListener('mousedown', maybeHandler);
    };
  }, [handler]);

  return domNode;
};

export default useClickOutside;
