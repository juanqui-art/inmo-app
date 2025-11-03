/**
 * Map Page - Exploration-First Property Discovery
 *
 * PATTERN: Server Component with Client Component Map
 *
 * WHY Server Component?
 * - Data fetching at request time (fresh data)
 * - Database queries server-side (no API layer)
 * - SEO optimization (metadata)
 * - Zero JavaScript for data fetching
 *
 * ARCHITECTURE:
 * Server Component (this file):
 * - Fetch properties with valid coordinates
 * - Serialize Decimal fields
 * - Pass data to Client Component
 *
 * Client Component (MapView):
 * - Render interactive map
 * - Handle user interactions
 * - Manage viewport state
 *
 * WHY this approach?
 * - Best of both: Server data fetching + Client interactivity
 * - Performance: No client-side data fetching delay
 * - Type-safe: Shared types between server and client
 *
 * ALTERNATIVE 1: Full Client Component with useEffect
 * ❌ Slower: Client renders → useEffect → fetch → re-render
 * ❌ Bad SEO: Content not in initial HTML
 * ❌ More code: API route needed
 *
 * ALTERNATIVE 2: Server Component only
 * ❌ No interactivity: Can't have map controls
 * ❌ Can't use MapBox GL: Requires browser APIs
 *
 * ✅ We chose Server + Client because:
 * - Fast initial load (server data)
 * - Rich interactivity (client map)
 * - Good SEO (server rendered)
 * - Industry standard (Airbnb, Zillow pattern)
 */

import { MapSearchIntegration } from "@/components/map/map-search-integration";
import {
  parseBoundsParams,
  boundsToViewport,
  parseFilterParams,
  dynamicFiltersToPropertyFilters,
} from "@/lib/utils/url-helpers";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import {
  getCachedPropertiesByBounds,
  validateBoundsParams,
} from "@/lib/cache/properties-cache";
import { getCachedPriceDistribution } from "@/lib/cache/price-distribution-cache";
import {
  calculateBounds,
  boundsToMapBoxFormat,
} from "@/lib/utils/map-bounds";
import { getCurrentUser } from "@/lib/auth";
import { propertyRepository } from "@repo/database";
import type { Metadata } from "next";

/**
 * Metadata for SEO
 */
export const metadata: Metadata = {
  title: "Mapa de Propiedades | InmoApp",
  description:
    "Explora propiedades en venta y arriendo en un mapa interactivo. Encuentra tu hogar ideal navegando por ubicación.",
  keywords: [
    "mapa de propiedades",
    "bienes raíces mapa",
    "propiedades por ubicación",
    "buscar propiedades mapa",
    "inmobiliaria mapa interactivo",
  ],
  openGraph: {
    title: "Mapa de Propiedades | InmoApp",
    description: "Explora propiedades en un mapa interactivo",
    type: "website",
  },
};

interface MapPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapPage(props: MapPageProps) {
  // Await searchParams (Next.js 15 requirement)
  const searchParams = await props.searchParams;

  /**
   * Detect if bounds are in URL
   * If NO bounds params → fetch all properties (initial load)
   * If YES bounds params → fetch within bounds (user navigated map)
   */
  const hasBoundsParams = (
    searchParams.ne_lat !== undefined &&
    searchParams.ne_lng !== undefined &&
    searchParams.sw_lat !== undefined &&
    searchParams.sw_lng !== undefined
  );

  /**
   * Parse bounds from URL or use defaults
   * Enables shareable map locations like: /mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05
   * Falls back to old viewport params for backward compatibility
   */
  const defaultViewport = {
    latitude: DEFAULT_MAP_CONFIG.AZUAY_CENTER.latitude,
    longitude: DEFAULT_MAP_CONFIG.AZUAY_CENTER.longitude,
    zoom: DEFAULT_MAP_CONFIG.DEFAULT_ZOOM,
  };

  // Parse bounds from URL (with fallback to old viewport params)
  const bounds = parseBoundsParams(searchParams, defaultViewport);

  // Convert bounds to viewport for map initialization
  const viewport = boundsToViewport(bounds);

  /**
   * DYNAMIC FILTERING IMPLEMENTATION
   *
   * 1. Parse bounds from URL (geographic filtering)
   * 2. Parse filter params from URL (user-applied filters)
   * 3. Query database for properties matching bounds + filters
   * 4. Serialize Decimal fields to numbers for client compatibility
   */

  // Parse filter parameters from URL
  const dynamicFilters = parseFilterParams(searchParams);

  // Convert URL filters to database format
  const repositoryFilters = dynamicFiltersToPropertyFilters(dynamicFilters);

  // Validate bounds before querying (prevents invalid coordinates)
  validateBoundsParams({
    minLatitude: bounds.sw_lat,
    maxLatitude: bounds.ne_lat,
    minLongitude: bounds.sw_lng,
    maxLongitude: bounds.ne_lng,
  });

  /**
   * CACHED QUERY: React.cache() + revalidateTag()
   *
   * This function:
   * 1. Deduplicates identical requests in the same render
   * 2. Caches results for 300s (ISR revalidate period)
   * 3. Can be invalidated with revalidateTag('properties-bounds')
   *
   * WHY? Each URL change (viewport pan/zoom) could trigger a new query.
   * Without cache: Every bounds change = new DB query (expensive).
   * With cache: Identical bounds = same cached data (free).
   *
   * EXAMPLE FLOW:
   * 1. User drags map → URL changes
   * 2. Server re-renders with new bounds
   * 3. getCachedPropertiesByBounds checks cache
   * 4. If bounds seen before: returns cached result (instant)
   * 5. If new bounds: queries DB once, caches result
   *
   * This prevents the renderización loops while keeping data fresh.
   *
   * INITIAL LOAD OPTIMIZATION:
   * If NO bounds in URL → fetch ALL properties (to show 100%)
   * If YES bounds in URL → fetch filtered by bounds (user navigated)
   */
  const { properties } = await getCachedPropertiesByBounds({
    minLatitude: hasBoundsParams ? bounds.sw_lat : -90,
    maxLatitude: hasBoundsParams ? bounds.ne_lat : 90,
    minLongitude: hasBoundsParams ? bounds.sw_lng : -180,
    maxLongitude: hasBoundsParams ? bounds.ne_lng : 180,
    filters: repositoryFilters as any, // Type assertion for flexibility
    take: 1000,
  });

  /**
   * Get current user for auth state
   * (used to show/hide auth modal in client components)
   */
  const currentUser = await getCurrentUser();

  /**
   * Fetch dynamic price range from database
   * Used to initialize price filter slider bounds
   * Considers current filters to provide contextual price ranges
   */
  const { minPrice, maxPrice } = await propertyRepository.getPriceRange(
    repositoryFilters
  );

  /**
   * Fetch price distribution for histogram
   * Ultra-lightweight query: ~30 rows vs 10,000 properties
   * Cache duration: 24h (distribution changes slowly)
   * Used to visualize property concentration in price ranges
   */
  const priceStats = await getCachedPriceDistribution();

  /**
   * Calculate initial bounds from ALL properties
   * This uses Mapbox native fitBounds to auto-fit viewport
   * Shows all 50 properties on initial load instead of default zoom
   *
   * WHY: Previous DEFAULT_ZOOM: 13 only showed 21/50 properties
   * SOLUTION: Calculate bounds from actual property coordinates
   * BENEFIT: Shows 100% of properties on initial map load
   */
  const propertyBounds = calculateBounds(properties);
  const initialBounds = propertyBounds
    ? boundsToMapBoxFormat(propertyBounds)
    : undefined;

  /**
   * Render map with real database properties and viewport from URL
   */
  return (
    <MapSearchIntegration
      properties={properties}
      initialBounds={initialBounds}
      initialViewport={viewport}
      isAuthenticated={!!currentUser}
      priceRangeMin={minPrice}
      priceRangeMax={maxPrice}
      priceDistribution={priceStats.distribution}
    />
  );
}

/**
 * CACHING STRATEGY
 *
 * Uses React.cache() for request deduplication within a render.
 *
 * HOW IT WORKS:
 * 1. getCachedPropertiesByBounds() wraps the DB query with React.cache()
 * 2. If user pans to same bounds: cache hit (no DB query)
 * 3. If user pans to different bounds: new DB query
 * 4. When agent creates/updates/deletes property:
 *    └─ revalidatePath('/mapa') clears the page cache
 * 5. Next visit to /mapa queries DB with fresh data
 *
 * BENEFITS:
 * ✅ Eliminates duplicate queries for identical bounds
 * ✅ Request deduplication within same render
 * ✅ Compatible with all Next.js 16 features (no experimental flags)
 * ✅ Data stays fresh with revalidatePath() invalidation
 *
 * NOTE: This is a stable approach using React.cache() without experimental
 * Cache Components (cacheTag/updateTag). When Next.js 16.1+ improves
 * Cache Components API, we can upgrade to updateTag() for finer control.
 */

/**
 * COMPLETED FEATURES:
 * ✅ URL State: Shareable map positions
 *    - Bounds syncs to URL (/mapa?ne_lat=-2.85&ne_lng=-78.95&sw_lat=-2.95&sw_lng=-79.05)
 *    - Browser history support (back/forward navigation)
 *    - Debounced updates (500ms) to avoid spam
 *    - Server-side viewport parsing from searchParams
 *
 * ✅ Smart Clustering
 *    - K-D tree spatial indexing with Supercluster
 *    - Dynamic bounds calculation for all zoom levels
 *    - Glassmorphism elegant visual design
 *
 * ✅ Real Database Integration
 *    - Properties fetched from PostgreSQL via Prisma
 *    - Filtered by geographic bounds (ne_lat, ne_lng, sw_lat, sw_lng)
 *    - Server-side data loading (no client-side fetch delay)
 *
 * ✅ Dynamic Filtering
 *    - Filter by transaction type (SALE, RENT)
 *    - Filter by category (HOUSE, APARTMENT, etc.)
 *    - Filter by price range (minPrice, maxPrice)
 *    - Filter by bedrooms, bathrooms, area
 *    - Text search (title, description, address)
 *    - All filters work in combination with bounds
 *
 * NEXT PRIORITIES:
 *
 * 1. Filter UI Sidebar:
 *    - Checkboxes for transactionType and category
 *    - Range sliders for price and area
 *    - Sync UI state ↔ URL params
 *    - Real-time updates as user changes filters
 *
 * 2. Multi-select Filters:
 *    - Allow selecting multiple transaction types (SALE AND RENT)
 *    - Allow selecting multiple categories
 *    - Update repository to support OR queries
 *
 * 3. Bounds Fitting:
 *    - Calculate optimal zoom to show all properties
 *    - getBoundsFromProperties(properties) helper
 *    - Auto-fit viewport when filters change
 *
 * 4. Analytics:
 *    - Track which areas users explore most
 *    - Track property marker clicks
 *    - Track search queries and filters used
 *
 * 5. Performance Optimizations:
 *    - Prefetch property details on marker hover
 *    - Cache filtering results (React Query / SWR)
 *    - Implement progressive loading for large datasets
 */
