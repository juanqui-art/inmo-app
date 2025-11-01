/**
 * MapLayers - Isolated MapBox Native Layers
 *
 * RESPONSIBILITY:
 * - Source (GeoJSON data)
 * - Layer: unclustered-point (individual properties)
 * - Layer: clusters (grouped properties)
 * - Layer: cluster-count (count labels)
 *
 * OPTIMIZATION:
 * - Memoized with React.memo()
 * - Only re-renders when properties[] changes
 * - Does NOT trigger parent MapContainer re-renders
 * - Prevents Layer reconfiguration on unrelated updates
 *
 * PROPS:
 * - properties: MapProperty[] - Data to display
 * - onPropertyClick: (propertyId: string) => void - Click handler
 */

"use client";

import { memo, useMemo, useEffect } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import type { MapProperty } from "../map-view";
import type { MapRef } from "react-map-gl/mapbox";

interface MapLayersProps {
  properties: MapProperty[];
  onPropertyClick?: (propertyId: string) => void;
  mapRef?: React.RefObject<MapRef | null>;
}

/**
 * MEMOIZED: Only re-renders when properties[] changes
 * Not re-renders when parent viewState/theme changes
 */
export const MapLayers = memo(
  function MapLayers({
    properties,
    onPropertyClick,
    mapRef,
  }: MapLayersProps) {
  /**
   * Convert properties to GeoJSON format
   * Expensive operation - memoized
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

  /**
   * Attach click event listeners to property markers
   * Uses MapBox native event system for better performance
   */
  useEffect(() => {
    if (!mapRef?.current || !onPropertyClick) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    const handleLayerClick = (e: any) => {
      if (e.features && e.features.length > 0) {
        const propertyId = e.features[0].id as string | undefined;
        if (propertyId) {
          onPropertyClick(propertyId);
        }
      }
    };

    // Attach click listener to unclustered points
    map.on("click", "unclustered-point", handleLayerClick);

    return () => {
      map.off("click", "unclustered-point", handleLayerClick);
    };
  }, [onPropertyClick, mapRef]);

  return (
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
  );
});

MapLayers.displayName = "MapLayers";
