"use client";

/**
 * PROPERTY GRID STORE (Zustand)
 *
 * Global state for property grid listing page (/propiedades)
 * Manages pagination, filter state, and property data.
 *
 * WHY ZUSTAND FOR THIS?
 * - Eliminates props drilling from page -> PropertyGridPage -> PropertyCard, PropertyGridPagination
 * - Decouples data fetching (Server Component) from component hierarchy (Client Components)
 * - Server Components fetch and serialize data, initializer hydrates this store
 * - Client components consume data directly from the store
 *
 * ARCHITECTURE:
 * 1. Server Component (/propiedades/page.tsx):
 *    - Fetches properties, calculates pagination
 *    - Passes data to PropertyGridStoreInitializer
 *
 * 2. Initializer (PropertyGridStoreInitializer.tsx):
 *    - "use client" component that hydrates the store with fetched data
 *    - Runs once on mount
 *
 * 3. Client Components:
 *    - usePropertyGridStore() to read from store
 *    - No props drilling needed
 */

import { create } from "zustand";
import type { SerializedProperty, PropertyFilters } from "@repo/database";

// ============================================================================
// TYPES
// ============================================================================

interface PropertyGridStoreState {
  // ========================================================================
  // DATA STATE (hydrated from Server Component)
  // ========================================================================

  /** All properties for current page */
  properties: SerializedProperty[];

  /** Total count of properties matching filters */
  total: number;

  /** Current page number (1-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Properties per page */
  pageSize: number;

  /** Whether store has been initialized */
  isInitialized: boolean;

  /** Whether properties are currently loading (during filter/page changes) */
  isLoading: boolean;

  // ========================================================================
  // FILTER STATE (synchronized with URL)
  // ========================================================================

  /** Active filters from URL params */
  filters: PropertyFilters;

  // ========================================================================
  // COMPUTED STATE (derived, read-only)
  // ========================================================================

  /** Derived: whether there are more pages after current */
  hasNextPage: () => boolean;

  /** Derived: whether there are pages before current */
  hasPrevPage: () => boolean;

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Initialize store with data from Server Component
   * Called once by PropertyGridStoreInitializer after fetch
   */
  initialize: (data: {
    properties: SerializedProperty[];
    total: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    filters: PropertyFilters;
  }) => void;

  /**
   * Update filters (typically when URL changes)
   * Resets pagination to page 1
   */
  setFilters: (filters: PropertyFilters) => void;

  /**
   * Clear all filters
   */
  clearAllFilters: () => void;

  /**
   * Set loading state (used when filters change and waiting for Server Component re-fetch)
   */
  setLoading: (loading: boolean) => void;
}

// ============================================================================
// STORE
// ============================================================================

export const usePropertyGridStore = create<PropertyGridStoreState>(
  (set, get) => ({
    // ========================================================================
    // INITIAL STATE
    // ========================================================================

    properties: [],
    total: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize: 12,
    isInitialized: false,
    isLoading: false,
    filters: {},

    // ========================================================================
    // COMPUTED STATE (read-only properties derived from state)
    // ========================================================================

    hasNextPage: () => {
      const { currentPage, totalPages } = get();
      return currentPage < totalPages;
    },

    hasPrevPage: () => {
      const { currentPage } = get();
      return currentPage > 1;
    },

    // ========================================================================
    // ACTIONS
    // ========================================================================

    /**
     * Hydrate store with data from Server Component
     * This is the initialization step called by PropertyGridStoreInitializer
     */
    initialize: (data) =>
      set({
        properties: data.properties,
        total: data.total,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        pageSize: data.pageSize,
        filters: data.filters,
        isInitialized: true,
      }),

    /**
     * Update filters (typically called when URL changes)
     * In /propiedades, filters change immediately via router.push()
     * This action is for synchronizing the store when URL params change
     */
    setFilters: (filters) =>
      set({
        filters,
        currentPage: 1, // Reset to page 1 when filters change
      }),

    /**
     * Clear all filters and reset to page 1
     */
    clearAllFilters: () =>
      set({
        filters: {},
        currentPage: 1,
      }),

    /**
     * Set loading state for skeleton display
     * Called when filters change (before router.push) and when data arrives (after initialize)
     */
    setLoading: (loading) =>
      set({
        isLoading: loading,
      }),
  }),
);
