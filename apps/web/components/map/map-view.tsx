/**
 * MapView - Interactive MapBox GL Component
 *
 * PATTERN: Orchestrator Component (Separation of Concerns)
 *
 * ARCHITECTURE:
 * - Uses custom hooks for business logic (initialization, theme, viewport)
 * - Uses presentational components for UI (error, loading, container)
 * - This component only orchestrates, no business logic
 *
 * FEATURES:
 * - Dark/light mode automatic switching
 * - Responsive viewport
 * - URL State: Shareable map positions (viewport syncs to URL)
 * - Debounced URL updates (500ms) for performance
 * - Smart viewport fitting for AI search results
 *   - 1 result → close-up street-level view (zoom 16)
 *   - Multiple results → fitted view showing all (zoom auto)
 *   - 0 results → default Cuenca view (zoom 11)
 * - Property markers with interactive controls
 *
 * REFACTORED:
 * - Separated concerns into hooks and UI components
 * - ~60 lines (was 335 lines before refactoring)
 * - Each hook/component has single responsibility
 * - Testable and reusable
 *
 * RESOURCES:
 * - https://visgl.github.io/react-map-gl/
 * - https://docs.mapbox.com/mapbox-gl-js/
 */

"use client";

import { useRef, useEffect } from "react";
import type { MapViewport } from "@/lib/utils/url-helpers";
import type { TransactionType } from "@repo/database";
import type { MapRef } from "react-map-gl/mapbox";
import { boundsToMapBoxFormat, calculateBounds } from "@/lib/utils/map-bounds";
import { useMapInitialization } from "./hooks/use-map-initialization";
import { useMapTheme } from "./hooks/use-map-theme";
import { useMapViewport } from "./hooks/use-map-viewport";
import { MapContainer } from "./ui/map-container";
import { MapErrorState } from "./ui/map-error-state";
import { MapLoadingState } from "./ui/map-loading-state";

/**
 * Minimal property data needed for map rendering
 * Flexible type that works with partial selects from Prisma
 * Extended to support popup display and details
 */
export interface MapProperty {
  id: string;
  title: string;
  price: number;
  transactionType: TransactionType;
  category?: string;
  latitude: number | null;
  longitude: number | null;
  city?: string;
  state?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  images?: Array<{
    url: string;
    alt: string | null;
  }>;
}

interface MapViewProps {
  properties: MapProperty[];
  initialCenter?: [number, number];
  initialZoom?: number;
  initialViewport?: MapViewport;
  isAuthenticated?: boolean;
  /** AI Search results - optional filter */
  searchResults?: Array<{
    id: string;
    city?: string | null;
    address?: string | null;
    price: number;
  }>;
}

export function MapView({
  properties,
  initialCenter,
  initialZoom,
  initialViewport,
  isAuthenticated = false,
  searchResults,
}: MapViewProps) {
  // Create ref for MapBox map instance
  // Used to get precise bounds that account for navbar
  const mapRef = useRef<MapRef>(null);

  // Hooks for business logic
  const { mounted, mapboxToken, isError } = useMapInitialization();
  const { mapStyle } = useMapTheme();
  const { viewState, handleMove } = useMapViewport({
    initialViewport,
    initialCenter,
    initialZoom,
    mounted,
    mapRef, // Pass ref to hook
  });

  // Filter properties based on AI search results
  const displayedProperties = searchResults
    ? properties.filter((prop) =>
        searchResults.some((result) => result.id === prop.id)
      )
    : properties;

  // Apply fitBounds animation when search results change
  // Only trigger when searchResults changes, not on every render
  useEffect(() => {
    if (mapRef.current && searchResults && searchResults.length > 0) {
      // Calculate bounding box from search results
      const bounds = calculateBounds(searchResults);

      if (bounds) {
        const mapBoxBounds = boundsToMapBoxFormat(bounds);

        // Apply fitBounds with animation
        mapRef.current.fitBounds(mapBoxBounds, {
          padding: {
            top: 100, // Account for navbar
            bottom: 50,
            left: 50,
            right: 50,
          },
          duration: 600, // Smooth 600ms transition
          maxZoom: 17, // Don't zoom in closer than street level
        });

        console.log("🎬 fitBounds animation applied:", {
          resultCount: searchResults.length,
          bounds,
        });
      }
    }
  }, [searchResults]);

  // Error state: Missing MapBox token
  if (isError) {
    return <MapErrorState />;
  }

  // Loading state: Hydration in progress
  if (!mounted) {
    return <MapLoadingState />;
  }

  // Render map
  return (
    <MapContainer
      mapRef={mapRef}
      viewState={viewState}
      onMove={handleMove}
      mapStyle={mapStyle}
      mapboxToken={mapboxToken!} // Safe: checked by isError
      properties={displayedProperties}
      isAuthenticated={isAuthenticated}
      searchResults={searchResults}
    />
  );
}

/**
 * COMPLETED FEATURES:
 * ✅ Interactive MapBox GL with dark/light mode
 * ✅ Property markers with price display
 * ✅ Navigation controls (zoom, compass, pitch)
 * ✅ URL State: Shareable map positions (/mapa?lat=-2.90&lng=-79.00&zoom=12)
 * ✅ Debounced URL updates (500ms delay)
 * ✅ Browser history support (back/forward)
 * ✅ Separation of Concerns refactoring
 *
 * NEXT STEPS:
 *
 * Phase 3 - Search & Filters:
 * - Implement MapSearchBar (location search with geocoding)
 * - Implement MapFilters (price, transaction type, property category)
 * - Add filter persistence in URL params
 * - Add "Clear filters" functionality
 *
 * Phase 4 - Property Popups:
 * - Add PropertyPopup component (shows on marker click)
 * - Display property details (image, title, specs)
 * - Add "View Details" link to property page
 * - Add favorite toggle in popup
 *
 * Phase 5 - Advanced Features:
 * - Clustering for many markers (>50 properties)
 * - Viewport-based property filtering (only show visible properties)
 * - Fly-to animation when selecting from search
 * - Geolocation button ("Find my location")
 * - Draw custom search areas on map
 */
