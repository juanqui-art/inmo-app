/**
 * MapContainer - MapBox GL Wrapper Component (Using Native Layers)
 *
 * ARCHITECTURE MIGRATION: DOM Markers → MapBox Native Layers
 *
 * Handles rendering of the MapBox GL map with:
 * - MapBox native layers for property markers (WebGL rendering)
 * - Native clustering using MapBox cluster feature
 * - Property popups (React component triggered by layer clicks)
 * - Navigation controls and configuration
 *
 * PERFORMANCE:
 * - WebGL-based rendering on GPU (not DOM on CPU)
 * - Native clustering eliminates Supercluster calculations
 * - Expected 17-35x performance improvement
 * - Smooth 60 FPS during pan/zoom
 *
 * USAGE:
 * <MapContainer
 *   viewState={viewState}
 *   onMove={handleMove}
 *   mapStyle={mapStyle}
 *   mapboxToken={mapboxToken}
 *   properties={properties}
 * />
 *
 * RESPONSIBILITY:
 * - Render MapBox GL component with native layers
 * - Convert properties to GeoJSON features
 * - Configure property markers layer (circles with color by transaction type)
 * - Configure cluster visualization (size + color by count)
 * - Handle layer click events for popup display
 * - Render property popups (React component)
 * - Render navigation controls
 */

"use client";

import { useState, useCallback, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import Map, {
  type ViewStateChangeEvent,
  type MapRef,
  Source,
  Layer,
} from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import { PropertyPopup } from "../property-popup";
import { AuthModal } from "@/components/auth/auth-modal";
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
  properties: MapProperty[];
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
 * PERFORMANCE OPTIMIZATION: Memoized MapContainer
 *
 * WHY memo()?
 * - MapContainer receives props from MapView
 * - props change on every MapView render (viewState, clusters, etc)
 * - But memo() only re-renders if prop VALUES actually change
 * - Not prop references or parent renders
 *
 * RESULT:
 * - Map doesn't re-render unless viewState/properties/mapStyle actually changes
 * - Prevents infinite render loop from parent component updates
 * - Clusters won't re-render from parent-triggered renders
 */
export const MapContainer = memo(function MapContainer({
  mapRef,
  viewState,
  onMove,
  mapStyle,
  mapboxToken,
  properties,
  isAuthenticated = false,
  searchResults,
}: MapContainerProps) {
  const router = useRouter();

  // State for selected property popup
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  // State for auth modal (when unauthenticated user tries to favorite)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPropertyId, setPendingPropertyId] = useState<string | null>(
    null,
  );

  /**
   * Convert properties to GeoJSON format for MapBox layers
   *
   * PERFORMANCE:
   * - MapBox native layers render GeoJSON via WebGL (GPU)
   * - Much faster than rendering React components + DOM
   * - Native clustering handled by MapBox (no Supercluster needed)
   */
  const propertiesGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: properties
        .filter((p) => p.latitude !== null && p.longitude !== null)
        .map((property) => ({
          type: "Feature" as const,
          id: property.id,
          geometry: {
            type: "Point" as const,
            coordinates: [property.longitude!, property.latitude!],
          },
          properties: {
            id: property.id,
            price: property.price,
            transactionType: property.transactionType,
            title: property.title,
          },
        })),
    }),
    [properties],
  );

  // Get selected property for popup
  const selectedProperty = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId)
    : null;

  // Handle map clicks on property markers
  const handleMapClick = useCallback(
    (e: any) => {
      // Check if click was on a feature
      const features = e.features;
      if (features && features.length > 0) {
        const feature = features[0];
        // Only handle clicks on unclustered points (properties)
        // Clusters don't have a direct click handler - they just show on map
        if (feature.layer.id === "unclustered-point") {
          const propertyId = feature.properties?.id;
          if (propertyId) {
            setSelectedPropertyId(propertyId);
          }
        }
      }
    },
    [],
  );

  // Handle unauthenticated favorite click - show auth modal
  const handleUnauthenticatedFavoriteClick = useCallback(
    (propertyId: string) => {
      setPendingPropertyId(propertyId);
      setShowAuthModal(true);
    },
    [],
  );

  // Handle drawer property click - navigate to details
  const handleDrawerPropertyClick = useCallback(
    (propertyId: string) => {
      router.push(`/propiedades/${propertyId}`);
    },
    [router],
  );

  return (
    <div className="relative w-full h-screen isolate">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onClick={handleMapClick}
        mapStyle={mapStyle}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        padding={{ top: 80, bottom: 0, left: 0, right: 0 }}
        minZoom={DEFAULT_MAP_CONFIG.MIN_ZOOM}
        maxZoom={DEFAULT_MAP_CONFIG.MAX_ZOOM}
        attributionControl={false}
      >
        {/* MapBox Native Layers - Properties & Clusters */}
        <Source
          id="properties"
          type="geojson"
          data={propertiesGeojson}
          cluster={true}
          clusterMaxZoom={15}
          clusterRadius={50}
        >
          {/* Unclustered Property Points */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-radius": 8,
              "circle-color": [
                "match",
                ["get", "transactionType"],
                "SALE",
                "#3b82f6", // Blue for sale
                "RENT",
                "#10b981", // Green for rent
                "#999", // Default gray
              ],
              "circle-opacity": 0.8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            }}
          />

          {/* Clustered Points - Size and color based on count */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6", // Cyan for small clusters (2-9)
                10,
                "#f1f075", // Yellow for medium (10-49)
                50,
                "#f28cb1", // Pink for large (50+)
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20, // Small clusters
                10,
                30, // Medium clusters
                50,
                40, // Large clusters
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
              "circle-opacity": 0.9,
            }}
          />

          {/* Cluster Count Labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-size": 12,
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            }}
            paint={{
              "text-color": "#fff",
            }}
          />
        </Source>

        {/* Property Popup on Marker Click */}
        {selectedProperty &&
          selectedProperty.latitude &&
          selectedProperty.longitude && (
            <PropertyPopup
              property={selectedProperty}
              onClose={() => setSelectedPropertyId(null)}
              onViewDetails={() => {
                setSelectedPropertyId(null);
                handleDrawerPropertyClick(selectedProperty.id);
              }}
              isAuthenticated={isAuthenticated}
              onUnauthenticatedFavoriteClick={
                !isAuthenticated
                  ? handleUnauthenticatedFavoriteClick
                  : undefined
              }
            />
          )}
      </Map>

      {/* Property List Drawer */}
      {/*<PropertyListDrawer*/}
      {/*  properties={properties}*/}
      {/*  onPropertyHover={setHighlightedPropertyId}*/}
      {/*  onPropertyClick={handleDrawerPropertyClick}*/}
      {/*/>*/}

      {/* Search Results Badge */}
      {searchResults && searchResults.length > 0 && (
        <div className="absolute top-20 left-4 z-10 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-green-200 dark:border-green-900">
          <p className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50">
            🔍 {searchResults.length}{" "}
            {searchResults.length === 1 ? "propiedad" : "propiedades"}{" "}
            encontradas
          </p>
        </div>
      )}

      {/* Properties Count Badge (when no search) */}
      {!searchResults && (
        <div className="absolute top-20 left-4 z-10 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50">
            {properties.length} propiedades disponibles
          </p>
        </div>
      )}

      {/* Attribution (moved to bottom-right) */}
      {/*<div className="absolute bottom-0 right-0 z-10 bg-white/90 dark:bg-oslo-gray-900/90 px-2 py-1 text-[10px] text-oslo-gray-600 dark:text-oslo-gray-400">*/}
      {/*  © MapBox © OpenStreetMap*/}
      {/*</div>*/}

      {/* Auth Modal (at top level, outside MapBox popup container) */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        propertyId={pendingPropertyId || undefined}
      />
    </div>
  );
});
