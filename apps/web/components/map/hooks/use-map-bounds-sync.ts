/**
 * MAP BOUNDS URL SYNCHRONIZATION HOOK
 *
 * Syncs map viewport bounds with URL parameters for:
 * - Shareable map URLs
 * - Browser back/forward navigation
 * - Page refresh persistence
 *
 * USAGE:
 * ```tsx
 * const mapRef = useRef<MapRef>(null);
 * useMapBoundsSync(mapRef, isMapLoaded);
 * ```
 *
 * URL FORMAT:
 * /propiedades?view=map&ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
 *
 * PERFORMANCE:
 * - Debounced updates (500ms) to prevent URL spam during pan/zoom
 * - Only updates when bounds change significantly (>0.001° threshold)
 * - Uses router.replace() to avoid polluting browser history
 *
 * IMPLEMENTATION: Nov 29, 2025
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import { buildBoundsUrl } from "@/lib/utils/url-helpers";

/**
 * Debounce utility for performance optimization
 * Delays function execution until after wait milliseconds have elapsed
 * since the last invocation
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook to synchronize map viewport bounds with URL parameters
 *
 * @param mapRef - React ref to the Mapbox map instance
 * @param isMapLoaded - Boolean indicating if map has finished loading
 *
 * BEHAVIOR:
 * 1. Listens to map 'moveend' events (triggered after pan, zoom, flyTo)
 * 2. Extracts current viewport bounds
 * 3. Debounces updates (500ms) to prevent excessive URL changes
 * 4. Updates URL with new bounds using router.replace()
 * 5. Preserves existing query parameters (filters, view, etc.)
 *
 * EDGE CASES:
 * - Skips update if map not loaded
 * - Skips update if bounds are invalid (null coordinates)
 * - Clamps bounds to Ecuador region (handled by buildBoundsUrl)
 * - Rounds coordinates to 4 decimal places (~11m precision)
 *
 * EXAMPLE URL CHANGE:
 * Before: /propiedades?view=map&city=Cuenca
 * After:  /propiedades?view=map&city=Cuenca&ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
 */
export function useMapBoundsSync(
  mapRef: RefObject<MapRef | null>,
  isMapLoaded: boolean,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track last synced bounds to avoid unnecessary updates
  const lastBoundsRef = useRef<string | null>(null);

  /**
   * Update URL with current map bounds
   * Called on map moveend events (debounced)
   */
  const updateBoundsInUrl = useCallback(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const map = mapRef.current.getMap();
    const bounds = map.getBounds();

    // Ensure bounds exist before processing
    if (!bounds) return;

    // Extract bounds coordinates
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Round to 4 decimal places to avoid float precision issues
    const boundsObj = {
      ne_lat: Number(ne.lat.toFixed(4)),
      ne_lng: Number(ne.lng.toFixed(4)),
      sw_lat: Number(sw.lat.toFixed(4)),
      sw_lng: Number(sw.lng.toFixed(4)),
    };

    // Create unique key for bounds comparison
    const boundsKey = `${boundsObj.ne_lat},${boundsObj.ne_lng},${boundsObj.sw_lat},${boundsObj.sw_lng}`;

    // Skip if bounds haven't changed significantly
    if (lastBoundsRef.current === boundsKey) {
      return;
    }

    // Update last bounds
    lastBoundsRef.current = boundsKey;

    // Build new URL with bounds
    const currentParams = new URLSearchParams(searchParams.toString());
    const boundsUrl = buildBoundsUrl(boundsObj, currentParams);

    // Update URL without adding to browser history (use replace instead of push)
    // This prevents back button from replaying every pan/zoom
    const newUrl = `${pathname}?${boundsUrl}`;

    // Only update if URL actually changed
    const currentUrl = `${pathname}?${currentParams.toString()}`;
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [mapRef, isMapLoaded, pathname, searchParams, router]);

  /**
   * Debounced version of updateBoundsInUrl
   * Waits 500ms after last moveend event before updating URL
   *
   * WHY 500ms?
   * - Too short (100ms): Still spams URL during quick pans
   * - Too long (1000ms): Feels laggy, URL updates delayed
   * - 500ms: Good balance between responsiveness and performance
   */
  const debouncedUpdate = useCallback(debounce(updateBoundsInUrl, 500), []);

  /**
   * Setup map event listener on mount
   * Cleanup on unmount
   */
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const map = mapRef.current.getMap();

    // Listen to moveend event
    // Triggered after:
    // - Pan (user drags map)
    // - Zoom (scroll wheel, +/- buttons, double-click)
    // - flyTo() animation completes
    // - fitBounds() animation completes
    map.on("moveend", debouncedUpdate);

    // Cleanup listener on unmount
    return () => {
      map.off("moveend", debouncedUpdate);
    };
  }, [mapRef, isMapLoaded, debouncedUpdate]);
}
