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

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  parseFilterParams,
  buildFilterUrl,
} from "@/lib/utils/url-helpers";
import type { DynamicFilterParams } from "@/lib/utils/url-helpers";
import type { TransactionType, PropertyCategory } from "@repo/database";

export interface MapFiltersState {
  transactionType?: TransactionType[];
  category?: PropertyCategory[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

/**
 * Hook to manage map filter state synced with URL
 * @returns Object with current filters and update functions
 */
export function useMapFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const currentParams = parseFilterParams(searchParams);

  // Normalize to arrays for multi-select
  const filters: MapFiltersState = {
    transactionType: currentParams.transactionType
      ? Array.isArray(currentParams.transactionType)
        ? (currentParams.transactionType as TransactionType[])
        : ([currentParams.transactionType] as TransactionType[])
      : undefined,
    category: currentParams.category
      ? Array.isArray(currentParams.category)
        ? (currentParams.category as PropertyCategory[])
        : ([currentParams.category] as PropertyCategory[])
      : undefined,
    minPrice: currentParams.minPrice,
    maxPrice: currentParams.maxPrice,
    bedrooms: currentParams.bedrooms,
    bathrooms: currentParams.bathrooms,
  };

  // Update filter and sync to URL
  // IMPORTANT: Do NOT preserve bounds when filters change
  // Bounds should only be set by the map viewport, not by filter changes
  // This prevents filters from being limited to old viewport bounds
  const updateFilters = useCallback(
    (newFilters: Partial<MapFiltersState>) => {
      // Merge with existing filters
      const updated: DynamicFilterParams = {
        ...currentParams,
        ...newFilters,
      };

      // Build new URL with updated filters ONLY
      // Do NOT include bounds - let the server fetch all properties matching filters
      const filterString = buildFilterUrl(updated);

      // Update URL without reloading (replace to clear bounds)
      router.replace(`/mapa${filterString ? `?${filterString}` : ""}`);
    },
    [currentParams, router]
  );

  // Toggle transaction type
  const toggleTransactionType = useCallback(
    (type: TransactionType) => {
      const current = filters.transactionType || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];

      updateFilters({
        transactionType: updated.length > 0 ? updated : undefined,
      });
    },
    [filters.transactionType, updateFilters]
  );

  // Set single category or toggle (deprecated - use setCategories)
  const setCategory = useCallback(
    (category: PropertyCategory) => {
      // Toggle: if already selected, deselect; otherwise select
      const current = filters.category || [];
      const updated = current.includes(category)
        ? []
        : [category];

      updateFilters({
        category: updated.length > 0 ? updated : undefined,
      });
    },
    [filters.category, updateFilters]
  );

  // Set multiple categories (for multi-select dropdowns)
  const setCategories = useCallback(
    (categories: PropertyCategory[]) => {
      updateFilters({
        category: categories.length > 0 ? categories : undefined,
      });
    },
    [updateFilters]
  );

  // Set price range
  const setPriceRange = useCallback(
    (minPrice?: number, maxPrice?: number) => {
      updateFilters({
        minPrice,
        maxPrice,
      });
    },
    [updateFilters]
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
      filters.bathrooms
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
