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

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ViewStateChangeEvent, MapRef } from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import {
  buildBoundsUrl,
  type MapViewport,
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
  mapRef?: React.RefObject<MapRef | null>;
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
  mapRef,
}: UseMapViewportProps): UseMapViewportReturn {
  const router = useRouter();
  const searchParams = useSearchParams(); // Keep for reactive updates AND to preserve params

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
   * Get bounds from MapBox using native getBounds() method
   *
   * WHY getBounds()?
   * - MapBox calculates REAL bounds considering navbar/padding
   * - Previous approach used viewportToBounds() which was symmetric
   * - Symmetric bounds don't account for fixed navbar at top
   * - Result: properties in upper area weren't fetched correctly
   *
   * SOLUTION:
   * - Use map.getBounds() which returns actual visible bounds
   * - Accounts for navbar and any viewport padding
   * - Guarantees bounds match exactly what user sees
   *
   * STABILITY:
   * - Wrapped in useMemo to prevent creating new object every render
   * - Only recalculates when debouncedViewport actually changes
   * - Prevents infinite loop caused by object identity changes
   */
  const debouncedBounds = useMemo(() => {
    // If mapRef available, use actual MapBox bounds
    if (mapRef?.current) {
      try {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          return {
            ne_lat: ne.lat,
            ne_lng: ne.lng,
            sw_lat: sw.lat,
            sw_lng: sw.lng,
          };
        }
      } catch (error) {
        console.warn("Failed to get bounds from map, using fallback", error);
      }
    }

    // Fallback: Calculate bounds mathematically (for initial render)
    // This won't account for navbar but works when map isn't ready
    const latitudeDelta = (180 / Math.pow(2, debouncedViewport.zoom)) * 1.2;
    const longitudeDelta = (360 / Math.pow(2, debouncedViewport.zoom)) * 1.2;

    return {
      ne_lat: debouncedViewport.latitude + latitudeDelta,
      ne_lng: debouncedViewport.longitude + longitudeDelta,
      sw_lat: debouncedViewport.latitude - latitudeDelta,
      sw_lng: debouncedViewport.longitude - longitudeDelta,
    };
  }, [debouncedViewport, mapRef]);

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
   *
   * NOTE: mapRef intentionally NOT in dependencies
   * - mapRef is mutable reference (doesn't change)
   * - We only use it inside the bounds calculation above
   * - Adding it would unnecessarily trigger effect runs
   */
  useEffect(() => {
    // Skip on initial mount (already at correct URL from server)
    if (!mounted) return;

    // Build new URL, preserving existing query params (e.g., ai_search)
    const newUrl = buildBoundsUrl(debouncedBounds, searchParams);

    // Only update URL if it actually changed
    // This prevents infinite re-render loops AND duplicate router.replace() calls
    if (lastUrlRef.current !== newUrl) {
      lastUrlRef.current = newUrl;
      router.replace(newUrl, { scroll: false });
    }
    // NOTE: searchParams intentionally NOT in dependencies to avoid infinite loop
    // We use it inline but don't react to its changes (would cause loop via router.replace)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBounds, router, mounted]); // ← mapRef, searchParams NOT included

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
