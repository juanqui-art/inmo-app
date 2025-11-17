/**
 * Properties Unified Page
 *
 * UNIFIED VIEW: Handles both list and map views through ?view parameter
 * - /propiedades → List view (default)
 * - /propiedades?view=list → List view (explicit)
 * - /propiedades?view=map → Map view
 *
 * RESPONSIVE BEHAVIOR:
 * - Desktop (≥1024px): Split view (50/50 list + map) when view=map
 * - Mobile (<1024px): Toggle between full-screen list or map
 * - Default: List view (recommended by Nielsen Norman Group research)
 *
 * FEATURES:
 * - Server-side filtering and pagination (list view)
 * - Interactive map with markers (map view)
 * - SEO metadata (dynamic title/description by city)
 * - Full filter support in both views
 * - URL parameter preservation across view changes
 *
 * ARCHITECTURE:
 * - Server Component: Fetches data for active view(s)
 * - Store Initializers: Hydrate PropertyGridStore and/or MapStore
 * - Client Components: Render appropriate view based on ?view parameter
 *
 * MIGRATION: Part of split view unification (Nov 2025)
 * - Old: Separate routes (/mapa and /propiedades)
 * - New: Single route with view parameter
 * - Rationale: Industry best practices (Booking.com, Hotels.com pattern)
 */

import {
  getPropertiesList,
  type PropertyFilters,
  propertyRepository,
} from "@repo/database";
import type { Metadata } from "next";
import { MapPageClient } from "@/components/map/map-page-client";
import MapStoreInitializer from "@/components/map/map-store-initializer";
import { PropertyGridPage } from "@/components/properties/property-grid-page";
import { PropertySplitView } from "@/components/properties/property-split-view";
import { getCurrentUser } from "@/lib/auth";
import { parseBoundsParams, parseFilterParams } from "@/lib/utils/url-helpers";
import AuthStoreInitializer from "@/stores/AuthStoreInitializer";
import type { FilterState } from "@/stores/map-store";
import PropertyGridStoreInitializer from "@/stores/PropertyGridStoreInitializer";

interface PropiedadesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Generate dynamic SEO metadata based on filters and view
 * Examples:
 * - /propiedades → "Propiedades en Venta y Arriendo | InmoApp"
 * - /propiedades?view=map → "Mapa de Propiedades | InmoApp"
 * - /propiedades?city=Cuenca → "Propiedades en Cuenca | InmoApp"
 * - /propiedades?city=Cuenca&view=map → "Mapa de Propiedades en Cuenca | InmoApp"
 */
export async function generateMetadata(
  props: PropiedadesPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const view = Array.isArray(searchParams.view)
    ? searchParams.view[0]
    : searchParams.view;
  const city = Array.isArray(searchParams.city)
    ? searchParams.city[0]
    : searchParams.city;
  const transactionType = Array.isArray(searchParams.transactionType)
    ? searchParams.transactionType[0]
    : searchParams.transactionType;

  const isMapView = view === "map";
  const cityText = city ? ` en ${city}` : "";
  const typeText =
    transactionType === "SALE"
      ? "Comprar"
      : transactionType === "RENT"
        ? "Rentar"
        : "";

  const titleText = isMapView
    ? `Mapa de Propiedades${cityText}`
    : typeText
      ? `${typeText}${cityText}`
      : `Propiedades${cityText}`;

  const description = isMapView
    ? `Explora propiedades en un mapa interactivo${cityText}. Busca casas, apartamentos y más${typeText ? ` para ${typeText.toLowerCase()}` : ""}.`
    : `Explora miles de propiedades disponibles${cityText}. Busca casas, apartamentos y más${typeText ? ` para ${typeText.toLowerCase()}` : ""}.`;

  return {
    title: `${titleText} | InmoApp`,
    description,
    openGraph: {
      type: "website",
      url: `https://inmoapp.com/propiedades`,
      title: `${titleText} | InmoApp`,
      description,
    },
  };
}

export default async function PropiedadesPage(props: PropiedadesPageProps) {
  const searchParams = await props.searchParams;

  // Determine which view to render (default: list)
  const view = Array.isArray(searchParams.view)
    ? searchParams.view[0]
    : searchParams.view;
  const isMapView = view === "map";

  // Parse filters from URL (used by both views)
  const filters: PropertyFilters = parseFilterParams(searchParams);

  // Fetch current user (needed for auth state)
  const currentUser = await getCurrentUser();

  // CONDITIONAL DATA FETCHING based on view
  if (isMapView) {
    // =========================================================================
    // MAP VIEW: Fetch data for BOTH list and map (needed for split view)
    // =========================================================================

    // Parse map bounds from URL
    const displayBounds = parseBoundsParams(searchParams);

    // Get page number for list side (default: 1)
    const page = Math.max(1, Number(searchParams.page) || 1);
    const pageSize = 12; // Properties per page in list

    // Fetch both list data (paginated) and map data (all properties) in parallel
    const [
      { properties: listProperties, total },
      { properties: allProperties },
      { minPrice: priceRangeMin, maxPrice: priceRangeMax },
      priceDistribution,
    ] = await Promise.all([
      // List data (paginated)
      getPropertiesList({
        filters: {
          ...filters,
          status: "AVAILABLE",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      // Map data (all properties for map display)
      propertyRepository.list({
        filters: {
          ...filters,
          status: "AVAILABLE",
        },
        take: 1000,
      }),
      // Price range for filters
      propertyRepository.getPriceRange(filters),
      // Price distribution for map
      propertyRepository.getPriceDistribution({
        filters,
      }),
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(total / pageSize);

    // Type assertion: SerializedProperty[] → MapProperty[]
    const mapProperties =
      allProperties as unknown as import("@/components/map/map-view").MapProperty[];

    return (
      <>
        {/* Initialize auth store */}
        <AuthStoreInitializer user={currentUser} />

        {/* Initialize property grid store (for list side of split view) */}
        <PropertyGridStoreInitializer
          properties={listProperties}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          filters={filters}
        />

        {/* Initialize map store (for map side of split view) */}
        <MapStoreInitializer
          properties={mapProperties}
          priceDistribution={priceDistribution}
          priceRangeMin={priceRangeMin}
          priceRangeMax={priceRangeMax}
          filters={filters as FilterState}
        />

        {/* RESPONSIVE RENDERING:
            - Desktop (≥1024px): Split View (50/50 list + map)
            - Mobile (<1024px): Full-screen map only */}

        {/* Desktop: Split View */}
        <div className="hidden lg:block">
          <PropertySplitView />
        </div>

        {/* Mobile: Full-screen map */}
        <div className="lg:hidden">
          <MapPageClient
            initialBounds={displayBounds ?? undefined}
            totalProperties={total}
            filters={filters}
          />
        </div>
      </>
    );
  } else {
    // =========================================================================
    // LIST VIEW (default): Fetch data for grid display with pagination
    // =========================================================================

    // Get page number (default: 1)
    const page = Math.max(1, Number(searchParams.page) || 1);
    const pageSize = 12; // Properties per page

    // Fetch paginated list data, full data for filters, and price stats in parallel
    const [
      { properties, total },
      { properties: allPropertiesForFilters },
      { minPrice: priceRangeMin, maxPrice: priceRangeMax },
      priceDistribution,
    ] = await Promise.all([
      // 1. Paginated properties for the current page view
      getPropertiesList({
        filters: {
          ...filters,
          status: "AVAILABLE",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      // 2. All properties matching filters (for client-side filter controls)
      propertyRepository.list({
        filters: {
          ...filters,
          status: "AVAILABLE",
        },
        take: 1000, // Capped at 1000 for performance
      }),
      // 3. Price range for the filter slider
      propertyRepository.getPriceRange({
        ...filters,
        status: "AVAILABLE",
      }),
      // 4. Price distribution for the histogram in filters
      propertyRepository.getPriceDistribution({
        filters: {
          ...filters,
          status: "AVAILABLE",
        },
      }),
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(total / pageSize);

    // Type assertion for map properties
    const mapProperties =
      allPropertiesForFilters as unknown as import("@/components/map/map-view").MapProperty[];

    return (
      <>
        {/* Initialize auth store */}
        <AuthStoreInitializer user={currentUser} />

        {/* Initialize property grid store with fetched data */}
        <PropertyGridStoreInitializer
          properties={properties}
          total={total}
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          filters={filters}
        />

        {/* Initialize map store (needed for FilterBar to work) */}
        <MapStoreInitializer
          properties={mapProperties} // Pass all properties for filter controls
          priceDistribution={priceDistribution}
          priceRangeMin={priceRangeMin}
          priceRangeMax={priceRangeMax}
          filters={filters as FilterState}
        />

        {/* Render list view */}
        <PropertyGridPage />
      </>
    );
  }
}
