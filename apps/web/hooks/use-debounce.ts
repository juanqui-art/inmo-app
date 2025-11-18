"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value.
 *
 * This hook will delay updating its output value until the input value
 * has not changed for a specified amount of time. This is useful for
 * preventing expensive operations (like API calls or URL updates) from
 * being triggered too frequently, for example, while a user is typing
 * in a search box or adjusting a slider.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent the debounced value from updating if the value
      // is changed within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
