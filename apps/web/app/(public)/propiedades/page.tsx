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

import dynamic from "next/dynamic";
import MapStoreInitializer from "@/components/map/map-store-initializer";
import { PropertyGridPage } from "@/components/properties/property-grid-page";
import { getCurrentUser } from "@/lib/auth";

// Lazy load map components (only needed when view=map)
// Reduces initial bundle size by ~400KB (Mapbox GL JS)
const MapPageClient = dynamic(
  () =>
    import("@/components/map/map-page-client").then((mod) => ({
      default: mod.MapPageClient,
    })),
  {
    loading: () => (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    ),
    ssr: false, // Map requires browser APIs
  }
);

const PropertySplitView = dynamic(
  () =>
    import("@/components/properties/property-split-view").then((mod) => ({
      default: mod.PropertySplitView,
    })),
  {
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Cargando vista dividida...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);
import { toMapProperties } from "@/lib/utils/property-mappers";
import { parseBoundsParams, parseFilterParams } from "@/lib/utils/url-helpers";
import AuthStoreInitializer from "@/stores/AuthStoreInitializer";
import PropertyGridStoreInitializer from "@/stores/PropertyGridStoreInitializer";
import {
    getPropertiesList,
    type PropertyFilters,
    propertyRepository,
} from "@repo/database";
import type { Metadata } from "next";

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

  // Convert PropertyFilters to FilterState (for map store)
  const filterState: import("@/stores/map-store").FilterState = {
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    category: Array.isArray(filters.category)
      ? (filters.category as string[])
      : filters.category
        ? [filters.category]
        : undefined,
    bedrooms: filters.bedrooms,
    bathrooms: filters.bathrooms,
    transactionType: Array.isArray(filters.transactionType)
      ? (filters.transactionType as string[])
      : filters.transactionType
        ? [filters.transactionType]
        : undefined,
    city: filters.city,
  };

  // Fetch current user (needed for auth state)
  const currentUser = await getCurrentUser();

  // Common params
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12;
  const displayBounds = isMapView ? parseBoundsParams(searchParams) : null;

  // Unified Data Fetching
  // We fetch:
  // 1. Paginated list (for grid view)
  // 2. Map/Filter properties (for map pins OR client-side filter stats)
  // 3. Price stats (for filter sliders)
  const [
    { properties: listProperties, total },
    { properties: mapOrFilterProperties },
    { minPrice: priceRangeMin, maxPrice: priceRangeMax },
    priceDistribution,
  ] = await Promise.all([
    // 1. List data (always paginated)
    getPropertiesList({
      filters: {
        ...filters,
        status: "AVAILABLE",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    // 2. Map/Filter data (context dependent)
    isMapView && displayBounds
      ? // OPTIMIZED: Fetch only properties within map viewport bounds
        propertyRepository.findInBounds({
          minLatitude: displayBounds.sw_lat,
          maxLatitude: displayBounds.ne_lat,
          minLongitude: displayBounds.sw_lng,
          maxLongitude: displayBounds.ne_lng,
          filters: {
            ...filters,
            status: "AVAILABLE",
          },
          take: 1000,
        })
      : // FALLBACK / LIST VIEW: Fetch properties for filters (capped)
        propertyRepository.list({
          filters: {
            ...filters,
            status: "AVAILABLE",
          },
          take: 1000,
        }),
    // 3. Price range
    propertyRepository.getPriceRange({
      ...filters,
      status: "AVAILABLE",
    }),
    // 4. Price distribution
    propertyRepository.getPriceDistribution({
      filters: {
        ...filters,
        status: "AVAILABLE",
      },
    }),
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);

  // Convert SerializedProperty[] to MapProperty[] using type-safe mapper
  const mapProperties = toMapProperties(mapOrFilterProperties);

  return (
    <>
      {/* Initialize auth store */}
      <AuthStoreInitializer user={currentUser} />

      {/* Initialize property grid store (for list view / list side) */}
      <PropertyGridStoreInitializer
        properties={listProperties}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        filters={filters}
      />

      {/* Initialize map store (for map view / filter bar) */}
      <MapStoreInitializer
        properties={mapProperties}
        priceDistribution={priceDistribution}
        priceRangeMin={priceRangeMin}
        priceRangeMax={priceRangeMax}
        filters={filterState}
      />

      {isMapView ? (
        <>
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
      ) : (
        /* List View */
        <PropertyGridPage />
      )}
    </>
  );
}
