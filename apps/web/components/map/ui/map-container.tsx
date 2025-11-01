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

import { memo, useState, useCallback, useEffect } from "react";
import Map, { type ViewStateChangeEvent, type MapRef } from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import { MapLayers } from "./map-layers";
import { MapPopupManager } from "./map-popup-manager";
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
 * STEP 2: Add MapLayers back
 *
 * Now that viewport memoization is fixed:
 * - Map can safely render MapLayers without infinite re-renders
 * - MapLayers is memoized and only re-renders when properties change
 * - User can now see markers and clusters
 */
export const MapContainer = memo(function MapContainer({
  mapRef,
  viewState,
  onMove,
  mapStyle,
  mapboxToken,
  properties,
  isAuthenticated = false,
  // searchResults, // TODO: Used when SearchResultsBadge is added back
}: MapContainerProps) {
  // Local state for selected property popup
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handlePropertyClick = useCallback((propertyId: string) => {
    setSelectedPropertyId(propertyId);
  }, []);

  /**
   * Attach click listeners to the marker layer when the map is ready
   * This happens AFTER the Source and Layers are rendered
   */
  useEffect(() => {
    if (!mapRef?.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    const checkAndAttachListener = () => {
      const layer = map.getLayer("unclustered-point");
      if (!layer) {
        setTimeout(checkAndAttachListener, 100);
        return;
      }

      const onClick = (e: any) => {
        if (e.features && e.features.length > 0) {
          const propertyId = e.features[0].id;
          handlePropertyClick(propertyId);
        }
      };

      const onMouseEnter = () => {
        map.getCanvas().style.cursor = "pointer";
      };

      const onMouseLeave = () => {
        map.getCanvas().style.cursor = "";
      };

      map.on("click", "unclustered-point", onClick);
      map.on("mouseenter", "unclustered-point", onMouseEnter);
      map.on("mouseleave", "unclustered-point", onMouseLeave);

      // Return cleanup function
      return () => {
        map.off("click", "unclustered-point", onClick);
        map.off("mouseenter", "unclustered-point", onMouseEnter);
        map.off("mouseleave", "unclustered-point", onMouseLeave);
      };
    };

    const cleanup = checkAndAttachListener();
    return cleanup;
  }, [mapRef, handlePropertyClick]);

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
        {/* MapLayers renders markers + clusters */}
        {properties && <MapLayers properties={properties} />}
      </Map>

      {/* MapPopupManager handles popup display and auth modal */}
      {properties && (
        <MapPopupManager
          properties={properties}
          isAuthenticated={isAuthenticated}
          selectedPropertyId={selectedPropertyId}
          onSelectedPropertyIdChange={setSelectedPropertyId}
        />
      )}
    </div>
  );
});
