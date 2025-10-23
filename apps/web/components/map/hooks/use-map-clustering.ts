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
   */
  const clusters = useMemo(() => {
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

    const bounds: [number, number, number, number] = [
      viewState.longitude - longitudeDelta, // west
      viewState.latitude - latitudeDelta, // south
      viewState.longitude + longitudeDelta, // east
      viewState.latitude + latitudeDelta, // north
    ];

    /**
     * Get clusters for current bounds and zoom level
     * Returns array of cluster features and individual points
     */
    return supercluster.getClusters(bounds, Math.floor(viewState.zoom));
  }, [supercluster, viewState.longitude, viewState.latitude, viewState.zoom]);

  return clusters;
}

/**
 * Type guard to check if cluster is a cluster (vs individual point)
 */
export function isCluster(
  cluster: ClusterOrPoint,
): cluster is ClusterPoint {
  return "cluster" in cluster.properties && cluster.properties.cluster === true;
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
