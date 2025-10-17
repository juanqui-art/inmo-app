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
