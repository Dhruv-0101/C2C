import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing fast-changing values (e.g. search inputs).
 * Delays invoking server-side queries until user stops typing.
 *
 * @param {any} value - Input value to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
