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

import { useState, useEffect } from "react";
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
  const searchParams = useSearchParams();

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
   * Sync bounds to URL (Zillow/Airbnb pattern)
   * Updates URL when user stops moving the map (debounced)
   * IMPORTANT: Only updates if URL values actually changed to prevent infinite loops
   */
  useEffect(() => {
    // Skip on initial mount (already at correct URL from server)
    if (!mounted) return;

    // Get current URL params (bounds format)
    const currentNeLat = searchParams.get("ne_lat");
    const currentNeLng = searchParams.get("ne_lng");
    const currentSwLat = searchParams.get("sw_lat");
    const currentSwLng = searchParams.get("sw_lng");

    // Format new values (same precision as buildBoundsUrl)
    const newNeLat = debouncedBounds.ne_lat.toFixed(4);
    const newNeLng = debouncedBounds.ne_lng.toFixed(4);
    const newSwLat = debouncedBounds.sw_lat.toFixed(4);
    const newSwLng = debouncedBounds.sw_lng.toFixed(4);

    // Only update URL if values actually changed
    // This prevents infinite re-render loops
    if (
      currentNeLat !== newNeLat ||
      currentNeLng !== newNeLng ||
      currentSwLat !== newSwLat ||
      currentSwLng !== newSwLng
    ) {
      const newUrl = buildBoundsUrl(debouncedBounds);
      router.replace(newUrl, { scroll: false });
    }
  }, [debouncedBounds, router, mounted, searchParams]);

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
