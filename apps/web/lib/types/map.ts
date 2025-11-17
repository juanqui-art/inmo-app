/**
 * MAP TYPES
 *
 * Type definitions for MapBox integration
 */

import type { PropertyCategory, TransactionType } from "@repo/database";

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
 * Property marker variant
 * Visual style for property markers
 */
export type PropertyMarkerVariant = "dark" | "light" | "minimal";

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
  /** Marker visual variant (default: "dark") */
  markerVariant?: PropertyMarkerVariant;
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
 * Default map configuration - Technical Mapbox constraints only
 *
 * NOTE: Geographic fallbacks (center, zoom) are defined locally in components
 * that need them (e.g., mapa/page.tsx) to avoid redundancy.
 */
export const DEFAULT_MAP_CONFIG = {
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
  RADIUS: 50,
  /** Max zoom to cluster points (15 = stop clustering at zoom 15) */
  MAX_ZOOM: 15,
  /** Min zoom for clustering */
  MIN_ZOOM: 0,
  /** Min points to form cluster */
  MIN_POINTS: 2,
  /** Zoom increment when clicking cluster */
  ZOOM_INCREMENT: 2,
} as const;

/**
 * Marker and Cluster Colors
 * Consistent with InmoApp Oslo Gray brand palette with enhanced contrast
 */
export const MAP_COLORS = {
  // Marker colors by transaction type
  MARKERS: {
    SALE: "#3b82f6", // Blue-500 (Tailwind)
    RENT: "#10b981", // Green-500 (Tailwind)
  },

  // Cluster colors by tier - vibrant palette for visibility on gray maps
  // Visual hierarchy: Green → Blue → Magenta to indicate cluster density
  CLUSTERS: {
    SMALL: "#10b981", // Green-500 (2-9 properties) - fresh, spacious
    MEDIUM: "#3b82f6", // Blue-500 (10-49 properties) - prominent
    LARGE: "#ec4899", // Pink-500 (50+ properties) - high density
  },

  // Supporting colors for effects
  EFFECTS: {
    STROKE: "#FFFFFF", // White for strokes/borders
    SHADOW: "rgba(0, 0, 0, 0.2)", // Shadow effect
    HOVER: "rgba(255, 255, 255, 0.3)", // Hover highlight
  },
} as const;

/**
 * Cluster size thresholds
 * Defines visual appearance based on point count
 *
 * DESIGN: Glassmorphism elegante
 * - Fondo translúcido con blur
 * - Gradientes sutiles
 * - Borde delgado white/40
 * - Sombras multicapa para profundidad
 */
export const CLUSTER_SIZE_THRESHOLDS = {
  SMALL: {
    maxPoints: 5,
    size: 32,
    colorClass: "bg-gradient-to-br from-cyan-400/40 to-indigo-500/30",
    textSize: "text-xs",
    ringClass: "ring-cyan-300/40",
    glassClass: "backdrop-blur-lg border border-white/40",
    shadowClass: "shadow-lg shadow-cyan-400/20",
  },
  MEDIUM: {
    maxPoints: 10,
    size: 40,
    colorClass: "bg-gradient-to-br from-indigo-400/40 to-indigo-500/30",
    textSize: "text-sm",
    ringClass: "ring-indigo-300/40",
    glassClass: "backdrop-blur-lg border border-white/40",
    shadowClass: "shadow-xl shadow-indigo-400/25",
  },
  LARGE: {
    maxPoints: 25,
    size: 48,
    colorClass: "bg-gradient-to-br from-purple-400/40 to-fuchsia-500/30",
    textSize: "text-base",
    ringClass: "ring-purple-300/40",
    glassClass: "backdrop-blur-lg border border-white/40",
    shadowClass: "shadow-xl shadow-purple-400/30",
  },
  XLARGE: {
    maxPoints: Number.POSITIVE_INFINITY,
    size: 56,
    colorClass: "bg-gradient-to-br from-pink-400/40 to-rose-500/30",
    textSize: "text-lg",
    ringClass: "ring-pink-300/40",
    glassClass: "backdrop-blur-lg border border-white/40",
    shadowClass: "shadow-2xl shadow-pink-400/35",
  },
} as const;
