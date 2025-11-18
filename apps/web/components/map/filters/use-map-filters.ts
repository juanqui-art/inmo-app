"use client";

/**
 * use-map-filters Hook
 *
 * Manages filter state and syncs with URL query parameters
 * - Parses current URL filters
 * - Provides methods to update individual filters
 * - Syncs changes back to URL
 * - Handles clearing all filters
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  buildFilterUrl,
  type DynamicFilterParams,
  PROPERTY_CATEGORIES,
  parseFilterParams,
  TRANSACTION_TYPES,
} from "@/lib/utils/url-helpers";

/**
 * Type aliases for filter arrays parsed from URL
 * These are guaranteed to be arrays or undefined by the FilterSchema
 */
type TransactionTypeFilter = (typeof TRANSACTION_TYPES)[number][] | undefined;
type CategoryFilter = (typeof PROPERTY_CATEGORIES)[number][] | undefined;

/**
 * Hook to manage map filter state synced with URL
 * @returns Object with current filters and update functions
 */
export function useMapFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL. The parser now handles normalization.
  const filters = parseFilterParams(searchParams);

  // Update filter and sync to URL
  // IMPORTANT: Do NOT preserve bounds when filters change
  // Bounds should only be set by the map viewport, not by filter changes
  // This prevents filters from being limited to old viewport bounds
  const updateFilters = useCallback(
    (newFilters: Partial<DynamicFilterParams>) => {
      // Merge with existing filters
      const updated: DynamicFilterParams = {
        ...filters,
        ...newFilters,
      };

      // Build new URL with updated filters ONLY
      // Do NOT include bounds - let the server fetch all properties matching filters
      const filterString = buildFilterUrl(updated);

      // Update URL without reloading (replace to clear bounds)
      router.replace(`/mapa${filterString ? `?${filterString}` : ""}`);
    },
    [filters, router],
  );

  // Toggle transaction type
  const toggleTransactionType = useCallback(
    (type: string) => {
      // Type guard: ensure transactionType is an array (FilterSchema always parses to array)
      const current = (filters.transactionType as TransactionTypeFilter) || [];

      // Validate that type is a valid transaction type
      // Type assertion is safe here because TRANSACTION_TYPES.includes validates the enum value
      const validType = TRANSACTION_TYPES.includes(type as any)
        ? (type as (typeof TRANSACTION_TYPES)[number])
        : null;
      if (!validType) return;

      const updated: (typeof TRANSACTION_TYPES)[number][] = current.includes(
        validType,
      )
        ? current.filter((t) => t !== validType)
        : [...current, validType];

      updateFilters({
        transactionType: updated.length > 0 ? updated : undefined,
      });
    },
    [filters.transactionType, updateFilters],
  );

  /**
   * @deprecated Use `setCategories` for multi-select support.
   */
  const setCategory = useCallback(
    (category: string) => {
      // Type guard: ensure category is an array (FilterSchema always parses to array)
      const current = (filters.category as CategoryFilter) || [];

      // Validate that category is a valid property category
      // Type assertion is safe here because PROPERTY_CATEGORIES.includes validates the enum value
      const validCategory = PROPERTY_CATEGORIES.includes(category as any)
        ? (category as (typeof PROPERTY_CATEGORIES)[number])
        : null;
      if (!validCategory) return;

      // Toggle: if already selected, deselect; otherwise select
      const updated: (typeof PROPERTY_CATEGORIES)[number][] = current.includes(
        validCategory,
      )
        ? []
        : [validCategory];

      updateFilters({
        category: updated.length > 0 ? updated : undefined,
      });
    },
    [filters.category, updateFilters],
  );

  // Set multiple categories (for multi-select dropdowns)
  const setCategories = useCallback(
    (categories: string[]) => {
      // Validate all categories
      const validCategories = categories.filter((cat) =>
        PROPERTY_CATEGORIES.includes(cat as any),
      ) as (typeof PROPERTY_CATEGORIES)[number][];

      updateFilters({
        category: validCategories.length > 0 ? validCategories : undefined,
      });
    },
    [updateFilters],
  );

  // Set price range
  const setPriceRange = useCallback(
    (minPrice?: number, maxPrice?: number) => {
      updateFilters({
        minPrice,
        maxPrice,
      });
    },
    [updateFilters],
  );

  // Clear all filters
  // IMPORTANT: Also clear bounds to show all properties
  // This allows the server to fetch all properties without viewport restrictions
  const clearFilters = useCallback(() => {
    // Reset to base map URL with no filters and no bounds
    router.replace(`/mapa`);
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.transactionType ||
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.bedrooms ||
      filters.bathrooms,
  );

  return {
    filters,
    updateFilters,
    toggleTransactionType,
    setCategory,
    setCategories,
    setPriceRange,
    clearFilters,
    hasActiveFilters,
  };
}
