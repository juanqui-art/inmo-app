/**
 * Property Type Mappers
 *
 * Converts between different property representations used across the app.
 * Ensures type safety when passing data between server and client components.
 */

import type { MapProperty } from "@/components/map/map-view";
import type { SerializedProperty } from "@repo/database";

/**
 * Converts a SerializedProperty to MapProperty format
 * Used when passing property data to map components
 *
 * @param property - Property from database repository
 * @returns Property in MapProperty format for map rendering
 */
export function toMapProperty(property: SerializedProperty): MapProperty {
  return {
    id: property.id,
    title: property.title,
    price: property.price,
    transactionType: property.transactionType,
    category: property.category ?? undefined,
    latitude: property.latitude,
    longitude: property.longitude,
    city: property.city,
    state: property.state,
    bedrooms: property.bedrooms ?? undefined,
    bathrooms: property.bathrooms ?? undefined,
    area: property.area ?? undefined,
    images: property.images,
  };
}

/**
 * Converts an array of SerializedProperty to MapProperty[]
 *
 * @param properties - Array of properties from database
 * @returns Array of properties in MapProperty format
 */
export function toMapProperties(
  properties: SerializedProperty[],
): MapProperty[] {
  return properties.map(toMapProperty);
}
