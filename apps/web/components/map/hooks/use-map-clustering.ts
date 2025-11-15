/**
 * useMapClustering - Smart Marker Clustering Hook
 *
 * PATTERN: Custom hook for Supercluster integration
 *
 * FEATURES:
 * - Clusters nearby markers automatically
 * - Recalculates on viewport change (zoom/pan)
 * - Memoized for performance
 * - Returns both clusters and individual points
 *
 * CONFIGURATION:
 * - radius: 40px (distance to cluster)
 * - maxZoom: 16 (stop clustering at high zoom)
 * - minPoints: 2 (minimum to form cluster)
 *
 * PERFORMANCE:
 * - O(log n) lookup with spatial index
 * - Handles 1000+ markers efficiently
 * - Only recalculates when viewport changes
 *
 * USAGE:
 * const clusters = useMapClustering({
 *   properties,
 *   viewState
 * });
 */

import { useMemo } from "react";
import type { MapRef } from "react-map-gl/mapbox";
import Supercluster from "supercluster";
import { CLUSTER_CONFIG } from "@/lib/types/map";
import type { MapProperty } from "../map-view";

interface UseMapClusteringProps {
  /** Properties to cluster */
  properties: MapProperty[];
  /** Current viewport state */
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  /** Reference to MapBox map instance */
  mapRef?: React.RefObject<MapRef | null>;
}

/**
 * Supercluster point type with our property data
 */
export type ClusterPoint = Supercluster.ClusterFeature<Supercluster.AnyProps>;
export type PropertyPoint = Supercluster.PointFeature<MapProperty>;

/**
 * Union type for clusters and individual points
 */
export type ClusterOrPoint = ClusterPoint | PropertyPoint;

/**
 * Supercluster configuration from constants
 */
const SUPERCLUSTER_OPTIONS = {
  radius: CLUSTER_CONFIG.RADIUS,
  maxZoom: CLUSTER_CONFIG.MAX_ZOOM,
  minZoom: CLUSTER_CONFIG.MIN_ZOOM,
  minPoints: CLUSTER_CONFIG.MIN_POINTS,
};

/**
 * Custom hook for map clustering
 */
export function useMapClustering({
  properties,
  viewState,
  mapRef,
}: UseMapClusteringProps): ClusterOrPoint[] {
  /**
   * Initialize Supercluster with configuration
   * Only recreates when properties array changes
   */
  const supercluster = useMemo(() => {
    const cluster = new Supercluster<MapProperty, Supercluster.AnyProps>(
      SUPERCLUSTER_OPTIONS,
    );

    /**
     * Convert properties to GeoJSON points
     * Filter out properties without coordinates
     */
    const points: Supercluster.PointFeature<MapProperty>[] = properties
      .filter((p) => p.latitude !== null && p.longitude !== null)
      .map((property) => ({
        type: "Feature" as const,
        properties: property,
        geometry: {
          type: "Point" as const,
          coordinates: [property.longitude!, property.latitude!],
        },
      }));

    // Load points into cluster
    cluster.load(points);

    return cluster;
  }, [properties]);

  /**
   * Calculate clusters for current viewport
   * Recalculates when viewport changes (zoom/pan)
   *
   * WHY use map.getBounds()?
   * - MapBox calculates REAL bounds considering navbar/padding
   * - Previous approach used symmetric calculation (viewportToBounds pattern)
   * - Symmetric bounds don't account for fixed header at top
   * - Result: properties in upper area weren't included in clustering
   *
   * SOLUTION:
   * - Use map.getBounds() which returns actual visible bounds
   * - Accounts for padding and any fixed header
   * - Supercluster gets correct bounds for filtering
   * - Fallback to symmetric calculation when map not ready
   */
  const clusters = useMemo(() => {
    let bounds: [number, number, number, number];

    // Try to use map.getBounds() if available
    if (mapRef?.current) {
      try {
        const mapBounds = mapRef.current.getBounds();
        if (mapBounds) {
          const ne = mapBounds.getNorthEast();
          const sw = mapBounds.getSouthWest();

          // MapBox bounds format: [west, south, east, north]
          bounds = [sw.lng, sw.lat, ne.lng, ne.lat];
        } else {
          // Fallback if getBounds() returns null
          bounds = calculateFallbackBounds(viewState);
        }
      } catch (error) {
        console.warn("Failed to get bounds from map, using fallback", error);
        bounds = calculateFallbackBounds(viewState);
      }
    } else {
      // Fallback when map not ready (initial render)
      bounds = calculateFallbackBounds(viewState);
    }

    /**
     * Get clusters for current bounds and zoom level
     * Returns array of cluster features and individual points
     */
    return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
  }, [supercluster, viewState, mapRef]);

  return clusters;
}

/**
 * Helper function to calculate bounds when map.getBounds() is not available
 * Uses symmetric calculation from viewport center
 */
function calculateFallbackBounds(viewState: {
  longitude: number;
  latitude: number;
  zoom: number;
}): [number, number, number, number] {
  /**
   * Calculate map bounds dynamically from viewport and zoom level
   * MapBox uses [west, south, east, north] format
   *
   * FORMULA: Area = 360 / 2^zoom degrees
   * This ensures we capture all visible markers regardless of zoom level
   *
   * EXAMPLES:
   * - Zoom 3: ±22.5° (continent view)
   * - Zoom 7: ±1.4° (province view)
   * - Zoom 12: ±0.044° (city view)
   * - Zoom 16: ±0.0027° (neighborhood view)
   *
   * We add 20% padding to ensure markers at edges are included
   */
  const latitudeDelta = (180 / Math.pow(2, viewState.zoom)) * 1.2;
  const longitudeDelta = (360 / Math.pow(2, viewState.zoom)) * 1.2;

  return [
    viewState.longitude - longitudeDelta, // west
    viewState.latitude - latitudeDelta, // south
    viewState.longitude + longitudeDelta, // east
    viewState.latitude + latitudeDelta, // north
  ];
}

/**
 * Type guard to check if cluster is a cluster (vs individual point)
 */
export function isCluster(cluster: ClusterOrPoint): cluster is ClusterPoint {
  return "cluster" in cluster.properties && cluster.properties.cluster;
}

/**
 * Get cluster expansion zoom level
 * Used to zoom in when cluster is clicked
 */
export function getClusterExpansionZoom(
  supercluster: Supercluster,
  clusterId: number,
): number {
  try {
    return supercluster.getClusterExpansionZoom(clusterId);
  } catch {
    return 16; // Fallback to max zoom
  }
}

/**
 * Get children points of a cluster
 * Useful for showing cluster details
 */
export function getClusterLeaves(
  supercluster: Supercluster,
  clusterId: number,
  limit = 10,
  offset = 0,
): Supercluster.PointFeature<Supercluster.AnyProps>[] {
  try {
    return supercluster.getLeaves(clusterId, limit, offset);
  } catch {
    return [];
  }
}
