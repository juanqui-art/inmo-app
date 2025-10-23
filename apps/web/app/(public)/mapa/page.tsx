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

import { MapView } from "@/components/map/map-view";
import {
  parseBoundsParams,
  boundsToViewport,
  parseFilterParams,
  dynamicFiltersToPropertyFilters,
} from "@/lib/utils/url-helpers";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import { propertyRepository, serializeProperties } from "@repo/database";
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

  // Query properties from database using bounds + filters
  const { properties: dbProperties } = await propertyRepository.findInBounds({
    minLatitude: bounds.sw_lat,
    maxLatitude: bounds.ne_lat,
    minLongitude: bounds.sw_lng,
    maxLongitude: bounds.ne_lng,
    filters: repositoryFilters as any, // Type assertion for flexibility
    take: 1000,
  });

  // Serialize Prisma Decimal types to numbers for Client Component
  const properties = serializeProperties(dbProperties);

  /**
   * Render map with real database properties and viewport from URL
   */
  return <MapView properties={properties} initialViewport={viewport} />;
}

/**
 * REVALIDATION STRATEGY
 *
 * Revalidate every 5 minutes
 *
 * WHY 5 minutes?
 * - Properties don't change every second
 * - Balance between fresh data and performance
 * - Reduces database load
 * - Most users see cached version
 *
 * ALTERNATIVES:
 * - revalidate = 0: Always fresh (no cache) - Too expensive
 * - revalidate = 60: Very fresh (1 min) - Still aggressive
 * - revalidate = 3600: Very cached (1 hour) - May be stale
 * - revalidate = false: Cache forever - Bad for dynamic data
 */
export const revalidate = 300; // 5 minutes

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
