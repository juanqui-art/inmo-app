/**
 * useMapViewport Hook - OPTIMIZED WITH MAPBOX 'idle' EVENT
 *
 * Handles viewport state management and URL synchronization:
 * - Viewport state (lat, lng, zoom, pitch, bearing)
 * - Initial viewport from URL or props
 * - URL updates when MapBox enters 'idle' state (INSTEAD of debounce)
 * - onMove handler
 *
 * OPTIMIZATION:
 * - Removed useDebounce: Uses MapBox 'idle' event instead
 * - Removed memoization: viewState is simple useState
 * - URL updates when MapBox detects user stopped interacting
 * - No artificial 500ms delay
 *
 * USAGE:
 * const { viewState, handleMove } = useMapViewport(initialViewport, mounted);
 *
 * RESPONSIBILITY:
 * - Viewport state management
 * - URL sync via MapBox 'idle' event (not debounce timer)
 * - Prevents infinite re-render loops
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ViewStateChangeEvent, MapRef } from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import {
  buildBoundsUrl,
  type MapViewport,
} from "@/lib/utils/url-helpers";

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
   * Track last URL to prevent duplicate updates
   */
  const lastUrlRef = useRef<string>("");

  /**
   * Store searchParams in a ref so we can access it in event listener
   * without creating a dependency (which would cause infinite loops)
   */
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  /**
   * OPTIMIZATION: Sync URL when MapBox enters 'idle' state
   *
   * Instead of debouncing (arbitrary 500ms wait), we listen to MapBox's native 'idle' event.
   * This fires when:
   * - User stops dragging
   * - Zoom animation completes
   * - Any other interaction ends
   *
   * Benefits:
   * - No artificial delay - URL updates immediately when user stops
   * - Synchronized with actual map state
   * - Cleaner code - just 1 event listener instead of debounce + memoization
   * - Better UX - instant URL updates
   */
  useEffect(() => {
    if (!mapRef?.current || !mounted) return;

    const updateUrlOnIdle = () => {
      try {
        const bounds = mapRef.current?.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const boundsData = {
          ne_lat: ne.lat,
          ne_lng: ne.lng,
          sw_lat: sw.lat,
          sw_lng: sw.lng,
        };

        // Build new URL, preserving existing query params (e.g., ai_search)
        // Use ref to get current searchParams without creating a dependency
        const newUrl = buildBoundsUrl(boundsData, searchParamsRef.current);

        // Only update if URL actually changed
        if (lastUrlRef.current !== newUrl) {
          lastUrlRef.current = newUrl;
          router.replace(newUrl, { scroll: false });
        }
      } catch (error) {
        console.warn("Failed to update URL on idle:", error);
      }
    };

    // Listen for 'idle' event - fires when MapBox detects no more interactions
    mapRef.current.on("idle", updateUrlOnIdle);

    return () => {
      mapRef.current?.off("idle", updateUrlOnIdle);
    };
  }, [mounted, router]);

  /**
   * Handle map movement
   * Updates viewport state when user drags/zooms the map
   *
   * PERFORMANCE FIX:
   * - Wrapped in useCallback with empty dependency array
   * - Stable reference across renders
   * - Prevents MapContainer from unnecessary re-renders
   * - React Scan: Reduces child component re-renders when map moves
   */
  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState({
      longitude: evt.viewState.longitude,
      latitude: evt.viewState.latitude,
      zoom: evt.viewState.zoom,
      pitch: DEFAULT_MAP_CONFIG.DEFAULT_PITCH,
      bearing: DEFAULT_MAP_CONFIG.DEFAULT_BEARING,
      transitionDuration: 0,
    });
  }, []);

  return {
    viewState,
    handleMove,
  };
}
