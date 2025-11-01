/**
 * MapContainer - MapBox GL Wrapper Component (REFACTORED - Isolated Components)
 *
 * ARCHITECTURE:
 * - ONLY renders the Map component
 * - Delegates to isolated child components:
 *   - MapLayers: Source + native layers (memo)
 *   - MapPopupManager: Popup + AuthModal state (isolated)
 *   - SearchResultsBadge: Badge display (memo)
 *   - PropertiesCountBadge: Count display (memo)
 *
 * PERFORMANCE OPTIMIZATION:
 * - Each isolated component only re-renders when ITS props change
 * - Map pan/zoom does NOT trigger popup re-renders
 * - Popup open/close does NOT trigger Map re-renders
 * - SearchResults change does NOT trigger Map re-renders
 * - WebGL-based rendering on GPU (not DOM on CPU)
 *
 * RESPONSIBILITY:
 * - Render MapBox GL component
 * - Pass props to isolated children
 * - Coordinate between children via props/callbacks
 *
 * PROPS:
 * - viewState: Current map viewport
 * - onMove: Handler for map movement
 * - mapStyle: MapBox style URL
 * - mapboxToken: Access token
 * - properties: Properties to display
 * - isAuthenticated: Auth flag
 * - searchResults: AI search results
 */

"use client";

import { memo } from "react";
import Map, { type ViewStateChangeEvent, type MapRef } from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import type { MapProperty } from "../map-view";

// Import MapBox GL CSS
import "mapbox-gl/dist/mapbox-gl.css";

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration: number;
}

interface MapContainerProps {
  /** Reference to MapBox map instance */
  mapRef?: React.RefObject<MapRef | null>;
  /** Current viewport state */
  viewState: ViewState;
  /** Handler for map movement */
  onMove: (evt: ViewStateChangeEvent) => void;
  /** MapBox style URL (light/dark) */
  mapStyle: string;
  /** MapBox access token */
  mapboxToken: string;
  /** Properties to display as markers */
  properties?: MapProperty[];
  /** Whether user is authenticated (for auth modals) */
  isAuthenticated?: boolean;
  /** AI Search results - for display info */
  searchResults?: Array<{
    id: string;
    city?: string | null;
    address?: string | null;
    price: number;
  }>;
}

/**
 * FIXED: MapContainer - Map with properly memoized viewport
 *
 * ISSUE: useMapViewport was passing new object reference to useDebounce every render
 * SOLUTION: Memoize viewport object to prevent reference changes
 *
 * Now that viewport is properly memoized:
 * - Map only re-renders when viewport values actually change
 * - No infinite re-render loops
 * - MapLayers, popups, and badges can be added back
 */
export const MapContainer = memo(function MapContainer({
  mapRef,
  viewState,
  onMove,
  mapStyle,
  mapboxToken,
  // properties, // TODO: Used when MapLayers is added back
  // isAuthenticated = false, // TODO: Used when MapPopupManager is added back
  // searchResults, // TODO: Used when SearchResultsBadge is added back
}: MapContainerProps) {
  return (
    <div className="relative w-full h-screen isolate">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        padding={{ top: 80, bottom: 0, left: 0, right: 0 }}
        minZoom={DEFAULT_MAP_CONFIG.MIN_ZOOM}
        maxZoom={DEFAULT_MAP_CONFIG.MAX_ZOOM}
        attributionControl={false}
      >
        {/* MapLayers can be added back now */}
      </Map>
    </div>
  );
});
