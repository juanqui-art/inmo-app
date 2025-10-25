/**
 * USE FAVORITES HOOK
 *
 * Custom hook para gestionar favoritos del usuario
 * Proporciona state compartido y funciones para agregar/quitar favoritos
 *
 * FEATURES:
 * - Optimistic updates (UI instantánea)
 * - Sync con servidor
 * - Loading states
 * - Error handling
 * - Session persistence
 *
 * USAGE:
 * const { isFavorite, toggleFavorite, isLoading } = useFavorites();
 *
 * // En componente
 * const liked = isFavorite(propertyId);
 * await toggleFavorite(propertyId);
 */

"use client";

import { useCallback, useEffect, useRef, useOptimistic } from "react";
import {
  toggleFavoriteAction,
  checkIfFavoriteAction,
} from "@/app/actions/favorites";
import { toast } from "sonner";

interface UseFavoritesState {
  favorites: Set<string>; // IDs de propiedades favoritas
  isLoading: Set<string>; // IDs que están siendo procesadas
}

/**
 * Hook para gestionar favoritos con optimistic updates
 * @returns Objeto con estado y funciones para manejar favoritos
 */
export function useFavorites() {
  // Estado: Set de IDs de propiedades favoritas
  const [state, addOptimisticFavorite] = useOptimistic<
    UseFavoritesState,
    string
  >(
    { favorites: new Set(), isLoading: new Set() },
    (
      state,
      propertyId,
    ) => {
      // Optimistic update: actualizar UI inmediatamente
      const newFavorites = new Set(state.favorites);
      const newLoading = new Set(state.isLoading);

      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }

      newLoading.add(propertyId);

      return {
        favorites: newFavorites,
        isLoading: newLoading,
      };
    },
  );

  // Ref para tracking de propiedades que están siendo procesadas
  const processingRef = useRef<Set<string>>(new Set());

  /**
   * Toggle favorito de una propiedad
   * - Optimistic update: actualizar UI
   * - Luego sincronizar con servidor
   * - Revertir si falla
   */
  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      // Evitar múltiples clicks simultáneos
      if (processingRef.current.has(propertyId)) {
        return;
      }

      processingRef.current.add(propertyId);

      try {
        // Optimistic update
        addOptimisticFavorite(propertyId);

        // Servidor action
        const result = await toggleFavoriteAction(propertyId);

        if (!result.success) {
          // Revertir si falla
          addOptimisticFavorite(propertyId);
          toast.error(result.error || "Failed to update favorite");
          return;
        }

        // Success - mostrar feedback opcional
        if (result.isFavorite) {
          toast.success("Agregado a favoritos", {
            duration: 2000,
          });
        } else {
          toast.success("Removido de favoritos", {
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("[toggleFavorite]", error);
        // Revertir optimistic update
        addOptimisticFavorite(propertyId);
        toast.error("Error al actualizar favoritos");
      } finally {
        processingRef.current.delete(propertyId);
      }
    },
    [state.favorites, addOptimisticFavorite],
  );

  /**
   * Verificar si una propiedad es favorita
   * @param propertyId ID de la propiedad
   * @returns boolean - true si es favorita
   */
  const isFavorite = useCallback(
    (propertyId: string): boolean => {
      return state.favorites.has(propertyId);
    },
    [state.favorites],
  );

  /**
   * Verificar si una propiedad está siendo procesada
   * @param propertyId ID de la propiedad
   * @returns boolean - true si está cargando
   */
  const isLoading = useCallback(
    (propertyId: string): boolean => {
      return state.isLoading.has(propertyId);
    },
    [state.isLoading],
  );

  /**
   * Agregar múltiples favoritos al cargar la página
   * Se ejecuta una sola vez al montar el componente
   */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Obtener lista de propiedades desde sessionStorage si existe
        // Para mejorar UX: cargar favoritos conocidos sin server call
        const cachedFavorites = sessionStorage.getItem("favorites");
        if (cachedFavorites) {
          // TODO: restaurar favoritos cacheados si es necesario
          JSON.parse(cachedFavorites);
        }
      } catch (error) {
        console.error("[loadFavorites]", error);
      }
    };

    loadFavorites();
  }, []);

  return {
    // Estado
    favorites: state.favorites,
    isLoading: state.isLoading,

    // Métodos
    toggleFavorite,
    isFavorite,
    isLoadingProperty: isLoading,
  };
}

/**
 * Hook alternative: useFavoritesAsync
 * Versión más simple que no usa optimistic updates
 * Util para componentes simples o cuando no necesitas feedback instantáneo
 */
export function useFavoritesAsync() {
  const toggleFavorite = useCallback(async (propertyId: string) => {
    try {
      const result = await toggleFavoriteAction(propertyId);

      if (!result.success) {
        toast.error(result.error || "Failed to update favorite");
        return result.isFavorite || false;
      }

      return result.isFavorite;
    } catch (error) {
      console.error("[toggleFavoriteAsync]", error);
      toast.error("Error al actualizar favoritos");
      return false;
    }
  }, []);

  const checkFavorite = useCallback(async (propertyId: string) => {
    try {
      const result = await checkIfFavoriteAction(propertyId);
      return result.isFavorite || false;
    } catch (error) {
      console.error("[checkFavorite]", error);
      return false;
    }
  }, []);

  return {
    toggleFavorite,
    checkFavorite,
  };
}
