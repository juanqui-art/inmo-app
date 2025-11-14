import AuthStoreInitializer from "@/stores/AuthStoreInitializer";
import { MapPageClient } from "@/components/map/map-page-client";
import MapStoreInitializer from "@/components/map/map-store-initializer"; // NEW IMPORT
import { getCurrentUser } from "@/lib/auth";
import { parseBoundsParams, parseFilterParams } from "@/lib/utils/url-helpers";
import {
  type PropertyFilters,
  propertyRepository,
} from "@repo/database"; // NEW: Import PropertyFilters
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa de Propiedades | InmoApp",
  description: "Explora propiedades en venta y arriendo en un mapa interactivo",
};

interface MapPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapPage(props: MapPageProps) {
  const searchParams = await props.searchParams;

  // Parse bounds from URL for initial map display
  const displayBounds = parseBoundsParams(searchParams);

  // Parse filters from URL
  const repositoryFilters: PropertyFilters = parseFilterParams(searchParams);

  // Fetch user, properties, price range, and price distribution in parallel
  const [
    currentUser,
    { properties },
    { minPrice: priceRangeMin, maxPrice: priceRangeMax },
    priceDistribution,
  ] = await Promise.all([
    getCurrentUser(),
    propertyRepository.list({
      filters: {
        ...repositoryFilters,
        status: "AVAILABLE",
      },
      take: 1000,
    }),
    propertyRepository.getPriceRange(repositoryFilters),
    propertyRepository.getPriceDistribution({
      filters: repositoryFilters,
    }),
  ]);

  // Note: properties are already serialized (Decimal → number) by propertyRepository.list()

  return (
    <>
      <AuthStoreInitializer user={currentUser} />
      <MapStoreInitializer
        properties={properties}
        priceDistribution={priceDistribution}
        priceRangeMin={priceRangeMin}
        priceRangeMax={priceRangeMax}
      />
      <MapPageClient initialBounds={displayBounds ?? undefined} />
    </>
  );
}
