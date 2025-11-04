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

import { memo, useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { logger } from "@/lib/utils/logger";
import { MAP_COLORS, CLUSTER_CONFIG } from "@/lib/types/map";
import type { MapProperty } from "../map-view";

interface MapLayersProps {
  properties: MapProperty[];
}

/**
 * MEMOIZED: Only re-renders when properties[] changes
 * Not re-renders when parent viewState/theme changes
 */
export const MapLayers = memo(function MapLayers({
  properties,
}: MapLayersProps) {
  logger.debug("🗺️ MapLayers render:", {
    propertyCount: properties.length,
    firstPropertyTitle: properties[0]?.title,
    firstPropertyCoords: properties[0] ? `(${properties[0].latitude}, ${properties[0].longitude})` : "N/A",
    allPropertiesHaveCoords: properties.every(p => p.latitude && p.longitude),
  });

  /**
   * Convert properties to GeoJSON format
   * Expensive operation - memoized
   */
  const propertiesGeojson = useMemo(() => {
    const geojson = {
      type: "FeatureCollection" as const,
      features: properties
        .filter((p) => p.latitude !== null && p.longitude !== null && p.id)
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
    };

    return geojson;
  }, [properties]);


  return (
    <Source
      id="properties"
      type="geojson"
      data={propertiesGeojson}
      cluster={true}
      clusterMaxZoom={CLUSTER_CONFIG.MAX_ZOOM}
      clusterRadius={CLUSTER_CONFIG.RADIUS}
    >
      {/* Unclustered Property Points */}
      <Layer
        id="unclustered-point"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          // Zoom-based scaling + hover effect
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 8,      // hover zoom 10 = 8px
              15, 12,     // hover zoom 15 = 12px
              18, 16,     // hover zoom 18 = 16px
            ],
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 6,      // normal zoom 10 = 6px
              15, 10,     // normal zoom 15 = 10px
              18, 14,     // normal zoom 18 = 14px
            ],
          ],
          "circle-color": [
            "match",
            ["get", "transactionType"],
            "SALE",
            MAP_COLORS.MARKERS.SALE,
            "RENT",
            MAP_COLORS.MARKERS.RENT,
            "#999", // Default gray
          ],
          "circle-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,        // hover: fully opaque
            0.9,        // normal: slightly transparent
          ],
          "circle-blur": 0.15, // Glow effect
          "circle-stroke-width": 3,
          "circle-stroke-color": MAP_COLORS.EFFECTS.STROKE,
          "circle-stroke-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,        // hover: full opacity stroke
            0.6,        // normal: semi-transparent stroke
          ],
        }}
      />

      {/* Clustered Points - Size and color based on count (Oslo Gray palette) */}
      <Layer
        id="clusters"
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          // Oslo Gray color tiers based on property count
          "circle-color": [
            "step",
            ["get", "point_count"],
            MAP_COLORS.CLUSTERS.SMALL,   // 2-9 properties
            10,
            MAP_COLORS.CLUSTERS.MEDIUM,  // 10-49 properties
            50,
            MAP_COLORS.CLUSTERS.LARGE,   // 50+ properties
          ],
          // Zoom-based scaling + hover effect
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            [
              // Hover sizes (larger)
              "step",
              ["get", "point_count"],
              26, // Small clusters hover
              10,
              36, // Medium clusters hover
              50,
              46, // Large clusters hover
            ],
            [
              // Normal sizes with zoom scaling
              "step",
              ["get", "point_count"],
              [
                "interpolate", ["linear"], ["zoom"],
                10, 16, 15, 22, 18, 28
              ], // Small clusters
              10,
              [
                "interpolate", ["linear"], ["zoom"],
                10, 22, 15, 30, 18, 38
              ], // Medium clusters
              50,
              [
                "interpolate", ["linear"], ["zoom"],
                10, 28, 15, 38, 18, 46
              ], // Large clusters
            ],
          ],
          "circle-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,        // hover: fully opaque
            0.85,       // normal: semi-transparent
          ],
          "circle-blur": 0.2, // Glow effect (slightly more than markers)
          "circle-stroke-width": 3,
          "circle-stroke-color": MAP_COLORS.EFFECTS.STROKE,
          "circle-stroke-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,        // hover: full opacity stroke
            0.5,        // normal: semi-transparent stroke
          ],
        }}
      />

      {/* Cluster Count Labels - Scaled by cluster tier */}
      <Layer
        id="cluster-count"
        type="symbol"
        filter={["has", "point_count"]}
        layout={{
          "text-field": "{point_count_abbreviated}",
          // Scale text size based on cluster tier
          "text-size": [
            "step",
            ["get", "point_count"],
            12, // Small clusters: 12px
            10,
            14, // Medium clusters: 14px
            50,
            16, // Large clusters: 16px
          ],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-offset": [0, 0],
          "text-anchor": "center",
        }}
        paint={{
          "text-color": "#fff",
          // Text halo for better readability against any background
          "text-halo-color": "rgba(0, 0, 0, 0.7)",
          "text-halo-width": 1.5,
          // Opacity follows cluster hover state
          "text-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,        // hover: fully visible
            0.95,       // normal: slightly transparent
          ],
        }}
      />
    </Source>
  );
});

MapLayers.displayName = "MapLayers";
