/**
 * MAP TYPES
 *
 * Type definitions for MapBox integration
 */

import type { TransactionType, PropertyCategory } from "@repo/database";

/**
 * Map viewport configuration
 * Controls camera position and orientation
 */
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch?: number; // 0-60 degrees (0 = top-down, 60 = perspective)
  bearing?: number; // 0-360 degrees (map rotation)
}

/**
 * Property marker data
 * Minimal data needed to render a marker on the map
 */
export interface PropertyMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
  transactionType: TransactionType;
  category: PropertyCategory;
  title: string;
  imageUrl?: string;
}

/**
 * Map filters
 * User-selected filters for property search
 */
export interface MapFilters {
  transactionType?: TransactionType[];
  category?: PropertyCategory[];
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  search?: string;
}

/**
 * Map bounds
 * Geographic bounding box
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Default map configuration for Ecuador
 */
export const DEFAULT_MAP_CONFIG = {
  // Cuenca, Ecuador (center of Azuay)
  AZUAY_CENTER: {
    latitude: -2.9001,
    longitude: -79.0058,
  },
  // Quito, Ecuador (fallback)
  ECUADOR_CENTER: {
    latitude: -0.1807,
    longitude: -78.4678,
  },
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 3,
  MAX_ZOOM: 20,
  DEFAULT_PITCH: 0,
  DEFAULT_BEARING: 0,
} as const;

/**
 * MapBox style URLs
 */
export const MAPBOX_STYLES = {
  LIGHT: "mapbox://styles/mapbox/light-v11",
  DARK: "mapbox://styles/mapbox/dark-v11",
  STREETS: "mapbox://styles/mapbox/streets-v12",
  SATELLITE: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

/**
 * Clustering configuration
 * Controls marker clustering behavior
 */
export const CLUSTER_CONFIG = {
  /** Cluster radius in pixels */
  RADIUS: 40,
  /** Max zoom to cluster points (16 = stop clustering at zoom 16) */
  MAX_ZOOM: 16,
  /** Min zoom for clustering */
  MIN_ZOOM: 0,
  /** Min points to form cluster */
  MIN_POINTS: 2,
  /** Zoom increment when clicking cluster */
  ZOOM_INCREMENT: 2,
} as const;

/**
 * Cluster size thresholds
 * Defines visual appearance based on point count
 */
export const CLUSTER_SIZE_THRESHOLDS = {
  SMALL: {
    maxPoints: 5,
    size: 32,
    colorClass: "bg-blue-400",
    textSize: "text-xs",
    ringClass: "ring-blue-400/30",
  },
  MEDIUM: {
    maxPoints: 10,
    size: 40,
    colorClass: "bg-blue-500",
    textSize: "text-sm",
    ringClass: "ring-blue-500/30",
  },
  LARGE: {
    maxPoints: 25,
    size: 48,
    colorClass: "bg-blue-600",
    textSize: "text-base",
    ringClass: "ring-blue-600/30",
  },
  XLARGE: {
    maxPoints: Number.POSITIVE_INFINITY,
    size: 56,
    colorClass: "bg-blue-700",
    textSize: "text-lg",
    ringClass: "ring-blue-700/30",
  },
} as const;
