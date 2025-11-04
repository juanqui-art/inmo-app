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
          // Zoom-based scaling with hover size adjustment
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              8,  // hover: 8px at zoom 10
              6,  // normal: 6px at zoom 10
            ],
            15,
            [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              12, // hover: 12px at zoom 15
              10, // normal: 10px at zoom 15
            ],
            18,
            [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              16, // hover: 16px at zoom 18
              14, // normal: 14px at zoom 18
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
          "circle-blur": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.25,  // hover: more glow
            0.15,  // normal: subtle glow
          ],
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
          // Zoom-based scaling with hover size adjustment
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            [
              "step",
              ["get", "point_count"],
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                20, // small hover
                16, // small normal
              ],
              10,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                26, // medium hover
                22, // medium normal
              ],
              50,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                32, // large hover
                28, // large normal
              ],
            ],
            15,
            [
              "step",
              ["get", "point_count"],
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                26, // small hover
                22, // small normal
              ],
              10,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                34, // medium hover
                30, // medium normal
              ],
              50,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                42, // large hover
                38, // large normal
              ],
            ],
            18,
            [
              "step",
              ["get", "point_count"],
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                32, // small hover
                28, // small normal
              ],
              10,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                42, // medium hover
                38, // medium normal
              ],
              50,
              [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                50, // large hover
                46, // large normal
              ],
            ],
          ],
          "circle-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.0,        // hover: fully opaque
            0.85,       // normal: semi-transparent
          ],
          "circle-blur": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.3,  // hover: more glow
            0.2,  // normal: subtle glow
          ],
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
