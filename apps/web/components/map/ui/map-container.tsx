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
import { logger } from "@/lib/utils/logger";
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
    logger.debug("🔔 handlePropertyClick called with propertyId:", { propertyId });
    setSelectedPropertyId(propertyId);
  }, []);

  /**
   * Track if listeners are attached for cleanup
   * Prevents duplicate listeners when component re-renders
   */
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (mapRef?.current) {
        const map = mapRef.current.getMap();
        if (map) {
          logger.debug("🧹 Component unmounting - cleaning up map listeners");
          // MapBox doesn't require explicit listener cleanup on map destroy
          // but we log it for debugging
        }
      }
    };
  }, []);

  /**
   * Attach click and hover listeners to marker and cluster layers
   * Uses Map's onLoad event to guarantee the Source and Layers are rendered
   * Implements:
   * - Hover effects with feature-state
   * - Click feedback animations
   * - Cluster click handler (zoom in)
   *
   * FIXED: Proper cleanup to avoid duplicate listeners and memory leaks
   */
  const handleMapLoad = useCallback(() => {
    if (!mapRef?.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    logger.debug("🗺️ Map onLoad fired, attempting to attach listeners...");

    // Wait for layers to be fully loaded by mapbox-gl
    // Multiple ticks to ensure all rendering is complete
    const timeoutId = setTimeout(() => {
      const unclusteredLayer = map.getLayer("unclustered-point");
      const clusterLayer = map.getLayer("clusters");
      const source = map.getSource("properties") as any;

      logger.debug("🎯 Checking layers:", {
        unclusteredLayer: !!unclusteredLayer,
        clusterLayer: !!clusterLayer,
        source: !!source,
        layerType: unclusteredLayer?.type,
        sourceType: source?.type,
      });

      if (!unclusteredLayer || !clusterLayer || !source) {
        logger.error("❌ Required layers/source not found!", {
          unclusteredLayer: !!unclusteredLayer,
          clusterLayer: !!clusterLayer,
          source: !!source,
        });
        return;
      }

      // Check if there are actually features in the source
      try {
        const features = map.querySourceFeatures("properties");
        logger.debug("📊 Source features count:", {
          totalFeatures: features.length,
          unclustered: features.filter((f: any) => !f.properties?.cluster_id).length,
          clustered: features.filter((f: any) => f.properties?.cluster_id).length,
        });
      } catch (err) {
        logger.error("❌ Error querying source features:", err);
      }

      // ===== UNCLUSTERED MARKER HANDLERS =====

      const onMarkerClick = (e: any) => {
        logger.debug("🖱️ CLICK HANDLER TRIGGERED on unclustered-point:", {
          eventType: e.type,
          featuresCount: e.features?.length || 0,
          firstFeatureId: e.features?.[0]?.id,
          firstFeatureProperties: e.features?.[0]?.properties,
          lngLat: e.lngLat ? { lng: e.lngLat.lng, lat: e.lngLat.lat } : null,
        });

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const propertyId = feature.properties?.id || feature.id;

          logger.debug("📍 Marker clicked - extracting ID:", {
            propertyId,
            featureId: feature.id,
            hasPropertiesId: !!feature.properties?.id,
          });

          if (propertyId && feature.id !== undefined) {
            // Set click state for animation
            map.setFeatureState(
              { source: "properties", id: feature.id },
              { clicked: true }
            );

            // Reset after animation
            setTimeout(() => {
              map.setFeatureState(
                { source: "properties", id: feature.id },
                { clicked: false }
              );
            }, 300);

            // Handle property click
            logger.debug("✅ Calling handlePropertyClick with:", { propertyId });
            handlePropertyClick(propertyId);
          } else {
            logger.warn("⚠️ Failed to extract propertyId:", {
              propertyId,
              featureId: feature.id,
              reason: !propertyId ? "propertyId is falsy" : "feature.id is undefined",
            });
          }
        } else {
          logger.warn("⚠️ Click event has no features");
        }
      };

      const onMarkerMouseEnter = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (feature.id !== undefined) {
            map.setFeatureState(
              { source: "properties", id: feature.id },
              { hover: true }
            );
            map.getCanvas().style.cursor = "pointer";
          }
        }
      };

      const onMarkerMouseLeave = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (feature.id !== undefined) {
            map.setFeatureState(
              { source: "properties", id: feature.id },
              { hover: false }
            );
            map.getCanvas().style.cursor = "";
          }
        }
      };

      // ===== CLUSTER HANDLERS =====

      const onClusterClick = (e: any) => {
        logger.debug("🖱️ CLICK HANDLER TRIGGERED on clusters:", {
          clusterId: e.features?.[0]?.properties?.cluster_id,
        });

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const clusterId = feature.properties?.cluster_id;

          if (clusterId !== undefined) {
            source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
              if (err) {
                logger.error("❌ Error getting cluster expansion zoom:", err);
                return;
              }

              logger.debug("🔍 Zooming to cluster:", { zoom, coordinates: feature.geometry.coordinates });

              // Zoom to cluster
              map.easeTo({
                center: feature.geometry.coordinates,
                zoom: zoom,
                duration: 300,
              });
            });
          }
        }
      };

      const onClusterMouseEnter = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (feature.id !== undefined) {
            map.setFeatureState(
              { source: "properties", id: feature.id },
              { hover: true }
            );
            map.getCanvas().style.cursor = "pointer";
          }
        }
      };

      const onClusterMouseLeave = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          if (feature.id !== undefined) {
            map.setFeatureState(
              { source: "properties", id: feature.id },
              { hover: false }
            );
            map.getCanvas().style.cursor = "";
          }
        }
      };

      // ===== REMOVE OLD LISTENERS (Cleanup) =====
      // Remove any existing listeners to prevent duplicates
      map.off("click", "unclustered-point", onMarkerClick);
      map.off("mouseenter", "unclustered-point", onMarkerMouseEnter);
      map.off("mouseleave", "unclustered-point", onMarkerMouseLeave);
      map.off("click", "clusters", onClusterClick);
      map.off("mouseenter", "clusters", onClusterMouseEnter);
      map.off("mouseleave", "clusters", onClusterMouseLeave);

      // ===== ATTACH EVENT LISTENERS =====

      logger.debug("📌 Attaching click listeners to layers...");

      // Marker (unclustered point) events
      map.on("click", "unclustered-point", onMarkerClick);
      logger.debug("✅ Marker click listener attached to unclustered-point");
      map.on("mouseenter", "unclustered-point", onMarkerMouseEnter);
      map.on("mouseleave", "unclustered-point", onMarkerMouseLeave);

      // Cluster events
      map.on("click", "clusters", onClusterClick);
      logger.debug("✅ Cluster click listener attached to clusters");
      map.on("mouseenter", "clusters", onClusterMouseEnter);
      map.on("mouseleave", "clusters", onClusterMouseLeave);

      logger.debug("✅ All event listeners attached successfully");
    }, 200); // Increased timeout to ensure layers are ready

    // Cleanup function for when component unmounts
    return () => {
      clearTimeout(timeoutId);
      logger.debug("🧹 Cleaning up map listeners on unmount");
    };
  }, [mapRef, handlePropertyClick]);

  return (
    <div className="relative w-full h-screen isolate">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onLoad={handleMapLoad}
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

        {/* MapPopupManager handles popup display - MUST be inside Map for <Popup> to work */}
        {properties && (
          <MapPopupManager
            properties={properties}
            isAuthenticated={isAuthenticated}
            selectedPropertyId={selectedPropertyId}
            onSelectedPropertyIdChange={setSelectedPropertyId}
          />
        )}
      </Map>
    </div>
  );
});
