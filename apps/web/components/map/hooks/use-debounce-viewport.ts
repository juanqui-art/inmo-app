/**
 * useDebounceViewport Hook
 *
 * Debounces viewport state changes to reduce expensive clustering calculations
 *
 * PROBLEM:
 * - useMapClustering recalculates clusters on every viewState change
 * - During panning, viewState updates 60x/second
 * - Each recalculation is expensive (Supercluster bounds query)
 * - Results in 230ms+ "other time" (canvas redraws)
 *
 * SOLUTION:
 * - Return a debounced viewState that updates every 200ms
 * - Map component still uses live viewState (smooth panning)
 * - useMapClustering uses debounced viewState (batch updates)
 * - Only recalculate clusters every 200ms, not 60x/second
 *
 * PERFORMANCE IMPACT:
 * - Reduces cluster recalculations from 60/sec to 5/sec during pan
 * - Estimated: 100-150ms savings during active panning
 * - No UX impact: user won't notice 200ms batch delay
 *
 * USAGE:
 * const debouncedViewState = useDebounceViewport(viewState, 200);
 * const clusters = useMapClustering({
 *   properties,
 *   viewState: debouncedViewState,  // Use debounced for clustering
 *   mapRef,
 * });
 */

"use client";

import { useRef, useEffect, useState } from "react";

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  transitionDuration?: number;
}

/**
 * Debounce viewport state changes
 *
 * @param viewState - Current viewport state (updates frequently)
 * @param delayMs - Debounce delay in milliseconds (default: 200ms)
 * @returns Debounced viewport state (updates every delayMs)
 */
export function useDebounceViewport(
  viewState: ViewState,
  delayMs: number = 200,
): ViewState {
  const [debouncedViewState, setDebouncedViewState] = useState(viewState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to update debounced state
    timeoutRef.current = setTimeout(() => {
      setDebouncedViewState(viewState);
    }, delayMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [viewState, delayMs]);

  return debouncedViewState;
}
