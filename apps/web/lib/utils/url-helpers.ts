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
