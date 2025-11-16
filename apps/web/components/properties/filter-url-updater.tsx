"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMapStore } from "@/stores/map-store";
import { useDebounce } from "@/hooks/use-debounce";
import { propertyFiltersAreEqual } from "@/lib/utils/filters-are-equal";

/**
 * FilterURLUpdater Component
 *
 * This client component is the glue between the client-side filter state
 * (managed in MapStore) and the server-side data fetching that is driven
 * by URL search parameters.
 *
 * HOW IT WORKS:
 * 1. It listens to filter changes in the `useMapStore`.
 * 2. It debounces these changes to prevent excessive URL updates while the
 *    user is interacting with sliders or typing.
 * 3. When the debounced filters change, it compares them to the current
 *    filters in the URL's search parameters.
 * 4. If the filters are different, it constructs a new query string and
 *    uses `router.push` to update the URL.
 * 5. This URL change triggers a new server-side data fetch in the
 *    `PropiedadesPage` server component, which re-renders with the
 *    newly filtered and paginated data.
 *
 * This pattern is a standard and robust way to handle filtering in the
 * Next.js App Router, combining client-side state management with
 * server-side data fetching.
 */
export function FilterUrlUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters, isReady } = useMapStore();

  // Debounce the filters from the store to avoid rapid-fire URL updates
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    // Only run if the store is ready and has been initialized
    if (!isReady) {
      return;
    }

    const currentParams = new URLSearchParams(searchParams.toString());
    const newParams = new URLSearchParams();

    // Preserve existing non-filter params (like 'view' or 'page')
    for (const [key, value] of currentParams.entries()) {
      if (!Object.keys(debouncedFilters).includes(key)) {
        newParams.set(key, value);
      }
    }
    
    // Reset page to 1 when filters change
    newParams.set("page", "1");

    // Add the new filter values
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => newParams.append(key, v.toString()));
        } else {
          newParams.set(key, value.toString());
        }
      }
    });

    // Only push to router history if the parameters have actually changed
    if (newParams.toString() !== currentParams.toString()) {
       // Do a final check to ensure the filter values are actually different,
       // not just the object reference.
       const currentFiltersFromUrl = Object.fromEntries(currentParams.entries());
       if(!propertyFiltersAreEqual(debouncedFilters, currentFiltersFromUrl)) {
         router.push(`${pathname}?${newParams.toString()}`);
       }
    }
  }, [debouncedFilters, isReady, pathname, router, searchParams]);

  return null; // This component renders nothing
}
