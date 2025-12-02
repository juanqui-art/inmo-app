/**
 * USE FAVORITES HOOK
 *
 * Simple wrapper around Zustand store for backwards compatibility
 *
 * MIGRATION NOTES:
 * v1.0.0: Manual optimistic updates with useState + useCallback (197 lines)
 * v2.0.0: Context + useOptimistic + useTransition (220 lines with flickering)
 * v3.0.0: Zustand with persist middleware (30 lines, no flickering)
 * v3.1.0: Added auth redirect via custom events (parallel routes support) ← CURRENT
 *
 * USAGE (unchanged):
 * const { isFavorite, toggleFavorite, isPending } = useFavorites();
 *
 * const liked = isFavorite(propertyId);
 * toggleFavorite(propertyId); // Instant UI update
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites-store";

/**
 * Hook para gestionar favoritos del usuario
 *
 * @returns Objeto con estado y funciones para manejar favoritos
 *
 * @example
 * const { isFavorite, toggleFavorite, isPending } = useFavorites();
 *
 * // Check if favorited
 * const liked = isFavorite(property.id);
 *
 * // Toggle favorite (optimistic update)
 * toggleFavorite(property.id);
 *
 * // Check if specific property is loading
 * if (isPending(property.id)) {
 *   // Show loading state
 * }
 */
export function useFavorites() {
  const store = useFavoritesStore();
  const router = useRouter();

  // Load favorites from server on mount (only once)
  // This runs in background and syncs localStorage with server
  useEffect(() => {
    if (!store.isInitialized) {
      // Non-blocking - UI shows localStorage state immediately
      store.loadFavorites();
    }
  }, [
    store.isInitialized, // Non-blocking - UI shows localStorage state immediately
    store.loadFavorites,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for auth-required events from the store
  // When user is not authenticated, store emits event and we handle redirect
  useEffect(() => {
    const handleAuthRequired = (
      event: CustomEvent<{ propertyId: string }>,
    ) => {
      const { propertyId } = event.detail;
      // Use Next.js router for client-side navigation
      // This triggers parallel route interception (@auth/(.)login)
      router.push(`/login?intent=favorite&propertyId=${propertyId}`);
    };

    // Type-safe event listener
    window.addEventListener(
      "favorites:auth-required",
      handleAuthRequired as EventListener,
    );

    return () => {
      window.removeEventListener(
        "favorites:auth-required",
        handleAuthRequired as EventListener,
      );
    };
  }, [router]);

  return {
    // State - comes from localStorage immediately (via persist middleware)
    // No delay on page load!
    favorites: store.favorites,
    isInitialized: store.isInitialized,

    // Actions
    toggleFavorite: store.toggleFavorite,

    // Helpers
    isFavorite: (propertyId: string) => store.favorites.has(propertyId),
    isPending: store.isPending,
  };
}

/**
 * CHANGELOG:
 *
 * v3.0.0 (Current - Zustand):
 * - Migrated to Zustand store
 * - No Provider needed
 * - No flickering issues
 * - Auto-persistence with localStorage
 * - Simplified from 220 lines to 30 lines
 *
 * v2.0.0 (Context + useOptimistic):
 * - Used React 19 useOptimistic + useTransition
 * - Eliminated stale closures from v1
 * - Global state via Context
 * - Had flickering issues when updating base state
 *
 * v1.0.0 (Manual optimistic updates):
 * - Manual optimistic updates with useState
 * - useCallback with favorites dependency (stale closures)
 * - useRef for processing state (didn't trigger re-renders)
 * - Local state per component instance (race conditions)
 *
 * BREAKING CHANGES: None
 * - API remains identical to v2.0.0
 * - No need for FavoritesProvider (removes Context dependency)
 * - Works immediately after import
 */
