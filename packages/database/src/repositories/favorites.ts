/**
 * FAVORITE REPOSITORY
 *
 * Abstrae todas las operaciones de base de datos relacionadas con favoritos
 * Gestiona la relación entre usuarios y propiedades favoritas
 *
 * PATTERN:
 * - Centraliza lógica de favoritos
 * - Valida constraints únicos
 * - Maneja errores de integridad
 * - Optimizado para queries frecuentes
 */

import { db } from "../client";
import type { Prisma } from "@prisma/client";

/**
 * Favorite select con relaciones básicas
 */
export const favoriteSelect = {
  id: true,
  userId: true,
  propertyId: true,
  createdAt: true,
} satisfies Prisma.FavoriteSelect;

export type FavoriteWithRelations = Prisma.FavoriteGetPayload<{
  select: typeof favoriteSelect;
}>;

/**
 * Repository para operaciones de favoritos
 */
export class FavoriteRepository {
  /**
   * Agregar una propiedad a favoritos
   * Retorna el favorito creado o error si ya existe
   *
   * @throws Error si el favorito ya existe (constraint único)
   */
  async addFavorite(userId: string, propertyId: string) {
    return db.favorite.create({
      data: {
        userId,
        propertyId,
      },
      select: favoriteSelect,
    });
  }

  /**
   * Quitar una propiedad de favoritos
   * Retorna el favorito eliminado o null si no existe
   */
  async removeFavorite(userId: string, propertyId: string) {
    return db.favorite.deleteMany({
      where: {
        userId,
        propertyId,
      },
    });
  }

  /**
   * Toggle: agregar si no existe, quitar si existe
   * Retorna estado final: { isFavorite: boolean }
   *
   * @example
   * await favoriteRepository.toggleFavorite(userId, propertyId);
   * // Retorna: { isFavorite: true } si se agregó
   * // Retorna: { isFavorite: false } si se quitó
   */
  async toggleFavorite(userId: string, propertyId: string): Promise<{
    isFavorite: boolean;
  }> {
    // Verificar si ya existe
    const existing = await db.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      // Eliminar si existe
      await db.favorite.delete({
        where: {
          id: existing.id,
        },
      });
      return { isFavorite: false };
    }

    // Crear si no existe
    await db.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });
    return { isFavorite: true };
  }

  /**
   * Verificar si una propiedad es favorita del usuario
   *
   * @example
   * const isFav = await favoriteRepository.isFavorite(userId, propertyId);
   * // Retorna: true | false
   */
  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await db.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });
    return !!favorite;
  }

  /**
   * Obtener todas las propiedades favoritas del usuario
   * Incluye datos básicos de la propiedad
   *
   * @param userId ID del usuario
   * @param options Opciones de paginación y filtrado
   * @example
   * const favorites = await favoriteRepository.getUserFavorites(userId, {
   *   skip: 0,
   *   take: 20,
   * });
   */
  async getUserFavorites(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    },
  ) {
    return db.favorite.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            transactionType: true,
            category: true,
            city: true,
            images: {
              select: {
                url: true,
                alt: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Obtener cantidad de favoritos (me gusta) de una propiedad
   * Usado para mostrar contador público (futuro)
   *
   * @example
   * const count = await favoriteRepository.getFavoriteCount(propertyId);
   * // Retorna: 24 (personas que han marcado como favorito)
   */
  async getFavoriteCount(propertyId: string): Promise<number> {
    return db.favorite.count({
      where: { propertyId },
    });
  }

  /**
   * Obtener favoritos de múltiples propiedades en batch
   * Optimizado para mostrar estado de favoritos en listas
   *
   * @example
   * const favoriteCounts = await favoriteRepository.getFavoriteCountBatch([
   *   propertyId1,
   *   propertyId2,
   *   propertyId3,
   * ]);
   * // Retorna: { [propertyId]: count }
   */
  async getFavoriteCountBatch(
    propertyIds: string[],
  ): Promise<Record<string, number>> {
    const counts = await db.favorite.groupBy({
      by: ["propertyId"],
      where: {
        propertyId: {
          in: propertyIds,
        },
      },
      _count: true,
    });

    const result: Record<string, number> = {};
    propertyIds.forEach((id) => {
      result[id] = 0;
    });

    counts.forEach((count) => {
      result[count.propertyId] = count._count;
    });

    return result;
  }

  /**
   * Eliminar todos los favoritos de un usuario
   * Usado en onboarding o cuando elimina cuenta
   */
  async clearUserFavorites(userId: string) {
    return db.favorite.deleteMany({
      where: { userId },
    });
  }
}
