/**
 * Map Page with Dynamic Filtering
 *
 * Pattern: Server Component fetches data based on URL params (bounds + filters)
 * - Parses bounds and filters from searchParams
 * - Fetches properties matching bounds + filters
 * - Passes data to client-side MapView + FilterBar
 * - Filter state syncs to URL for shareable links
 *
 * WHY this approach?
 * - Server-side data fetching (fast, no client waterfall)
 * - URL-driven state (shareable links, browser history)
 * - Type-safe filter conversion
 */

import type { Metadata } from "next";
import { MapPageClient } from "@/components/map/map-page-client";
import { getCurrentUser } from "@/lib/auth";
import { propertyRepository, serializeProperties } from "@repo/database";
import {
  parseBoundsParams,
  parseFilterParams,
  dynamicFiltersToPropertyFilters,
  hasBoundsParams,
} from "@/lib/utils/url-helpers";

export const metadata: Metadata = {
  title: "Mapa de Propiedades | InmoApp",
  description: "Explora propiedades en venta y arriendo en un mapa interactivo",
};

interface MapPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Default viewport for Ecuador (Azuay/Cuenca region)
 * Used as fallback when no bounds in URL
 */
const DEFAULT_VIEWPORT = {
  latitude: -2.9001, // Cuenca, Ecuador
  longitude: -79.0058,
  zoom: 12,
} as const;

export default async function MapPage(props: MapPageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const searchParams = await props.searchParams;

  /**
   * STEP 1: Detect if user provided bounds in URL
   * - NO bounds → initial load: fetch ALL properties using world bounds
   * - YES bounds → user navigated map: fetch only within those bounds
   */
  const userProvidedBounds = hasBoundsParams(searchParams);

  // For display: use URL bounds if present, else use default viewport
  const displayBounds = userProvidedBounds
    ? parseBoundsParams(searchParams, DEFAULT_VIEWPORT)
    : null;

  // For fetch: use world bounds on initial load, else use URL bounds
  const fetchBounds = userProvidedBounds
    ? displayBounds!
    : {
        ne_lat: 90,
        ne_lng: 180,
        sw_lat: -90,
        sw_lng: -180,
      };

  /**
   * STEP 2: Parse filters from URL
   * Supports: transactionType, category, minPrice, maxPrice, bedrooms, bathrooms
   */
  const dynamicFilters = parseFilterParams(searchParams);
  const repositoryFilters = dynamicFiltersToPropertyFilters(dynamicFilters);

  /**
   * STEP 3: Fetch properties within bounds + filters
   * Server-side fetch ensures fresh data without client delay
   */
  const { properties } = await propertyRepository.findInBounds({
    minLatitude: fetchBounds.sw_lat,
    maxLatitude: fetchBounds.ne_lat,
    minLongitude: fetchBounds.sw_lng,
    maxLongitude: fetchBounds.ne_lng,
    filters: {
      ...repositoryFilters,
      status: "AVAILABLE",
    } as any,
    take: 1000,
  });

  // Serialize properties (Decimal → number)
  const serialized = serializeProperties(properties);

  /**
   * STEP 4: Get price range for filter UI
   * Used to initialize price slider bounds and histogram
   */
  const { minPrice: priceRangeMin, maxPrice: priceRangeMax } =
    await propertyRepository.getPriceRange(repositoryFilters as any);

  // Get current user for auth state
  const currentUser = await getCurrentUser();

  /**
   * Render map page with:
   * - FilterBar at top (manages filter state + URL sync)
   * - MapView below (displays properties with clustering)
   * - Both receive server-fetched data + bounds from URL (if user provided them)
   *
   * displayBounds:
   * - null on initial load → MapView uses default viewport (Cuenca, zoom 12)
   * - bounds object if user navigated → MapView fits to those bounds
   */
  return (
    <MapPageClient
      properties={serialized}
      isAuthenticated={!!currentUser}
      initialBounds={displayBounds ?? undefined}
      priceRangeMin={priceRangeMin}
      priceRangeMax={priceRangeMax}
    />
  );
}
