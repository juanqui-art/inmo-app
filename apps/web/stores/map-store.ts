/**
 * MAP STORE (Zustand)
 *
 * Global state for map-related data, hydrated from Server Components.
 *
 * WHY ZUSTAND FOR THIS?
 * - Avoids prop drilling from page -> MapPageClient -> FilterBar -> Dropdowns.
 * - Decouples data fetching from component hierarchy.
 * - Server Components fetch data, a simple initializer component hydrates this store.
 * - Client components then consume data directly from the store.
 *
 * FILTER STATE MANAGEMENT:
 * - `filters`: Committed filter state (synced with URL)
 * - `draftFilters`: Ephemeral filter state (Realtor.com pattern: changes until "Done" is clicked)
 * - URL ↔ filters sync via middleware (see middleware section)
 */

"use client";

import { create } from "zustand";
import type { MapProperty } from "@/components/map/map-view";

// ============================================================================
// TYPES
// ============================================================================

export type PriceDistribution = { bucket: number; count: number }[];

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  category?: string[];
  bedrooms?: number[];
  bathrooms?: number[];
  transactionType?: string[];
}

interface MapStoreState {
  // ========================================================================
  // DATA STATE
  // ========================================================================
  properties: MapProperty[];
  priceDistribution: PriceDistribution;
  priceRangeMin?: number;
  priceRangeMax?: number;
  isInitialized: boolean;
  isLoading: boolean;

  // ========================================================================
  // FILTER STATE (committed)
  // ========================================================================
  filters: FilterState;

  // ========================================================================
  // DRAFT FILTER STATE (ephemeral, for "Realtor.com" pattern)
  // ========================================================================
  draftFilters: Partial<FilterState>;

  // ========================================================================
  // ACTIONS: Data Management
  // ========================================================================
  initialize: (data: {
    properties: MapProperty[];
    priceDistribution: PriceDistribution;
    priceRangeMin?: number;
    priceRangeMax?: number;
  }) => void;
  setIsLoading: (loading: boolean) => void;

  // ========================================================================
  // ACTIONS: Filter Management (committed state)
  // ========================================================================
  /**
   * Set committed filters (synced with URL)
   * Used when URL changes or when user confirms filter changes
   */
  setFilters: (filters: FilterState) => void;

  /**
   * Update specific filter field in committed state
   */
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;

  /**
   * Clear all committed filters and draft state
   */
  clearAllFilters: () => void;

  // ========================================================================
  // ACTIONS: Draft Filter Management (ephemeral state)
  // ========================================================================
  /**
   * Set draft filter state (temporary changes before confirmation)
   * Used during slider interaction, before "Done" button is clicked
   */
  setDraftFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => void;

  /**
   * Set multiple draft filters at once
   */
  setDraftFilters: (filters: Partial<FilterState>) => void;

  /**
   * Commit draft filters to committed state (typically on "Done" button)
   * Returns the committed filters for URL sync
   */
  commitDraftFilters: () => FilterState;

  /**
   * Reset draft filters to match committed state
   * Used when user cancels without confirming
   */
  resetDraftFilters: () => void;

  /**
   * Reset draft filters to default values
   * Used when user clicks "Clear Filter"
   */
  clearDraftFilters: () => void;
}

// ============================================================================
// STORE
// ============================================================================

export const useMapStore = create<MapStoreState>((set, get) => ({
  // ========================================================================
  // INITIAL STATE
  // ========================================================================

  properties: [],
  priceDistribution: [],
  priceRangeMin: 0,
  priceRangeMax: 2000000, // Default max, will be overwritten
  isInitialized: false,
  isLoading: false,
  filters: {}, // Committed filter state
  draftFilters: {}, // Ephemeral draft state

  // ========================================================================
  // ACTIONS: DATA MANAGEMENT
  // ========================================================================

  /**
   * Initializes the store with data fetched from a Server Component.
   * This is the hydration step.
   */
  initialize: (data) =>
    set({
      ...data,
      isInitialized: true,
      isLoading: false,
    }),

  /**
   * Manually sets the loading state.
   */
  setIsLoading: (loading) => set({ isLoading: loading }),

  // ========================================================================
  // ACTIONS: COMMITTED FILTER STATE
  // ========================================================================

  /**
   * Set all committed filters at once
   * This is typically called when URL changes
   */
  setFilters: (filters: FilterState) =>
    set({
      filters: {
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        category: filters.category,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        transactionType: filters.transactionType,
      },
    }),

  /**
   * Update a specific filter field in committed state
   */
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  /**
   * Clear all filters and draft state
   */
  clearAllFilters: () =>
    set({
      filters: {},
      draftFilters: {},
    }),

  // ========================================================================
  // ACTIONS: DRAFT FILTER STATE (Realtor.com pattern)
  // ========================================================================

  /**
   * Set a single draft filter value
   * Used during interactive changes (e.g., dragging a slider)
   */
  setDraftFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) =>
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        [key]: value,
      },
    })),

  /**
   * Set multiple draft filters at once
   */
  setDraftFilters: (filters: Partial<FilterState>) =>
    set((state) => ({
      draftFilters: {
        ...state.draftFilters,
        ...filters,
      },
    })),

  /**
   * Commit draft filters to committed state
   * Called when user clicks "Done" button
   * Returns the new committed filters for URL sync
   */
  commitDraftFilters: () => {
    const { draftFilters: draft, filters: current } = get();

    // Merge draft with current, only updating changed values
    const merged: FilterState = {
      minPrice:
        draft.minPrice !== undefined ? draft.minPrice : current.minPrice,
      maxPrice:
        draft.maxPrice !== undefined ? draft.maxPrice : current.maxPrice,
      // For arrays: empty array [] means "no filter" (equivalent to undefined)
      category: draft.category !== undefined
        ? (draft.category.length > 0 ? draft.category : undefined)
        : current.category,
      bedrooms:
        draft.bedrooms !== undefined
          ? (draft.bedrooms.length > 0 ? draft.bedrooms : undefined)
          : current.bedrooms,
      bathrooms:
        draft.bathrooms !== undefined
          ? (draft.bathrooms.length > 0 ? draft.bathrooms : undefined)
          : current.bathrooms,
      transactionType:
        draft.transactionType !== undefined
          ? (draft.transactionType.length > 0 ? draft.transactionType : undefined)
          : current.transactionType,
    };

    set({
      filters: merged,
      draftFilters: {}, // Clear draft after commit
    });

    return merged;
  },

  /**
   * Reset draft filters to match current committed state
   * Called when user cancels (closes dropdown without confirming)
   */
  resetDraftFilters: () =>
    set((state) => ({
      draftFilters: {
        minPrice: state.filters.minPrice,
        maxPrice: state.filters.maxPrice,
        category: state.filters.category,
        bedrooms: state.filters.bedrooms,
        bathrooms: state.filters.bathrooms,
        transactionType: state.filters.transactionType,
      },
    })),

  /**
   * Clear draft filters to empty state
   * Called when user clicks "Clear Filter"
   */
  clearDraftFilters: () =>
    set({
      draftFilters: {},
    }),
}));
