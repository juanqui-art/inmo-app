/**
 * MapContainer - MapBox GL Wrapper Component
 *
 * Handles rendering of the MapBox GL map with:
 * - Map configuration and controls
 * - Property markers
 * - Navigation controls
 * - Scale control
 * - Property list drawer
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
 * - Render MapBox GL component
 * - Render map controls (navigation, scale)
 * - Render property markers
 * - Render property list drawer
 */

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Map, {
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { AuthModal } from "@/components/auth/auth-modal";
import { CLUSTER_CONFIG, DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import { ClusterMarker } from "../cluster-marker";
import {
  isCluster,
  type PropertyPoint,
  useMapClustering,
} from "../hooks/use-map-clustering";
import type { MapProperty } from "../map-view";
import { PropertyMarker } from "../property-marker";
import { PropertyPopup } from "../property-popup";

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

export function MapContainer({
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

  // Get clusters for current viewport
  const clusters = useMapClustering({
    properties,
    viewState,
    mapRef,
  });

  // Get selected property for popup
  const selectedProperty = selectedPropertyId
    ? properties.find((p) => p.id === selectedPropertyId)
    : null;

  // Handle marker click - show popup
  const handleMarkerClick = useCallback((property: MapProperty) => {
    setSelectedPropertyId(property.id);
  }, []);

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

  // Handle cluster click - zoom in to expand
  const handleClusterClick = useCallback(
    (longitude: number, latitude: number, expansionZoom: number) => {
      // Create proper ViewState event
      const mockEvent: ViewStateChangeEvent = {
        viewState: {
          longitude,
          latitude,
          zoom: expansionZoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
          padding: { top: 0, bottom: 0, left: 0, right: 0 },
        },
        type: "move",
        target: {} as any,
      };
      onMove(mockEvent);
    },
    [onMove, viewState],
  );

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
        // reuseMaps
      >
        {/* Navigation Controls (Zoom +/-) */}
        {/*<NavigationControl*/}
        {/*	position="bottom-right"*/}
        {/*	showCompass={true}*/}
        {/*	showZoom={true}*/}
        {/*	visualizePitch={true}*/}
        {/*/>*/}

        {/* Scale Control (Distance) */}
        {/*<ScaleControl position="bottom-left" unit="metric" />*/}

        {/* Property Markers & Clusters */}
        {clusters.map((cluster) => {
          // Extract coordinates (with type safety)
          const [longitude, latitude] = cluster.geometry.coordinates as [
            number,
            number,
          ];

          // Render cluster marker
          if (isCluster(cluster)) {
            const { point_count: pointCount } = cluster.properties;

            return (
              <ClusterMarker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
                pointCount={pointCount}
                onClick={() => {
                  // Zoom in using configured zoom increment
                  const expansionZoom = Math.min(
                    viewState.zoom + CLUSTER_CONFIG.ZOOM_INCREMENT,
                    CLUSTER_CONFIG.MAX_ZOOM,
                  );
                  handleClusterClick(longitude, latitude, expansionZoom);
                }}
              />
            );
          }

          // Render individual property marker
          const property = (cluster as PropertyPoint).properties;
          return (
            <PropertyMarker
              key={property.id}
              latitude={latitude}
              longitude={longitude}
              price={property.price}
              transactionType={property.transactionType}
              onClick={() => handleMarkerClick(property)}
            />
          );
        })}

        {/* Property Popup on Marker Click */}
        {selectedProperty?.latitude && selectedProperty.longitude && (
          <PropertyPopup
            property={selectedProperty}
            onClose={() => setSelectedPropertyId(null)}
            onViewDetails={() => {
              setSelectedPropertyId(null);
              handleDrawerPropertyClick(selectedProperty.id);
            }}
            onUnauthenticatedFavoriteClick={
              !isAuthenticated ? handleUnauthenticatedFavoriteClick : undefined
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
}
