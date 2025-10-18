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
import { MAPBOX_STYLES } from "@/lib/types/map";

interface UseMapThemeReturn {
	/** MapBox style URL (light or dark) */
	mapStyle: string;
}

export function useMapTheme(): UseMapThemeReturn {
	const { resolvedTheme } = useTheme();

	/**
	 * Determine map style based on theme
	 * Light mode → light style
	 * Dark mode → dark style
	 */
	const mapStyle =
		resolvedTheme === "dark" ? MAPBOX_STYLES.DARK : MAPBOX_STYLES.LIGHT;

	return { mapStyle };
}
