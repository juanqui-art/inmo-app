/**
 * Map Page - Simplified Version
 *
 * Basic approach: Fetch all properties and display on map
 * No caching, no complex bounds logic, just the essentials
 */

import type { Metadata } from "next";
import { MapView } from "@/components/map/map-view";
import { getCurrentUser } from "@/lib/auth";
import { propertyRepository, serializeProperties } from "@repo/database";

export const metadata: Metadata = {
  title: "Mapa de Propiedades | InmoApp",
  description: "Explora propiedades en venta y arriendo en un mapa interactivo",
};

export default async function MapPage() {
  // Fetch all available properties with coordinates
  // Using findInBounds with world bounds ensures only properties with valid coordinates
  const { properties } = await propertyRepository.findInBounds({
    minLatitude: -90, // South Pole
    maxLatitude: 90, // North Pole
    minLongitude: -180, // West extreme
    maxLongitude: 180, // East extreme
    filters: {
      status: "AVAILABLE",
    },
    take: 1000, // Reasonable limit
  });

  // Serialize properties (Decimal → number)
  // No need to filter by coordinates - findInBounds guarantees they're not null
  const serialized = serializeProperties(properties);

  // Get current user for auth state
  const currentUser = await getCurrentUser();

  // Render map with properties
  return (
    <div className="w-full h-screen">
      <MapView properties={serialized} isAuthenticated={!!currentUser} />
    </div>
  );
}
