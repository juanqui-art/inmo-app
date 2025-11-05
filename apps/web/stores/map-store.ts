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
 */

"use client";

import { create } from "zustand";
import type { MapProperty } from "@/components/map/map-view";

// ============================================================================
// TYPES
// ============================================================================

export type PriceDistribution = { bucket: number; count: number }[];

interface MapStoreState {
  // State
  properties: MapProperty[];
  priceDistribution: PriceDistribution;
  priceRangeMin?: number;
  priceRangeMax?: number;
  isInitialized: boolean;
  isLoading: boolean; // NEW

  // Actions
  initialize: (data: {
    properties: MapProperty[];
    priceDistribution: PriceDistribution;
    priceRangeMin?: number;
    priceRangeMax?: number;
  }) => void;
  setIsLoading: (loading: boolean) => void; // NEW
}

// ============================================================================
// STORE
// ============================================================================

export const useMapStore = create<MapStoreState>((set) => ({
  // ========================================================================
  // INITIAL STATE
  // ========================================================================

  properties: [],
  priceDistribution: [],
  priceRangeMin: 0,
  priceRangeMax: 2000000, // Default max, will be overwritten
  isInitialized: false,
  isLoading: false, // NEW

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Initializes the store with data fetched from a Server Component.
   * This is the hydration step.
   */
  initialize: (data) =>
    set({
      ...data,
      isInitialized: true,
      isLoading: false, // Always set loading to false on init
    }),

  /**
   * Manually sets the loading state.
   */
  setIsLoading: (loading) => set({ isLoading: loading }), // NEW
}));
