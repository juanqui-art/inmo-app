/**
 * USE FAVORITES HOOK
 *
 * Custom hook para gestionar favoritos del usuario
 * Proporciona state compartido y funciones para agregar/quitar favoritos
 *
 * FEATURES:
 * - Optimistic updates (UI instantánea) con useTransition
 * - Sync con servidor (Server Actions)
 * - Loading states per property
 * - Error handling con rollback
 * - Toast notifications
 *
 * USAGE:
 * const { isFavorite, toggleFavorite, isLoading } = useFavorites();
 *
 * // En componente
 * const liked = isFavorite(propertyId);
 * await toggleFavorite(propertyId);
 */

"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { toast } from "sonner";

/**
 * Hook para gestionar favoritos con optimistic updates
 * @returns Objeto con estado y funciones para manejar favoritos
 */
export function useFavorites() {
  // Estado: Set de IDs de propiedades favoritas
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Track loading state por propiedad
  const [loadingProperties, setLoadingProperties] = useState<Set<string>>(
    new Set(),
  );

  // useTransition para optimistic updates seguros
  const [isPending, startTransition] = useTransition();

  // Ref para tracking de propiedades que están siendo procesadas
  const processingRef = useRef<Set<string>>(new Set());

  /**
   * Toggle favorito de una propiedad
   * - Optimistic update: actualizar UI inmediatamente
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
      const previousFavorites = new Set(favorites);

      try {
        // Actualizar loading state
        setLoadingProperties((prev) => new Set(prev).add(propertyId));

        // Optimistic update - cambiar estado inmediatamente
        startTransition(() => {
          setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(propertyId)) {
              newFavorites.delete(propertyId);
            } else {
              newFavorites.add(propertyId);
            }
            return newFavorites;
          });
        });

        // Servidor action - sincronizar con backend
        const result = await toggleFavoriteAction(propertyId);

        if (!result.success) {
          // Revertir si falla
          setFavorites(previousFavorites);
          toast.error(result.error || "Failed to update favorite");
          return;
        }

        // Success - mostrar feedback
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
        setFavorites(previousFavorites);
        toast.error("Error al actualizar favoritos");
      } finally {
        processingRef.current.delete(propertyId);
        setLoadingProperties((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      }
    },
    [favorites],
  );

  /**
   * Verificar si una propiedad es favorita
   * @param propertyId ID de la propiedad
   * @returns boolean - true si es favorita
   */
  const isFavorite = useCallback(
    (propertyId: string): boolean => {
      return favorites.has(propertyId);
    },
    [favorites],
  );

  /**
   * Verificar si una propiedad está siendo procesada
   * @param propertyId ID de la propiedad
   * @returns boolean - true si está cargando
   */
  const isLoading = useCallback(
    (propertyId: string): boolean => {
      return loadingProperties.has(propertyId);
    },
    [loadingProperties],
  );

  return {
    // Estado
    favorites,
    loadingProperties,
    isPending,

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

  return {
    toggleFavorite,
  };
}
