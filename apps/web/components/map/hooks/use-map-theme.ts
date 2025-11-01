/**
 * useMapTheme Hook
 *
 * Handles map theme/style selection based on user's theme preference
 * - Detects system/user theme (light/dark)
 * - Returns appropriate MapBox style URL
 *
 * USAGE:
 * const { mapStyle } = useMapTheme();
 *
 * RESPONSIBILITY:
 * - Single source of truth for map styling
 * - Automatic theme switching
 * - Works with next-themes
 */

"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import { MAPBOX_STYLES } from "@/lib/types/map";

interface UseMapThemeReturn {
  /** MapBox style URL (light or dark) */
  mapStyle: string;
}

export function useMapTheme(): UseMapThemeReturn {
  const { resolvedTheme } = useTheme();

  /**
   * Memoize the return object to prevent new object creation
   *
   * PERFORMANCE FIX:
   * - useMapTheme was returning { mapStyle } as a new object each render
   * - Even though mapStyle value was the same, the object was new
   * - React.memo() on MapContainer saw this as a prop change
   * - Caused constant MapContainer re-renders = 572ms slowdown
   *
   * SOLUTION:
   * - Memoize based on resolvedTheme
   * - Only create new object when theme actually changes
   * - Stable reference prevents MapContainer re-renders
   */
  return useMemo(
    () => ({
      mapStyle:
        resolvedTheme === "dark" ? MAPBOX_STYLES.DARK : MAPBOX_STYLES.LIGHT,
    }),
    [resolvedTheme]
  );
}
