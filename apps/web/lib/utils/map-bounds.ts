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
export function calculateZoomLevel(bounds: MapBounds): number {
  const lngDiff = bounds.ne_lng - bounds.sw_lng;
  const latDiff = bounds.ne_lat - bounds.sw_lat;
  const maxDiff = Math.max(lngDiff, latDiff);

  // Logarithmic scaling for smooth zoom transitions
  // Extended to support countries and large regions
  // MapBox zoom formula: each zoom level = half the area of previous
  // - Zoom 4: 22.5° (countries like Mexico, Canada)
  // - Zoom 5: 11.25° (very large countries)
  // - Zoom 6: 5.625° (medium countries like Ecuador - 6.4° diagonal fits here)
  // - Zoom 7: 2.8° (large regions, provinces)
  if (maxDiff > 10) return 4; // Continental view (>10° spread)
  if (maxDiff > 6.5) return 5; // Very large countries (6.5-10° spread)
  if (maxDiff > 3) return 6; // Medium countries (Ecuador, Colombia - 3-6.5° spread)
  if (maxDiff > 1) return 7; // Large regions (1-3° spread)
  if (maxDiff > 0.5) return 9; // Entire province
  if (maxDiff > 0.2) return 11; // City
  if (maxDiff > 0.05) return 13; // Multiple neighborhoods
  if (maxDiff > 0.01) return 15; // Single neighborhood
  if (maxDiff > 0.001) return 17; // Single street
  return 18; // Single building
}

/**
 * Calculate smart viewport based on search results
 * Handles 3 scenarios:
 * 1. No results → default Cuenca view
 * 2. One result → close-up street-level view
 * 3. Multiple results → fitted view showing all
 *
 * @param properties - Array of properties to fit
 * @returns Viewport configuration for MapBox GL
 */
export function getSmartViewport(
  properties: LocationData[]
): SmartViewport {
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

  // Scenario 3: Multiple results - calculate bounds and fit
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

  // Calculate center point
  const centerLat = (bounds.sw_lat + bounds.ne_lat) / 2;
  const centerLng = (bounds.sw_lng + bounds.ne_lng) / 2;

  // Calculate zoom level and subtract 1 for padding
  const calculatedZoom = calculateZoomLevel(bounds);
  const finalZoom = Math.max(calculatedZoom - 1, 8); // Ensure minimum zoom

  return {
    latitude: centerLat,
    longitude: centerLng,
    zoom: finalZoom,
    transitionDuration: 600,
  };
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
