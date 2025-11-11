/**
 * Properties Listing Page
 *
 * Grid/List view of all available properties with filtering and pagination
 * SEO-optimized page that complements the map view at /mapa
 *
 * FEATURES:
 * - Server-side filtering and pagination
 * - SEO metadata (dynamic title/description by city)
 * - Responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
 * - Full filter sidebar (price, location, category, specs)
 * - Pagination for browsing multiple pages
 * - View toggle to switch to map view
 * - URL parameter preservation across pagination
 *
 * ARCHITECTURE:
 * - Server Component: Handles data fetching, filtering, pagination
 * - Client Components: Interactive filters, grid layout, pagination
 * - Reuses existing PropertyCard component from homepage
 */

import { getCurrentUser } from "@/lib/auth";
import { parseFilterParams } from "@/lib/utils/url-helpers";
import {
  type PropertyFilters,
  propertyRepository,
  serializeProperties,
} from "@repo/database";
import type { Metadata } from "next";
import { PropertyGridPage } from "@/components/properties/property-grid-page";

interface PropiedadesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Generate dynamic SEO metadata based on filters
 * Examples:
 * - /propiedades → "Propiedades en Venta y Arriendo | InmoApp"
 * - /propiedades?city=Cuenca → "Propiedades en Cuenca | InmoApp"
 * - /propiedades?city=Cuenca&transactionType=SALE → "Casas en Venta en Cuenca | InmoApp"
 */
export async function generateMetadata(
  props: PropiedadesPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const city = Array.isArray(searchParams.city)
    ? searchParams.city[0]
    : searchParams.city;
  const transactionType = Array.isArray(searchParams.transactionType)
    ? searchParams.transactionType[0]
    : searchParams.transactionType;

  const cityText = city ? ` en ${city}` : "";
  const typeText =
    transactionType === "SALE" ? "Comprar" : transactionType === "RENT" ? "Rentar" : "";
  const titleText = typeText ? `${typeText}${cityText}` : `Propiedades${cityText}`;

  return {
    title: `${titleText} | InmoApp`,
    description: `Explora miles de propiedades disponibles${cityText}. Busca casas, apartamentos y más${typeText ? ` para ${typeText.toLowerCase()}` : ""}.`,
    openGraph: {
      type: "website",
      url: `https://inmoapp.com/propiedades`,
      title: `${titleText} | InmoApp`,
      description: `Explora miles de propiedades disponibles${cityText}.`,
    },
  };
}

export default async function PropiedadesPage(props: PropiedadesPageProps) {
  const searchParams = await props.searchParams;

  // Parse filters from URL
  const filters: PropertyFilters = parseFilterParams(searchParams);

  // Get page number (default: 1)
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 12; // Properties per page

  // Fetch user and properties in parallel
  const [currentUser, { properties, total }] = await Promise.all([
    getCurrentUser(),
    propertyRepository.list({
      filters: {
        ...filters,
        status: "AVAILABLE",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Serialize properties (Decimal → number)
  const serialized = serializeProperties(properties);

  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <PropertyGridPage
      properties={serialized}
      currentPage={page}
      totalPages={totalPages}
      total={total}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
    />
  );
}
