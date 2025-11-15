"use client";

/**
 * URL ↔ Zustand Filter Sync Hook
 *
 * Bidirectional synchronization between URL query parameters and Zustand store.
 *
 * RESPONSIBILITIES:
 * - Parses URL searchParams and syncs to store (when URL changes)
 * - Listens to store filter changes and updates URL (when filters change)
 * - Prevents circular updates and unnecessary syncs
 *
 * USAGE:
 * In your page.tsx or a client component that wraps FilterBar:
 *
 * ```tsx
 * 'use client'
 * export default function MapPage() {
 *   useFilterUrlSync()
 *   return <MapPageClient />
 * }
 * ```
 *
 * BENEFITS:
 * - Single source of truth: Zustand store
 * - URL stays in sync automatically
 * - No props drilling needed
 * - Clean separation: components handle state, hook handles URL
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseFilterParams, buildFilterUrl } from "@/lib/utils/url-helpers";
import type { DynamicFilterParams } from "@/lib/utils/url-helpers";
import { useMapStore } from "@/stores/map-store";

/**
 * Hook to sync filter state between URL and Zustand store
 * Should be called once at the page level, not in components
 */
export function useFilterUrlSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Store access
  const filters = useMapStore((state) => state.filters);
  const setFilters = useMapStore((state) => state.setFilters);

  // Refs to prevent circular updates
  const isInitializedRef = useRef(false);
  const lastUrlRef = useRef<string>("");
  const lastFiltersRef = useRef(filters);

  // =========================================================================
  // EFFECT 1: Sync URL → Store (when URL changes)
  // =========================================================================
  useEffect(() => {
    // On mount, parse URL and sync to store
    if (!isInitializedRef.current) {
      const urlFilters = parseFilterParams(searchParams);

      // Convert to store format
      setFilters({
        minPrice: urlFilters.minPrice,
        maxPrice: urlFilters.maxPrice,
        category: urlFilters.category as any,
        bedrooms: urlFilters.bedrooms,
        bathrooms: urlFilters.bathrooms,
        transactionType: urlFilters.transactionType as any,
        city: urlFilters.city,
      });

      isInitializedRef.current = true;
      lastUrlRef.current = window.location.search;
    }

    // Check if URL changed (not triggered by our sync)
    const currentUrl = window.location.search;
    if (currentUrl !== lastUrlRef.current) {
      const urlFilters = parseFilterParams(searchParams);

      setFilters({
        minPrice: urlFilters.minPrice,
        maxPrice: urlFilters.maxPrice,
        category: urlFilters.category as any,
        bedrooms: urlFilters.bedrooms,
        bathrooms: urlFilters.bathrooms,
        transactionType: urlFilters.transactionType as any,
        city: urlFilters.city,
      });

      lastUrlRef.current = currentUrl;
    }
  }, [searchParams, setFilters]);

  // =========================================================================
  // EFFECT 2: Sync Store → URL (when filters change)
  // =========================================================================
  useEffect(() => {
    if (!isInitializedRef.current) return;

    // Check if filters actually changed
    const filtersChanged =
      JSON.stringify(lastFiltersRef.current) !== JSON.stringify(filters);

    if (filtersChanged) {
      lastFiltersRef.current = filters;

      // Build URL from filters
      const urlParams: DynamicFilterParams = {
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        category: filters.category as any,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        transactionType: filters.transactionType as any,
        city: filters.city,
      };

      const filterString = buildFilterUrl(urlParams);

      // Preserve current view parameter if it exists
      const currentView = searchParams.get("view");
      const viewParam = currentView ? `view=${currentView}` : "";

      // Combine view param with filter params
      const allParams = [viewParam, filterString]
        .filter(Boolean)
        .join("&");

      const newUrl = `${pathname}${allParams ? `?${allParams}` : ""}`;

      // Update URL and trigger Server Component re-render with scroll preservation
      router.push(newUrl, { scroll: false });
      lastUrlRef.current = `?${allParams || ""}`;
    }
  }, [filters, router, pathname, searchParams]);
}
