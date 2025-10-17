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

export default async function MapPage() {
  /**
   * MOCK DATA for testing
   * TODO: Replace with real database query when ready
   */
  const properties = [
    {
      id: "1",
      title: "Casa moderna en El Ejido",
      price: 185000,
      transactionType: "SALE" as const,
      category: "HOUSE" as const,
      bedrooms: 3,
      bathrooms: 2.5,
      area: 180,
      city: "Cuenca",
      state: "Azuay",
      latitude: -2.8995,
      longitude: -79.0044,
      images: [],
    },
    {
      id: "2",
      title: "Departamento en Yanuncay",
      price: 95000,
      transactionType: "SALE" as const,
      category: "APARTMENT" as const,
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      city: "Cuenca",
      state: "Azuay",
      latitude: -2.8875,
      longitude: -79.0125,
      images: [],
    },
    {
      id: "3",
      title: "Villa de lujo en Monay",
      price: 320000,
      transactionType: "SALE" as const,
      category: "VILLA" as const,
      bedrooms: 4,
      bathrooms: 3.5,
      area: 350,
      city: "Cuenca",
      state: "Azuay",
      latitude: -2.9145,
      longitude: -78.9875,
      images: [],
    },
    {
      id: "4",
      title: "Suite en Centro Histórico",
      price: 450,
      transactionType: "RENT" as const,
      category: "SUITE" as const,
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      city: "Cuenca",
      state: "Azuay",
      latitude: -2.9005,
      longitude: -79.0035,
      images: [],
    },
    {
      id: "5",
      title: "Penthouse Av. Remigio Crespo",
      price: 245000,
      transactionType: "SALE" as const,
      category: "PENTHOUSE" as const,
      bedrooms: 3,
      bathrooms: 3,
      area: 220,
      city: "Cuenca",
      state: "Azuay",
      latitude: -2.9115,
      longitude: -79.0095,
      images: [],
    },
    {
      id: "6",
      title: "Casa colonial en Gualaceo",
      price: 125000,
      transactionType: "SALE" as const,
      category: "HOUSE" as const,
      bedrooms: 4,
      bathrooms: 2,
      area: 200,
      city: "Gualaceo",
      state: "Azuay",
      latitude: -2.8942,
      longitude: -78.7808,
      images: [],
    },
    {
      id: "7",
      title: "Taller artesanal en Chordeleg",
      price: 800,
      transactionType: "RENT" as const,
      category: "COMMERCIAL" as const,
      bedrooms: 0,
      bathrooms: 1,
      area: 90,
      city: "Chordeleg",
      state: "Azuay",
      latitude: -2.9711,
      longitude: -78.7614,
      images: [],
    },
    {
      id: "8",
      title: "Quinta con vista al río en Paute",
      price: 280000,
      transactionType: "SALE" as const,
      category: "FARM" as const,
      bedrooms: 5,
      bathrooms: 3,
      area: 500,
      city: "Paute",
      state: "Azuay",
      latitude: -2.7761,
      longitude: -78.7533,
      images: [],
    },
  ];

  /**
   * Mock data is already serialized (plain numbers)
   * Center map on Cuenca, Ecuador
   */
  const initialCenter: [number, number] = [-79.0044, -2.8995]; // Cuenca

  /**
   * Render map with mock properties
   */
  return <MapView properties={properties} initialCenter={initialCenter} />;
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
 * FUTURE ENHANCEMENTS:
 *
 * 1. Bounds Fitting:
 *    Calculate optimal zoom to show all markers
 *    const bounds = getBoundsFromProperties(properties)
 *
 * 2. URL State:
 *    Save viewport in URL query params
 *    /mapa?lat=-2.9&lng=-79.0&zoom=12
 *
 * 3. Server-Side Filtering:
 *    Accept search params for pre-filtering
 *    const searchParams = await props.searchParams
 *    const filtered = filterProperties(properties, searchParams)
 *
 * 4. Analytics:
 *    Track which areas users explore most
 *    Track which properties get clicked on map
 *
 * 5. Prefetching:
 *    Prefetch property details on marker hover
 *    Faster navigation to property page
 */
