/**
 * URL Helpers for Map State Management
 *
 * Utilities for syncing map viewport state with URL query parameters
 * Enables shareable map locations and browser history navigation
 *
 * USAGE:
 * - buildMapUrl(): Construct URL with viewport params
 * - parseMapParams(): Extract and validate viewport from URL
 */

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
 *
 * @param bounds - Geographic bounding box
 * @returns URL string with bounds params (e.g., "/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05")
 *
 * @example
 * buildBoundsUrl({
 *   ne_lat: -2.85, ne_lng: -78.95,
 *   sw_lat: -2.95, sw_lng: -79.05
 * })
 * // Returns: "/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05"
 */
export function buildBoundsUrl(bounds: MapBounds): string {
  const params = new URLSearchParams();

  // Round to reduce URL clutter (4 decimals = ~11m precision)
  params.set("ne_lat", bounds.ne_lat.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("ne_lng", bounds.ne_lng.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("sw_lat", bounds.sw_lat.toFixed(CONSTRAINTS.DECIMAL_PLACES));
  params.set("sw_lng", bounds.sw_lng.toFixed(CONSTRAINTS.DECIMAL_PLACES));

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
  fallback: MapViewport,
): MapBounds {
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
      // Fallback to viewport params
      const viewport = parseMapParams(searchParams, fallback);
      return viewportToBounds(viewport);
    }

    // Validate bounds logic (ne > sw)
    if (neLat <= swLat || neLng <= swLng) {
      // Fallback to viewport params
      const viewport = parseMapParams(searchParams, fallback);
      return viewportToBounds(viewport);
    }

    // All valid
    return { ne_lat: neLat, ne_lng: neLng, sw_lat: swLat, sw_lng: swLng };
  } catch {
    // Any parsing error → fallback to viewport
    const viewport = parseMapParams(searchParams, fallback);
    return viewportToBounds(viewport);
  }
}
