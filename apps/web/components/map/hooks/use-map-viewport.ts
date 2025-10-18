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
import { buildMapUrl, type MapViewport } from "@/lib/utils/url-helpers";
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
		500
	);

	/**
	 * Sync viewport to URL
	 * Updates URL when user stops moving the map (debounced)
	 * IMPORTANT: Only updates if URL values actually changed to prevent infinite loops
	 */
	useEffect(() => {
		// Skip on initial mount (already at correct URL from server)
		if (!mounted) return;

		// Get current URL params
		const currentLat = searchParams.get("lat");
		const currentLng = searchParams.get("lng");
		const currentZoom = searchParams.get("zoom");

		// Format new values (same precision as buildMapUrl)
		const newLat = debouncedViewport.latitude.toFixed(4);
		const newLng = debouncedViewport.longitude.toFixed(4);
		const newZoom = Math.round(debouncedViewport.zoom).toString();

		// Only update URL if values actually changed
		// This prevents infinite re-render loops
		if (
			currentLat !== newLat ||
			currentLng !== newLng ||
			currentZoom !== newZoom
		) {
			const newUrl = buildMapUrl(debouncedViewport);
			router.replace(newUrl, { scroll: false });
		}
	}, [debouncedViewport, router, mounted, searchParams]);

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
