/**
 * FAVORITES STORE (Zustand)
 *
 * Global state management for user favorites using Zustand with persist middleware
 *
 * WHY ZUSTAND?
 * ✅ No Provider needed (simpler than Context)
 * ✅ Built-in persist middleware (automatic localStorage sync)
 * ✅ No flickering issues (complete control over state)
 * ✅ Better performance (granular subscriptions)
 * ✅ DevTools integration (easy debugging)
 * ✅ Tiny bundle size (~1.2kB gzipped)
 *
 * FEATURES:
 * - Optimistic updates (instant UI feedback)
 * - Automatic persistence (localStorage)
 * - Server sync (background)
 * - Error handling with rollback
 * - Toast notifications
 * - Type-safe (TypeScript)
 *
 * USAGE:
 * const { favorites, toggleFavorite, isPending } = useFavoritesStore();
 *
 * const liked = favorites.has(property.id);
 * toggleFavorite(property.id); // Instant UI update
 */

"use client";

import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getUserFavoritesAction,
  toggleFavoriteAction,
} from "@/app/actions/favorites";

// ============================================================================
// TYPES
// ============================================================================

interface FavoritesState {
  // State
  favorites: Set<string>;
  pendingIds: Set<string>;
  isInitialized: boolean;

  // Actions
  toggleFavorite: (propertyId: string) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isPending: (propertyId: string) => boolean;

  // Internal helpers
  _addToFavorites: (propertyId: string) => void;
  _removeFromFavorites: (propertyId: string) => void;
  _addToPending: (propertyId: string) => void;
  _removeFromPending: (propertyId: string) => void;
  _setInitialized: (value: boolean) => void;
}

// ============================================================================
// CUSTOM STORAGE (para serializar Set correctamente)
// ============================================================================

/**
 * Custom storage adapter para manejar Sets en localStorage
 *
 * PROBLEMA: JSON.stringify() no serializa Sets correctamente
 * SOLUCIÓN: Interceptar en getItem/setItem para convertir Set ↔ Array
 */
const favoritesStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      // Parse the stored JSON
      const parsed = JSON.parse(str);

      // Convert arrays back to Sets
      if (parsed.state?.favorites) {
        parsed.state.favorites = Array.from(parsed.state.favorites);
      }

      // Return as string for Zustand to parse again
      return JSON.stringify(parsed);
    } catch (error) {
      console.error("[favoritesStorage] Error reading:", error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      // Parse what Zustand sends us
      const parsed = JSON.parse(value);

      // Convert Sets to arrays for JSON serialization
      if (parsed.state && parsed.state.favorites instanceof Set) {
        parsed.state.favorites = Array.from(parsed.state.favorites);
      }

      // Store the stringified version
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch (error) {
      console.error("[favoritesStorage] Error writing:", error);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

// ============================================================================
// STORE
// ============================================================================

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // ========================================================================
      // STATE
      // ========================================================================

      favorites: new Set<string>(),
      pendingIds: new Set<string>(),
      isInitialized: false,

      // ========================================================================
      // ACTIONS
      // ========================================================================

      /**
       * Toggle favorite (Optimistic Update)
       *
       * FLOW:
       * 1. Add/remove from favorites (instant UI update)
       * 2. Mark as pending
       * 3. Sync with server (background)
       * 4. On success: update confirmed state
       * 5. On error: rollback + show toast
       */
      toggleFavorite: async (propertyId: string) => {
        const {
          favorites,
          _addToFavorites,
          _removeFromFavorites,
          _addToPending,
          _removeFromPending,
        } = get();

        // Determinar la acción (agregar o quitar)
        const wasLiked = favorites.has(propertyId);

        // PASO 1: Optimistic update (INSTANT)
        if (wasLiked) {
          _removeFromFavorites(propertyId);
        } else {
          _addToFavorites(propertyId);
        }

        // PASO 2: Mark as pending
        _addToPending(propertyId);

        try {
          // PASO 3: Server sync (background)
          const result = await toggleFavoriteAction(propertyId);

          // PASO 4: Handle response
          if (!result.success) {
            // Error: rollback
            if (wasLiked) {
              _addToFavorites(propertyId);
            } else {
              _removeFromFavorites(propertyId);
            }
            toast.error(result.error || "Error al actualizar favorito");
            _removeFromPending(propertyId);
            return;
          }

          // PASO 5: Success - confirm optimistic update matches server
          // Ensure state matches server response (shouldn't change, but for safety)
          if (result.isFavorite && !get().favorites.has(propertyId)) {
            _addToFavorites(propertyId);
          } else if (!result.isFavorite && get().favorites.has(propertyId)) {
            _removeFromFavorites(propertyId);
          }

          // Success: show toast
          if (result.isFavorite) {
            toast.success("Agregado a favoritos", { duration: 2000 });
          } else {
            toast.success("Removido de favoritos", { duration: 2000 });
          }

          _removeFromPending(propertyId);
        } catch (error) {
          console.error("[toggleFavorite] Error:", error);

          // Exception: rollback
          if (wasLiked) {
            _addToFavorites(propertyId);
          } else {
            _removeFromFavorites(propertyId);
          }
          toast.error("Error al actualizar favorito");
          _removeFromPending(propertyId);
        }
      },

      /**
       * Load favorites from server
       * Called once on app initialization
       *
       * IMPORTANT: Server is source of truth
       * - Overwrites localStorage on first load
       * - Preserves optimistic updates for pending operations
       */
      loadFavorites: async () => {
        try {
          const result = await getUserFavoritesAction();
          if (result.success && result.data) {
            const serverFavorites = new Set(result.data);
            const { pendingIds } = get();

            if (pendingIds.size === 0) {
              // No pending operations - use server state as-is
              set({ favorites: serverFavorites });
            } else {
              // Merge: Start with server state, then apply pending optimistic changes
              const currentFavorites = get().favorites;

              pendingIds.forEach((propertyId) => {
                const wasOptimisticallyAdded =
                  currentFavorites.has(propertyId) &&
                  !serverFavorites.has(propertyId);
                const wasOptimisticallyRemoved =
                  !currentFavorites.has(propertyId) &&
                  serverFavorites.has(propertyId);

                if (wasOptimisticallyAdded) {
                  serverFavorites.add(propertyId);
                } else if (wasOptimisticallyRemoved) {
                  serverFavorites.delete(propertyId);
                }
              });

              set({ favorites: serverFavorites });
            }
          }
        } catch (error) {
          console.error("[loadFavorites] Error:", error);
          toast.error("Error al cargar favoritos");
        } finally {
          get()._setInitialized(true);
        }
      },

      /**
       * Check if a property is being toggled
       */
      isPending: (propertyId: string) => {
        return get().pendingIds.has(propertyId);
      },

      // ========================================================================
      // INTERNAL HELPERS (prefixed with _)
      // ========================================================================

      _addToFavorites: (propertyId: string) => {
        set((state) => ({
          favorites: new Set(state.favorites).add(propertyId),
        }));
      },

      _removeFromFavorites: (propertyId: string) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          newFavorites.delete(propertyId);
          return { favorites: newFavorites };
        });
      },

      _addToPending: (propertyId: string) => {
        set((state) => ({
          pendingIds: new Set(state.pendingIds).add(propertyId),
        }));
      },

      _removeFromPending: (propertyId: string) => {
        set((state) => {
          const newPending = new Set(state.pendingIds);
          newPending.delete(propertyId);
          return { pendingIds: newPending };
        });
      },

      _setInitialized: (value: boolean) => {
        set({ isInitialized: value });
      },
    }),
    {
      // Persist options
      name: "favorites-storage",
      storage: createJSONStorage(() => favoritesStorage),

      // Solo persistir favorites, no pendingIds ni isInitialized
      partialize: (state) => ({
        favorites: state.favorites,
      }),

      // Merge function to restore Sets from persisted arrays
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState as Partial<FavoritesState>),
          // Convert arrays back to Sets
          favorites:
            persistedState && (persistedState as any).favorites
              ? new Set((persistedState as any).favorites)
              : currentState.favorites,
          // pendingIds should always start empty (never persist loading state)
          pendingIds: new Set<string>(),
        };
      },
    },
  ),
);

/**
 * ADVANTAGES OVER CONTEXT + useOptimistic:
 *
 * ✅ No Provider needed - Works globally out of the box
 * ✅ No flickering - Complete control over state updates
 * ✅ Auto-persistence - Built-in localStorage sync
 * ✅ Better performance - Granular re-renders (only components using this slice)
 * ✅ Simpler code - Less boilerplate than Context
 * ✅ DevTools - Zustand DevTools extension
 * ✅ Type-safe - Full TypeScript support
 * ✅ Smaller bundle - ~1.2kB vs custom Context implementation
 *
 * TRADE-OFFS:
 *
 * ❌ External dependency - Adds 1.2kB to bundle (acceptable)
 * ✅ BUT: No useOptimistic needed (manual is actually better for our use case)
 * ✅ BUT: persist middleware handles storage automatically
 * ✅ BUT: Much simpler than Context + useOptimistic + useTransition
 */
