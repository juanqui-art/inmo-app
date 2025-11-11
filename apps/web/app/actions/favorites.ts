/**
 * SERVER ACTIONS - Favorites
 *
 * Server Actions para operaciones de favoritos
 * - Autenticación requerida
 * - Validación de propertyId
 * - Cache invalidation
 */

"use server";

import { FavoriteRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const favoriteSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
});

/**
 * TOGGLE FAVORITE ACTION
 * Agregar o quitar una propiedad de favoritos
 *
 * @param propertyId ID de la propiedad
 * @returns { isFavorite: boolean } Estado final después del toggle
 *
 * @throws Error si usuario no está autenticado
 * @throws ZodError si propertyId no es UUID válido
 *
 * @example
 * const { isFavorite } = await toggleFavoriteAction(propertyId);
 * console.log(isFavorite); // true si se agregó, false si se quitó
 */
export async function toggleFavoriteAction(propertyId: string) {
  try {
    // 1. Validar input
    const validatedData = favoriteSchema.parse({ propertyId });

    // 2. Obtener usuario actual (requiere autenticación)
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required to manage favorites");
    }

    // 3. Ejecutar toggle
    const favoriteRepository = new FavoriteRepository();
    const result = await favoriteRepository.toggleFavorite(
      user.id,
      validatedData.propertyId,
    );

    // 4. Revalidar cache - actualiza lista de favoritos y mapa
    revalidatePath("/mapa");
    revalidatePath("/favoritos");

    return {
      success: true,
      isFavorite: result.isFavorite,
    };
  } catch (error) {
    // Logging en producción
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid property ID",
      };
    }

    if (error instanceof Error) {
      console.error("[toggleFavoriteAction]", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to toggle favorite",
    };
  }
}

/**
 * GET USER FAVORITES ACTION
 * Obtener lista de IDs de favoritos del usuario actual
 *
 * ⚠️ IMPORTANT: Returns only propertyIds (as strings)
 * WHY? Avoid serialization errors with Prisma Decimal objects
 * The hook only needs propertyIds to maintain the favorites Set
 *
 * @returns Array de propertyIds (strings)
 *
 * @throws Error si usuario no está autenticado
 *
 * @example
 * const { data } = await getUserFavoritesAction();
 * // data = ["prop-id-1", "prop-id-2", "prop-id-3"]
 */
export async function getUserFavoritesAction() {
  try {
    // Obtener usuario actual
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // Obtener favoritos del usuario - solo los IDs sin relaciones
    const favoriteRepository = new FavoriteRepository();
    const favorites = await favoriteRepository.getUserFavorites(user.id, {
      skip: 0,
      take: 100, // Paginación en futuro
    });

    // Extraer solo los propertyIds para evitar problemas de serialización
    // No incluimos la propiedad completa ya que contiene Decimal que no es serializable
    const propertyIds = favorites.map((fav) => fav.propertyId);

    return {
      success: true,
      data: propertyIds,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("[getUserFavoritesAction]", error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }

    return {
      success: false,
      error: "Failed to fetch favorites",
      data: [],
    };
  }
}

/**
 * CHECK IF FAVORITE ACTION
 * Verificar si una propiedad es favorita del usuario
 *
 * @param propertyId ID de la propiedad
 * @returns { isFavorite: boolean }
 *
 * @example
 * const { isFavorite } = await checkIfFavoriteAction(propertyId);
 */
export async function checkIfFavoriteAction(propertyId: string) {
  try {
    // Validar input
    const validatedData = favoriteSchema.parse({ propertyId });

    // Obtener usuario actual
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: true,
        isFavorite: false, // Usuarios no logueados no tienen favoritos
      };
    }

    // Verificar si es favorito
    const favoriteRepository = new FavoriteRepository();
    const isFavorite = await favoriteRepository.isFavorite(
      user.id,
      validatedData.propertyId,
    );

    return {
      success: true,
      isFavorite,
    };
  } catch (error) {
    console.error("[checkIfFavoriteAction]", error);
    return {
      success: false,
      isFavorite: false,
    };
  }
}

/**
 * GET FAVORITES WITH DETAILS ACTION
 * Obtener lista completa de favoritos con detalles de propiedades
 *
 * Usado por el dropdown de favoritos en el navbar.
 * Retorna datos con información resumida: imagen, precio, ubicación
 *
 * @param limit Número máximo de favoritos a retornar (default: 8)
 * @returns Array de favoritos con detalles de propiedades
 *
 * @throws Error si usuario no está autenticado
 *
 * @example
 * const { data } = await getFavoritesWithDetailsAction(8);
 * // data = [{
 * //   propertyId: "...",
 * //   property: {
 * //     id: "...",
 * //     title: "Casa en...",
 * //     price: 150000,
 * //     city: "Miami",
 * //     images: [{ url: "...", alt: "..." }]
 * //   }
 * // }]
 */
export async function getFavoritesWithDetailsAction(limit: number = 8) {
  try {
    // Obtener usuario actual
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // Obtener favoritos con detalles completos
    const favoriteRepository = new FavoriteRepository();
    const favorites = await favoriteRepository.getUserFavorites(user.id, {
      skip: 0,
      take: limit,
    });

    // Formatear datos para el dropdown (mantener serializable)
    const formattedFavorites = favorites.map((fav) => ({
      propertyId: fav.propertyId,
      property: {
        id: fav.property.id,
        title: fav.property.title,
        price: fav.property.price.toString(), // Convertir Decimal a string
        city: fav.property.city,
        image: fav.property.images[0] || null,
      },
    }));

    return {
      success: true,
      data: formattedFavorites,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("[getFavoritesWithDetailsAction]", error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }

    return {
      success: false,
      error: "Failed to fetch favorites with details",
      data: [],
    };
  }
}
