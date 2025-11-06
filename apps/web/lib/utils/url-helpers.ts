/**
 * URL Helpers for Map State Management
 *
 * Utilities for syncing map viewport state with URL query parameters
 * Enables shareable map locations and browser history navigation
 *
 * Uses Mapbox GL JS built-in utilities (LngLat, LngLatBounds) for
 * reliable coordinate handling and validation.
 *
 * USAGE:
 * - buildMapUrl(): Construct URL with viewport params
 * - parseMapParams(): Extract and validate viewport from URL
 * - buildBoundsUrl(): Construct URL with bounds params
 * - parseBoundsParams(): Extract and validate bounds from URL
 */

import mapboxgl from 'mapbox-gl';

/**
 * Map viewport parameters that can be encoded in URL
 */
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

/**
 * Map bounds parameters (geographic bounding box)
 * Follows Zillow/Airbnb pattern for shareable map URLs
 *
 * @example
 * {
 *   ne_lat: -2.85,  // Northeast (top-right)
 *   ne_lng: -78.95,
 *   sw_lat: -2.95,  // Southwest (bottom-left)
 *   sw_lng: -79.05
 * }
 */
export interface MapBounds {
  ne_lat: number; // Northeast latitude (top)
  ne_lng: number; // Northeast longitude (right)
  sw_lat: number; // Southwest latitude (bottom)
  sw_lng: number; // Southwest longitude (left)
}

/**
 * Validation constraints for map coordinates
 */
const CONSTRAINTS = {
  LAT_MIN: -90,
  LAT_MAX: 90,
  LNG_MIN: -180,
  LNG_MAX: 180,
  ZOOM_MIN: 0,
  ZOOM_MAX: 22,
  DECIMAL_PLACES: 4, // Precision: ~11m at equator
} as const;

/**
 * Ecuador geographic bounds
 * Prevents queries outside Ecuador that would be slow/invalid
 *
 * Why important?
 * - Server only has properties data for Ecuador
 * - If user pans outside Ecuador, bounds validation fails
 * - Causes MapPage re-renders with invalid data
 * - This was the ROOT CAUSE of 286ms "other time" slowdown
 *
 * Bounds coverage:
 * - Latitudes: -5.0 to 1.4 (north-south extent)
 * - Longitudes: -81.2 to -75.2 (east-west extent)
 */
const ECUADOR_BOUNDS = {
  minLat: -5.0,
  maxLat: 1.4,
  minLng: -81.2,
  maxLng: -75.2,
} as const;

/**
 * Ecuador bounds as Mapbox LngLatBounds for validation
 * Used in isInEcuadorMapbox() and other coordinate validation functions
 */
const ECUADOR_BOUNDS_MAPBOX = new mapboxgl.LngLatBounds(
  [ECUADOR_BOUNDS.minLng, ECUADOR_BOUNDS.minLat], // SW
  [ECUADOR_BOUNDS.maxLng, ECUADOR_BOUNDS.maxLat], // NE
);

/**
 * Clamp bounds to Ecuador geographic region using Mapbox GL JS
 *
 * PERFORMANCE FIX:
 * - User can pan/zoom mapa beyond Ecuador boundaries
 * - When bounds go outside Ecuador, buildBoundsUrl updates URL with invalid coords
 * - MapPage re-renders on server with invalid bounds
 * - Server validation fails (warning message)
 * - This causes unnecessary re-renders = 286ms slowdown
 *
 * SOLUTION:
 * - Clamp bounds BEFORE updating URL using Mapbox native utilities
 * - Prevents invalid server queries
 * - Stops the re-render loop
 * - Uses Mapbox LngLatBounds for robust edge case handling
 *
 * @param bounds - Map bounds to clamp
 * @returns Clamped bounds within Ecuador range
 *
 * @example
 * clampBoundsToEcuador({
 *   ne_lat: 2.0,  // Outside Ecuador (>1.4)
 *   ne_lng: -74.5,
 *   sw_lat: -6.0, // Outside Ecuador (<-5.0)
 *   sw_lng: -80.0
 * })
 * // Returns: {
 * //   ne_lat: 1.4,   (clamped max)
 * //   ne_lng: -74.5,
 * //   sw_lat: -5.0,  (clamped min)
 * //   sw_lng: -80.0
 * // }
 */
function clampBoundsToEcuador(bounds: MapBounds): MapBounds {
  // Convert to Mapbox format for validation
  const boundsMapbox = new mapboxgl.LngLatBounds(
    [bounds.sw_lng, bounds.sw_lat],
    [bounds.ne_lng, bounds.ne_lat],
  );

  // Get intersection with Ecuador bounds
  const sw = boundsMapbox.getSouthWest();
  const ne = boundsMapbox.getNorthEast();

  // Clamp coordinates to Ecuador
  const clampedSwLat = Math.max(sw.lat, ECUADOR_BOUNDS.minLat);
  const clampedSwLng = Math.max(sw.lng, ECUADOR_BOUNDS.minLng);
  const clampedNeLat = Math.min(ne.lat, ECUADOR_BOUNDS.maxLat);
  const clampedNeLng = Math.min(ne.lng, ECUADOR_BOUNDS.maxLng);

  return {
    sw_lat: clampedSwLat,
    sw_lng: clampedSwLng,
    ne_lat: clampedNeLat,
    ne_lng: clampedNeLng,
  };
}

/**
 * Build map URL with viewport query parameters
 *
 * @param viewport - Current map viewport (lat, lng, zoom)
 * @returns URL string with query params (e.g., "/mapa?lat=-2.90&lng=-79.00&zoom=12")
 *
 * @example
 * buildMapUrl({ latitude: -2.8995, longitude: -79.0044, zoom: 12 })
 * // Returns: "/mapa?lat=-2.90&lng=-79.00&zoom=12"
 */
export function buildMapUrl(viewport: MapViewport): string {
  const params = new URLSearchParams();

  // Round to reduce URL clutter (4 decimals = ~11m precision)
  params.set("lat", viewport.latitude.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("lng", viewport.longitude.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("zoom", Math.round(viewport.zoom).toString());

  return `/mapa?${params.toString()}`;
}

/**
 * Parse and validate map viewport from URL search params
 *
 * @param searchParams - URL search params object
 * @param fallback - Default viewport if params are invalid/missing
 * @returns Validated viewport or fallback
 *
 * @example
 * const params = new URLSearchParams("lat=-2.90&lng=-79.00&zoom=12")
 * parseMapParams(params, defaultViewport)
 * // Returns: { latitude: -2.90, longitude: -79.00, zoom: 12 }
 */
export function parseMapParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  fallback: MapViewport,
): MapViewport {
  try {
    // Extract params (handle both URLSearchParams and plain object)
    const lat =
      searchParams instanceof URLSearchParams
        ? searchParams.get("lat")
        : searchParams.lat;
    const lng =
      searchParams instanceof URLSearchParams
        ? searchParams.get("lng")
        : searchParams.lng;
    const zoom =
      searchParams instanceof URLSearchParams
        ? searchParams.get("zoom")
        : searchParams.zoom;

    // Parse to numbers
    const latitude = Number(lat);
    const longitude = Number(lng);
    const zoomLevel = Number(zoom);

    // Validate all params exist and are valid numbers
    if (
      !lat ||
      !lng ||
      !zoom ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      Number.isNaN(zoomLevel)
    ) {
      return fallback;
    }

    // Validate ranges
    if (
      latitude < CONSTRAINTS.LAT_MIN ||
      latitude > CONSTRAINTS.LAT_MAX ||
      longitude < CONSTRAINTS.LNG_MIN ||
      longitude > CONSTRAINTS.LNG_MAX ||
      zoomLevel < CONSTRAINTS.ZOOM_MIN ||
      zoomLevel > CONSTRAINTS.ZOOM_MAX
    ) {
      return fallback;
    }

    // All valid
    return { latitude, longitude, zoom: zoomLevel };
  } catch {
    // Any parsing error → fallback
    return fallback;
  }
}

/**
 * Check if viewport params exist in URL
 *
 * @param searchParams - URL search params
 * @returns true if lat, lng, and zoom are present
 */
export function hasMapParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): boolean {
  const lat =
    searchParams instanceof URLSearchParams
      ? searchParams.get("lat")
      : searchParams.lat;
  const lng =
    searchParams instanceof URLSearchParams
      ? searchParams.get("lng")
      : searchParams.lng;
  const zoom =
    searchParams instanceof URLSearchParams
      ? searchParams.get("zoom")
      : searchParams.zoom;

  return Boolean(lat && lng && zoom);
}

/**
 * Check if bounds params exist in URL (Zillow/Airbnb pattern)
 *
 * @param searchParams - URL search params
 * @returns true if all 4 bounds params are present
 */
export function hasBoundsParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): boolean {
  const ne_lat =
    searchParams instanceof URLSearchParams
      ? searchParams.get("ne_lat")
      : searchParams.ne_lat;
  const ne_lng =
    searchParams instanceof URLSearchParams
      ? searchParams.get("ne_lng")
      : searchParams.ne_lng;
  const sw_lat =
    searchParams instanceof URLSearchParams
      ? searchParams.get("sw_lat")
      : searchParams.sw_lat;
  const sw_lng =
    searchParams instanceof URLSearchParams
      ? searchParams.get("sw_lng")
      : searchParams.sw_lng;

  return Boolean(ne_lat && ne_lng && sw_lat && sw_lng);
}

/**
 * Convert viewport (center + zoom) to bounds
 * Uses dynamic delta calculation (same as clustering)
 *
 * @param viewState - Current map viewport
 * @returns Geographic bounds covering visible area
 */
export function viewportToBounds(viewState: {
  latitude: number;
  longitude: number;
  zoom: number;
}): MapBounds {
  // Dynamic delta calculation (matches clustering formula)
  // This ensures bounds match what's actually visible on screen
  const latitudeDelta = (180 / Math.pow(2, viewState.zoom)) * 1.2;
  const longitudeDelta = (360 / Math.pow(2, viewState.zoom)) * 1.2;

  return {
    ne_lat: viewState.latitude + latitudeDelta,
    ne_lng: viewState.longitude + longitudeDelta,
    sw_lat: viewState.latitude - latitudeDelta,
    sw_lng: viewState.longitude - longitudeDelta,
  };
}

/**
 * Convert bounds to viewport (center + zoom)
 * Estimates zoom level from bounds delta
 *
 * @param bounds - Geographic bounding box
 * @returns Map viewport with estimated zoom level
 */
export function boundsToViewport(bounds: MapBounds): MapViewport {
  // Calculate center
  const latitude = (bounds.ne_lat + bounds.sw_lat) / 2;
  const longitude = (bounds.ne_lng + bounds.sw_lng) / 2;

  // Calculate zoom from latitude delta
  // Inverse of: latitudeDelta = (180 / 2^zoom) * 1.2
  const latitudeDelta = Math.abs(bounds.ne_lat - bounds.sw_lat);
  const zoomFloat =
    Math.log2(180 / latitudeDelta) - Math.log2(1.2);
  const zoom = Math.max(0, Math.min(22, Math.round(zoomFloat)));

  return { latitude, longitude, zoom };
}

/**
 * Build map URL with bounds query parameters (Zillow/Airbnb pattern)
 * PRESERVES existing query parameters (e.g., ai_search, filters)
 *
 * @param bounds - Geographic bounding box
 * @param currentParams - Optional current URLSearchParams to preserve
 * @returns URL string with bounds params (e.g., "/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05")
 *
 * @example
 * buildBoundsUrl({
 *   ne_lat: -2.85, ne_lng: -78.95,
 *   sw_lat: -2.95, sw_lng: -79.05
 * })
 * // Returns: "/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05"
 *
 * @example With existing params
 * const currentParams = new URLSearchParams("ai_search=casa+en+gualaceo")
 * buildBoundsUrl(bounds, currentParams)
 * // Returns: "/mapa?ai_search=casa+en+gualaceo&ne_lat=-2.85&..."
 */
export function buildBoundsUrl(
  bounds: MapBounds,
  currentParams?: URLSearchParams,
): string {
  // PERFORMANCE FIX: Clamp bounds to Ecuador before building URL
  // This prevents MapPage re-renders with invalid bounds
  // Reduces 286ms slowdown caused by server validation failures
  const clampedBounds = clampBoundsToEcuador(bounds);

  // Start with existing params if provided, otherwise create new
  const params = currentParams
    ? new URLSearchParams(currentParams)
    : new URLSearchParams();

  // Update/set bounds params (overwrites existing bounds if any)
  // Round to reduce URL clutter (4 decimals = ~11m precision)
  params.set("ne_lat", clampedBounds.ne_lat.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("ne_lng", clampedBounds.ne_lng.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("sw_lat", clampedBounds.sw_lat.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("sw_lng", clampedBounds.sw_lng.toFixed(CONSTRAINTS.DECIMAL_PLACES));

  return `/mapa?${params.toString()}`;
}

/**
 * Parse and validate map bounds from URL search params
 * Falls back to viewport params if bounds are not present (for backward compatibility)
 *
 * @param searchParams - URL search params object
 * @param fallback - Default viewport if params are invalid/missing
 * @returns Validated bounds or viewport converted to bounds
 *
 * @example
 * const params = new URLSearchParams("ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05")
 * parseBoundsParams(params, defaultViewport)
 * // Returns: { ne_lat: -2.85, ne_lng: -78.95, sw_lat: -2.95, sw_lng: -79.05 }
 */
export function parseBoundsParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  fallback?: MapViewport,
): MapBounds | null {
  try {
    // Try to extract bounds params (new pattern)
    const ne_lat =
      searchParams instanceof URLSearchParams
        ? searchParams.get("ne_lat")
        : searchParams.ne_lat;
    const ne_lng =
      searchParams instanceof URLSearchParams
        ? searchParams.get("ne_lng")
        : searchParams.ne_lng;
    const sw_lat =
      searchParams instanceof URLSearchParams
        ? searchParams.get("sw_lat")
        : searchParams.sw_lat;
    const sw_lng =
      searchParams instanceof URLSearchParams
        ? searchParams.get("sw_lng")
        : searchParams.sw_lng;

    // Parse to numbers
    const neLat = Number(ne_lat);
    const neLng = Number(ne_lng);
    const swLat = Number(sw_lat);
    const swLng = Number(sw_lng);

    // Validate all params exist and are valid numbers
    if (
      !ne_lat ||
      !ne_lng ||
      !sw_lat ||
      !sw_lng ||
      Number.isNaN(neLat) ||
      Number.isNaN(neLng) ||
      Number.isNaN(swLat) ||
      Number.isNaN(swLng)
    ) {
      if (!fallback) return null;
      // Fallback: try old viewport params
      const viewport = parseMapParams(searchParams, fallback);
      return viewportToBounds(viewport);
    }

    // Validate ranges
    if (
      neLat < CONSTRAINTS.LAT_MIN ||
      neLat > CONSTRAINTS.LAT_MAX ||
      swLat < CONSTRAINTS.LAT_MIN ||
      swLat > CONSTRAINTS.LAT_MAX ||
      neLng < CONSTRAINTS.LNG_MIN ||
      neLng > CONSTRAINTS.LNG_MAX ||
      swLng < CONSTRAINTS.LNG_MIN ||
      swLng > CONSTRAINTS.LNG_MAX
    ) {
      if (!fallback) return null;
      // Fallback to viewport params
      const viewport = parseMapParams(searchParams, fallback);
      return viewportToBounds(viewport);
    }

    // Validate bounds logic (ne > sw)
    if (neLat <= swLat || neLng <= swLng) {
      if (!fallback) return null;
      // Fallback to viewport params
      const viewport = parseMapParams(searchParams, fallback);
      return viewportToBounds(viewport);
    }

    // All valid
    return { ne_lat: neLat, ne_lng: neLng, sw_lat: swLat, sw_lng: swLng };
  } catch {
    if (!fallback) return null;
    // Any parsing error → fallback to viewport
    const viewport = parseMapParams(searchParams, fallback);
    return viewportToBounds(viewport);
  }
}

import { z } from "zod";

/**
 * =================================================================================
 * FILTER PARAMS (ZOD SCHEMA)
 * =================================================================================
 */

// Define valid enum values to be used in the Zod schema
// Source: packages/database/prisma/schema.prisma
const TRANSACTION_TYPES = ["SALE", "RENT"] as const;
const PROPERTY_CATEGORIES = [
  "HOUSE",
  "APARTMENT",
  "SUITE",
  "VILLA",
  "PENTHOUSE",
  "DUPLEX",
  "LOFT",
  "LAND",
  "COMMERCIAL",
  "OFFICE",
  "WAREHOUSE",
  "FARM",
] as const;

// Zod schema for filter parameters
const FilterSchema = z.object({
  transactionType: z.preprocess(
    (val) =>
      val === undefined || val === null
        ? undefined
        : Array.isArray(val)
        ? val
        : [val],
    z.array(z.enum(TRANSACTION_TYPES)).optional(),
  ),
  category: z.preprocess(
    (val) =>
      val === undefined || val === null
        ? undefined
        : Array.isArray(val)
        ? val
        : [val],
    z.array(z.enum(PROPERTY_CATEGORIES)).optional(),
  ),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().positive().optional(),
  bathrooms: z.coerce.number().positive().optional(),
  minArea: z.coerce.number().positive().optional(),
  maxArea: z.coerce.number().positive().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Type inferred from the Zod schema. This is now the single source of truth
 * for the filter parameters' shape and type, compatible with `PropertyFilters`.
 */
export type DynamicFilterParams = z.infer<typeof FilterSchema>;

/**
 * Parse and validate filter parameters from URL search params using Zod.
 *
 * @param searchParams - URL search params
 * @returns A validated filter params object. Returns an empty object if validation fails.
 */
export function parseFilterParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): DynamicFilterParams {
  // Ensure we are working with URLSearchParams for consistent processing
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams as Record<string, string>);

  // Convert URLSearchParams to a plain object, supporting multiple values for a key.
  const rawParams: Record<string, string | string[]> = {};
  for (const key of new Set(Array.from(params.keys()))) {
    const values = params.getAll(key);
    if (values.length > 1) {
      rawParams[key] = values;
    } else if (values.length === 1) {
      rawParams[key] = values[0] ?? '';
    }
  }

  // Use safeParse to validate the object. It doesn't throw on error.
  const result = FilterSchema.safeParse(rawParams);

  if (result.success) {
    return result.data; // Return the validated, typed data
  }

  // Optional: Log errors for debugging purposes during development
  if (process.env.NODE_ENV === "development") {
    console.error(
      "Zod validation error in parseFilterParams:",
      result.error.flatten(),
    );
  }

  return {}; // Return an empty object on validation failure
}

/**
 * Build filter query string from filter params
 * Useful for constructing URLs with filters
 *
 * @param filters - Filter parameters
 * @returns Query string portion (e.g., "transactionType=SALE&minPrice=100000")
 */
export function buildFilterUrl(filters: DynamicFilterParams): string {
  const params = new URLSearchParams();

  if (filters.transactionType) {
    const values = Array.isArray(filters.transactionType)
      ? filters.transactionType
      : [filters.transactionType];
    values.forEach((val) => params.append("transactionType", val));
  }

  if (filters.category) {
    const values = Array.isArray(filters.category) ? filters.category : [filters.category];
    values.forEach((val) => params.append("category", val));
  }

  if (filters.minPrice !== undefined) {
    params.set("minPrice", filters.minPrice.toString());
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", filters.maxPrice.toString());
  }

  if (filters.bedrooms !== undefined) {
    params.set("bedrooms", filters.bedrooms.toString());
  }

  if (filters.bathrooms !== undefined) {
    params.set("bathrooms", filters.bathrooms.toString());
  }

  if (filters.minArea !== undefined) {
    params.set("minArea", filters.minArea.toString());
  }

  if (filters.city !== undefined) {
    params.set("city", filters.city);
  }

  if (filters.search !== undefined) {
    params.set("search", filters.search);
  }

  return params.toString();
}

/**
 * Convert MapBounds to Mapbox GL JS LngLatBounds
 *
 * Useful for using Mapbox native utilities like:
 * - bounds.contains(lngLat)
 * - bounds.extend(lngLat)
 * - bounds.getCenter()
 *
 * @param bounds - Custom MapBounds format
 * @returns Mapbox LngLatBounds object
 *
 * @example
 * const bounds = { sw_lat: -2.95, sw_lng: -79.05, ne_lat: -2.85, ne_lng: -78.95 };
 * const mapboxBounds = toMapboxBounds(bounds);
 * mapboxBounds.contains(new mapboxgl.LngLat(-79.0, -2.9)); // true
 */
export function toMapboxBounds(bounds: MapBounds): mapboxgl.LngLatBounds {
  return new mapboxgl.LngLatBounds(
    [bounds.sw_lng, bounds.sw_lat], // SW corner [lng, lat]
    [bounds.ne_lng, bounds.ne_lat], // NE corner [lng, lat]
  );
}

/**
 * Convert Mapbox GL JS LngLatBounds to MapBounds
 *
 * @param bounds - Mapbox LngLatBounds object
 * @returns Custom MapBounds format
 *
 * @example
 * const mapboxBounds = new mapboxgl.LngLatBounds([-79.05, -2.95], [-78.95, -2.85]);
 * const bounds = fromMapboxBounds(mapboxBounds);
 * // Returns: { sw_lat: -2.95, sw_lng: -79.05, ne_lat: -2.85, ne_lng: -78.95 }
 */
export function fromMapboxBounds(bounds: mapboxgl.LngLatBounds): MapBounds {
  return {
    sw_lat: bounds.getSouth(),
    sw_lng: bounds.getWest(),
    ne_lat: bounds.getNorth(),
    ne_lng: bounds.getEast(),
  };
}

/**
 * Check if a point is within bounds using Mapbox GL JS
 *
 * @param latitude - Point latitude
 * @param longitude - Point longitude
 * @param bounds - Bounding box
 * @returns true if point is within bounds
 *
 * @example
 * const bounds = { sw_lat: -2.95, sw_lng: -79.05, ne_lat: -2.85, ne_lng: -78.95 };
 * isPointInBounds(-2.9, -79.0, bounds); // true
 */
export function isPointInBounds(
  latitude: number,
  longitude: number,
  bounds: MapBounds,
): boolean {
  try {
    const mapboxBounds = toMapboxBounds(bounds);
    const lngLat = new mapboxgl.LngLat(longitude, latitude);
    return mapboxBounds.contains(lngLat);
  } catch {
    // If coordinates are invalid, return false
    return false;
  }
}

/**
 * Calculate distance between two geographic points in meters
 *
 * Uses Mapbox GL JS LngLat.distanceTo() for accurate calculations.
 * Accounts for Earth's curvature using the Haversine formula.
 *
 * @param lat1 - Start latitude
 * @param lng1 - Start longitude
 * @param lat2 - End latitude
 * @param lng2 - End longitude
 * @returns Distance in meters
 *
 * @example
 * const distance = calculateDistance(-2.9, -79.0, -2.8, -78.9);
 * console.log(distance); // ~11000 (approximately 11 km)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  try {
    const from = new mapboxgl.LngLat(lng1, lat1);
    const to = new mapboxgl.LngLat(lng2, lat2);
    return from.distanceTo(to); // Returns distance in meters
  } catch {
    // If coordinates are invalid, return 0
    return 0;
  }
}

/**
 * Validate if coordinates are within valid geographic ranges
 *
 * @param latitude - Latitude to validate (-90 to 90)
 * @param longitude - Longitude to validate (-180 to 180)
 * @returns true if coordinates are valid
 *
 * @example
 * isValidCoordinate(-2.9, -79.0); // true
 * isValidCoordinate(91, -79.0);   // false (latitude > 90)
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    latitude >= CONSTRAINTS.LAT_MIN &&
    latitude <= CONSTRAINTS.LAT_MAX &&
    longitude >= CONSTRAINTS.LNG_MIN &&
    longitude <= CONSTRAINTS.LNG_MAX
  );
}

/**
 * Check if coordinates are within Ecuador's geographic boundaries
 *
 * Useful for validating properties are in the service area.
 *
 * @param latitude - Point latitude
 * @param longitude - Point longitude
 * @returns true if point is in Ecuador
 *
 * @example
 * isInEcuador(-2.9, -79.0);   // true (Cuenca)
 * isInEcuador(40.7, -74.0);   // false (New York)
 */
export function isInEcuador(latitude: number, longitude: number): boolean {
  return (
    latitude >= ECUADOR_BOUNDS.minLat &&
    latitude <= ECUADOR_BOUNDS.maxLat &&
    longitude >= ECUADOR_BOUNDS.minLng &&
    longitude <= ECUADOR_BOUNDS.maxLng
  );
}

/**
 * Check if coordinates are within Ecuador using Mapbox GL JS utilities
 *
 * Alternative to isInEcuador() using native Mapbox LngLatBounds validation.
 * Useful if you're already working with Mapbox LngLat objects.
 *
 * @param latitude - Point latitude
 * @param longitude - Point longitude
 * @returns true if point is in Ecuador
 *
 * @example
 * isInEcuadorMapbox(-2.9, -79.0);   // true (Cuenca)
 * isInEcuadorMapbox(40.7, -74.0);   // false (New York)
 */
export function isInEcuadorMapbox(latitude: number, longitude: number): boolean {
  try {
    const lngLat = new mapboxgl.LngLat(longitude, latitude);
    return ECUADOR_BOUNDS_MAPBOX.contains(lngLat);
  } catch {
    return false;
  }
}

/**
 * Validate if bounds are properly formed and contain valid coordinates
 *
 * Checks that:
 * - All coordinates are valid numbers
 * - SW coordinates < NE coordinates (proper bounds)
 * - Coordinates are within valid ranges
 *
 * @param bounds - Bounds to validate
 * @returns true if bounds are valid
 *
 * @example
 * const validBounds = { sw_lat: -2.95, sw_lng: -79.05, ne_lat: -2.85, ne_lng: -78.95 };
 * isValidBounds(validBounds); // true
 *
 * const invalidBounds = { sw_lat: -2.85, sw_lng: -78.95, ne_lat: -2.95, ne_lng: -79.05 };
 * isValidBounds(invalidBounds); // false (SW > NE)
 */
export function isValidBounds(bounds: MapBounds): boolean {
  // Check all coordinates are valid
  if (
    !isValidCoordinate(bounds.sw_lat, bounds.sw_lng) ||
    !isValidCoordinate(bounds.ne_lat, bounds.ne_lng)
  ) {
    return false;
  }

  // Check bounds are properly formed (SW < NE)
  if (
    bounds.sw_lat >= bounds.ne_lat ||
    bounds.sw_lng >= bounds.ne_lng
  ) {
    return false;
  }

  return true;
}
