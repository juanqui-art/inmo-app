/**
 * Map Bounds Utilities
 *
 * Handles calculation of bounding boxes and smart viewport fitting
 * for search results on the map.
 *
 * FEATURES:
 * - Calculate bounding box from array of coordinates
 * - Intelligent zoom level based on geographic spread
 * - Smart viewport fitting for 1, multiple, or no results
 * - Padding and animation configuration
 */

/**
 * Bounding box defining geographic boundaries
 * [sw_lng, sw_lat, ne_lng, ne_lat]
 * SW = Southwest (bottom-left)
 * NE = Northeast (top-right)
 */
export interface MapBounds {
  sw_lng: number;
  sw_lat: number;
  ne_lng: number;
  ne_lat: number;
}

/**
 * Viewport state for MapBox GL
 */
export interface SmartViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  transitionDuration?: number;
  pitch?: number;
  bearing?: number;
}

/**
 * Property type with minimal location data
 */
interface LocationData {
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Calculate bounding box from array of properties
 * Finds min/max coordinates to create a rectangle containing all points
 *
 * @param properties - Array of properties with coordinates
 * @returns Bounding box or null if no valid coordinates
 */
export function calculateBounds(
  properties: LocationData[]
): MapBounds | null {
  const validProps = properties.filter(
    (p) => p.latitude != null && p.longitude != null
  );

  if (validProps.length === 0) return null;

  const lats = validProps.map((p) => p.latitude as number);
  const lngs = validProps.map((p) => p.longitude as number);

  return {
    sw_lat: Math.min(...lats),
    sw_lng: Math.min(...lngs),
    ne_lat: Math.max(...lats),
    ne_lng: Math.max(...lngs),
  };
}

/**
 * Calculate optimal zoom level based on geographic spread
 * Uses logarithmic scaling to map distance to zoom level
 *
 * Geographic scale reference:
 * - 0.5° ≈ 55 km (entire province)
 * - 0.2° ≈ 22 km (city)
 * - 0.05° ≈ 5.5 km (neighborhood)
 * - 0.01° ≈ 1.1 km (street)
 * - 0.001° ≈ 110 m (building)
 *
 * @param bounds - Bounding box
 * @returns Zoom level (0-22 for MapBox GL)
 */
/**
 * Calculate smart viewport or bounds based on search results.
 * This function prepares the necessary information for the map component to either
 * fly to a specific point or fit a bounding box.
 *
 * Handles 3 scenarios:
 * 1. No results → returns a default viewport for Cuenca.
 * 2. One result → returns a close-up viewport for that property.
 * 3. Multiple results → returns the calculated bounding box (`MapBounds`).
 *
 * @param properties - Array of properties to fit.
 * @returns A `SmartViewport` for 0 or 1 result, or `MapBounds` for multiple results.
 */
export function getSmartViewport(
  properties: LocationData[]
): SmartViewport | MapBounds | null {
  // Scenario 1: No results - return default Cuenca view
  if (properties.length === 0) {
    return {
      latitude: -2.9,
      longitude: -79.0,
      zoom: 11,
      transitionDuration: 600,
    };
  }

  // Scenario 2: Single result - close-up street-level view
  if (properties.length === 1) {
    const prop = properties[0];
    if (prop && prop.latitude != null && prop.longitude != null) {
      return {
        latitude: prop.latitude,
        longitude: prop.longitude,
        zoom: 16, // Street level
        transitionDuration: 600,
      };
    }
    // Fallback if single property has no coordinates
    return {
      latitude: -2.9,
      longitude: -79.0,
      zoom: 11,
      transitionDuration: 600,
    };
  }

  // Scenario 3: Multiple results - return bounds for `fitBounds`
  const bounds = calculateBounds(properties);

  if (!bounds) {
    // Fallback if no valid coordinates found
    return {
      latitude: -2.9,
      longitude: -79.0,
      zoom: 11,
      transitionDuration: 600,
    };
  }

  return bounds;
}

/**
 * Calculate MapBox fitBounds() format
 * MapBox expects: [[minLng, minLat], [maxLng, maxLat]]
 *
 * @param bounds - Bounding box
 * @returns Array format for MapBox fitBounds()
 */
export function boundsToMapBoxFormat(
  bounds: MapBounds
): [[number, number], [number, number]] {
  return [
    [bounds.sw_lng, bounds.sw_lat], // Southwest corner
    [bounds.ne_lng, bounds.ne_lat], // Northeast corner
  ];
}
