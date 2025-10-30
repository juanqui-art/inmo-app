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
  // Start with existing params if provided, otherwise create new
  const params = currentParams
    ? new URLSearchParams(currentParams)
    : new URLSearchParams();

  // Update/set bounds params (overwrites existing bounds if any)
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

/**
 * Filter parameters for dynamic property filtering on map
 * Extracted from URL query params
 */
export interface DynamicFilterParams {
  transactionType?: string | string[];
  category?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  search?: string;
}

/**
 * Parse and validate filter parameters from URL search params
 *
 * @param searchParams - URL search params
 * @returns Validated filter params object
 *
 * @example
 * // URL: /mapa?...&transactionType=SALE&minPrice=100000&maxPrice=300000
 * parseFilterParams(searchParams)
 * // Returns: { transactionType: 'SALE', minPrice: 100000, maxPrice: 300000 }
 */
export function parseFilterParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): DynamicFilterParams {
  const getParam = (key: string): string | string[] | undefined => {
    if (searchParams instanceof URLSearchParams) {
      const values = searchParams.getAll(key);
      return values.length === 0 ? undefined : values.length === 1 ? values[0] : values;
    }
    return searchParams[key];
  };

  const filters: DynamicFilterParams = {};

  // Transaction type filter (can be multiple)
  const transactionType = getParam("transactionType");
  if (transactionType) {
    filters.transactionType = transactionType;
  }

  // Category filter (can be multiple)
  const category = getParam("category");
  if (category) {
    filters.category = category;
  }

  // Price range filters
  const minPrice = getParam("minPrice");
  if (minPrice && !Array.isArray(minPrice)) {
    const price = parseFloat(minPrice);
    if (!isNaN(price) && price >= 0) {
      filters.minPrice = price;
    }
  }

  const maxPrice = getParam("maxPrice");
  if (maxPrice && !Array.isArray(maxPrice)) {
    const price = parseFloat(maxPrice);
    if (!isNaN(price) && price >= 0) {
      filters.maxPrice = price;
    }
  }

  // Bedroom filter
  const bedrooms = getParam("bedrooms");
  if (bedrooms && !Array.isArray(bedrooms)) {
    const num = parseInt(bedrooms);
    if (!isNaN(num) && num > 0) {
      filters.bedrooms = num;
    }
  }

  // Bathroom filter
  const bathrooms = getParam("bathrooms");
  if (bathrooms && !Array.isArray(bathrooms)) {
    const num = parseFloat(bathrooms);
    if (!isNaN(num) && num > 0) {
      filters.bathrooms = num;
    }
  }

  // Area filter
  const minArea = getParam("minArea");
  if (minArea && !Array.isArray(minArea)) {
    const num = parseFloat(minArea);
    if (!isNaN(num) && num > 0) {
      filters.minArea = num;
    }
  }

  // City filter
  const city = getParam("city");
  if (city && !Array.isArray(city)) {
    filters.city = city;
  }

  // Search text
  const search = getParam("search");
  if (search && !Array.isArray(search)) {
    filters.search = search;
  }

  return filters;
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
 * Convert DynamicFilterParams to PropertyFilters format for repository
 * Handles single vs multiple values for transactionType and category
 *
 * @param dynamicFilters - URL filter parameters
 * @returns PropertyFilters object for repository.findInBounds()
 */
export function dynamicFiltersToPropertyFilters(
  dynamicFilters: DynamicFilterParams,
): Record<string, unknown> {
  const filters: Record<string, unknown> = {};

  // For database queries, we need single values, not arrays
  // If multiple values selected, store as is (repository will handle as OR query)
  if (dynamicFilters.transactionType) {
    // If array, just take first one for single filter query
    // (OR queries would be added in future enhancement)
    if (Array.isArray(dynamicFilters.transactionType)) {
      if (dynamicFilters.transactionType.length === 1) {
        filters.transactionType = dynamicFilters.transactionType[0];
      }
      // For multiple selections, repository needs enhancement to support it
    } else {
      filters.transactionType = dynamicFilters.transactionType;
    }
  }

  if (dynamicFilters.category) {
    if (Array.isArray(dynamicFilters.category)) {
      if (dynamicFilters.category.length === 1) {
        filters.category = dynamicFilters.category[0];
      }
    } else {
      filters.category = dynamicFilters.category;
    }
  }

  if (dynamicFilters.minPrice !== undefined) {
    filters.minPrice = dynamicFilters.minPrice;
  }

  if (dynamicFilters.maxPrice !== undefined) {
    filters.maxPrice = dynamicFilters.maxPrice;
  }

  if (dynamicFilters.bedrooms !== undefined) {
    filters.bedrooms = dynamicFilters.bedrooms;
  }

  if (dynamicFilters.bathrooms !== undefined) {
    filters.bathrooms = dynamicFilters.bathrooms;
  }

  if (dynamicFilters.minArea !== undefined) {
    filters.minArea = dynamicFilters.minArea;
  }

  if (dynamicFilters.city !== undefined) {
    filters.city = dynamicFilters.city;
  }

  if (dynamicFilters.search !== undefined) {
    filters.search = dynamicFilters.search;
  }

  return filters;
}
