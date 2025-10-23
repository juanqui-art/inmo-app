/**
 * useMapViewport Hook
 *
 * Handles viewport state management and URL synchronization:
 * - Viewport state (lat, lng, zoom, pitch, bearing)
 * - Initial viewport from URL or props
 * - Debounced URL updates
 * - onMove handler
 *
 * USAGE:
 * const { viewState, handleMove } = useMapViewport(initialViewport, mounted);
 *
 * RESPONSIBILITY:
 * - Viewport state management
 * - URL sync (read from searchParams, write with debounce)
 * - Prevents infinite re-render loops
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ViewStateChangeEvent } from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import {
  buildBoundsUrl,
  viewportToBounds,
  type MapViewport,
  type MapBounds,
} from "@/lib/utils/url-helpers";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration: number;
}

interface UseMapViewportProps {
  initialViewport?: MapViewport;
  initialCenter?: [number, number];
  initialZoom?: number;
  mounted: boolean;
}

interface UseMapViewportReturn {
  viewState: ViewState;
  handleMove: (evt: ViewStateChangeEvent) => void;
}

export function useMapViewport({
  initialViewport,
  initialCenter,
  initialZoom = DEFAULT_MAP_CONFIG.DEFAULT_ZOOM,
  mounted,
}: UseMapViewportProps): UseMapViewportReturn {
  const router = useRouter();
  useSearchParams(); // Keep for reactive updates, but don't use in effect

  /**
   * Viewport state
   * Controls camera position and zoom level
   * Prioritizes: initialViewport (from URL) > initialCenter > defaults
   */
  const [viewState, setViewState] = useState<ViewState>({
    longitude:
      initialViewport?.longitude ??
      initialCenter?.[0] ??
      DEFAULT_MAP_CONFIG.AZUAY_CENTER.longitude,
    latitude:
      initialViewport?.latitude ??
      initialCenter?.[1] ??
      DEFAULT_MAP_CONFIG.AZUAY_CENTER.latitude,
    zoom: initialViewport?.zoom ?? initialZoom,
    pitch: DEFAULT_MAP_CONFIG.DEFAULT_PITCH,
    bearing: DEFAULT_MAP_CONFIG.DEFAULT_BEARING,
    transitionDuration: 0, // No animation on initial load
  });

  /**
   * Debounced viewport for URL updates
   * Prevents updating URL on every pixel movement (500ms delay)
   */
  const debouncedViewport = useDebounce<MapViewport>(
    {
      latitude: viewState.latitude,
      longitude: viewState.longitude,
      zoom: viewState.zoom,
    },
    500,
  );

  /**
   * Convert debounced viewport to bounds for URL
   * Uses viewportToBounds which matches the clustering calculation
   */
  const debouncedBounds: MapBounds = viewportToBounds(debouncedViewport);

  /**
   * Track last URL to prevent infinite loop
   *
   * BUG FIX: Previous version had searchParams in useEffect dependencies,
   * causing an infinite loop:
   * 1. useEffect updates URL with router.replace()
   * 2. URL changes → searchParams changes
   * 3. searchParams in dependencies → useEffect runs again
   * 4. Go to step 1 (infinite loop!)
   *
   * SOLUTION: Use useRef to track last URL built, without depending on
   * searchParams in useEffect dependencies. This breaks the loop while
   * still preventing duplicate URL updates.
   */
  const lastUrlRef = useRef<string>("");

  /**
   * Sync bounds to URL (Zillow/Airbnb pattern)
   * Updates URL when user stops moving the map (debounced)
   * IMPORTANT: Only updates if URL values actually changed to prevent infinite loops
   */
  useEffect(() => {
    // Skip on initial mount (already at correct URL from server)
    if (!mounted) return;

    // Build new URL
    const newUrl = buildBoundsUrl(debouncedBounds);

    // Only update URL if it actually changed
    // This prevents infinite re-render loops AND duplicate router.replace() calls
    if (lastUrlRef.current !== newUrl) {
      lastUrlRef.current = newUrl;
      router.replace(newUrl, { scroll: false });
    }
  }, [debouncedBounds, router, mounted]); // ← NO searchParams (breaks the loop!)

  /**
   * Handle map movement
   * Updates viewport state when user drags/zooms the map
   */
  const handleMove = (evt: ViewStateChangeEvent) => {
    setViewState({
      longitude: evt.viewState.longitude,
      latitude: evt.viewState.latitude,
      zoom: evt.viewState.zoom,
      pitch: DEFAULT_MAP_CONFIG.DEFAULT_PITCH,
      bearing: DEFAULT_MAP_CONFIG.DEFAULT_BEARING,
      transitionDuration: 0,
    });
  };

  return {
    viewState,
    handleMove,
  };
}
