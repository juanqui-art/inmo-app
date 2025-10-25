/**
 * USE FAVORITES HOOK
 *
 * Custom hook para gestionar favoritos del usuario
 * Proporciona state compartido y funciones para agregar/quitar favoritos
 *
 * PATTERN: True Optimistic Updates
 * - UI update INSTANTÁNEO (sync state change)
 * - Server call BACKGROUND (async)
 * - Rollback on error
 *
 * FEATURES:
 * - ✨ Optimistic updates (UI instantánea - sin latencia)
 * - 🔄 Sync con servidor (Server Actions)
 * - 🚫 Prevención de double-click
 * - ⚠️ Error handling con rollback automático
 * - 🔔 Toast notifications
 *
 * USAGE:
 * const { isFavorite, toggleFavorite, isLoading } = useFavorites();
 *
 * // En componente
 * const liked = isFavorite(propertyId);
 * await toggleFavorite(propertyId);  // UI updates instantly
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { toast } from "sonner";

/**
 * Hook para gestionar favoritos con true optimistic updates
 * @returns Objeto con estado y funciones para manejar favoritos
 */
export function useFavorites() {
  // Estado: Set de IDs de propiedades favoritas
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Ref para prevenir multiple simultaneous requests por propiedad
  const processingRef = useRef<Set<string>>(new Set());

  /**
   * Toggle favorito de una propiedad (True Optimistic Update)
   *
   * Flow:
   * 1. ✅ setFavorites() - Update instantáneo (SYNC)
   * 2. 🔄 toggleFavoriteAction() - Server sync (async background)
   * 3. ✔️ Success toast
   * 4. ❌ On error: revert state + error toast
   *
   * @param propertyId ID de la propiedad a favoritar
   */
  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      // Prevenir múltiples clicks simultáneos en la misma propiedad
      if (processingRef.current.has(propertyId)) {
        return;
      }

      processingRef.current.add(propertyId);
      const previousFavorites = new Set(favorites);

      try {
        // PASO 1: ✨ UPDATE INSTANTÁNEO - Actualizar UI inmediatamente (SYNC)
        // Esto crea la ilusión de que es instant, sin esperar al server
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          if (newFavorites.has(propertyId)) {
            newFavorites.delete(propertyId);
          } else {
            newFavorites.add(propertyId);
          }
          return newFavorites;
        });

        // PASO 2: 🔄 SERVER SYNC - Sincronizar con backend (async, background)
        // El usuario ya vio la UI actualizada, así que esto es "background"
        const result = await toggleFavoriteAction(propertyId);

        // PASO 3: Validar resultado del servidor
        if (!result.success) {
          // ❌ Error: revertir el update optimistic
          setFavorites(previousFavorites);
          toast.error(result.error || "Error al actualizar favorito");
          return;
        }

        // ✔️ Success: mostrar feedback
        if (result.isFavorite) {
          toast.success("Agregado a favoritos", { duration: 2000 });
        } else {
          toast.success("Removido de favoritos", { duration: 2000 });
        }
      } catch (error) {
        console.error("[toggleFavorite] Error:", error);
        // ❌ Exception: revertir estado y mostrar error
        setFavorites(previousFavorites);
        toast.error("Error al actualizar favorito");
      } finally {
        // Limpiar flag de procesamiento
        processingRef.current.delete(propertyId);
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
   * Útil para mostrar loading state mientras se sincroniza
   *
   * @param propertyId ID de la propiedad
   * @returns boolean - true si está siendo procesada
   */
  const isLoading = useCallback(
    (propertyId: string): boolean => {
      return processingRef.current.has(propertyId);
    },
    [],
  );

  return {
    // Estado
    favorites,

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
