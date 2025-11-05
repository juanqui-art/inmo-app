/**
 * MIGRATION EXAMPLE - favorites.ts
 *
 * This shows how to migrate the favorites actions to use the new error handling system.
 * You can use this as a template for other actions.
 */

"use server";

import { FavoriteRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { withActionHandler } from "@/lib/action-wrapper";
import { ValidationError, AuthError } from "@repo/shared/errors";

const favoriteSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID format"),
});

/**
 * TOGGLE FAVORITE ACTION (Refactored with new error handling)
 */
export const toggleFavoriteActionV2 = withActionHandler(
  async (propertyId: string, context) => {
    // 1. Validar input
    const result = favoriteSchema.safeParse({ propertyId });
    if (!result.success) {
      throw new ValidationError("Invalid property ID", {
        fieldErrors: result.error.flatten().fieldErrors,
      });
    }
    const { propertyId: validatedPropertyId } = result.data;

    // 2. Obtener usuario actual (ya validado por requireAuth en options)
    const user = await getCurrentUser();
    if (!user) {
      throw new AuthError("Authentication required to manage favorites");
    }

    context.logger.info("Toggling favorite", {
      userId: user.id,
      propertyId: validatedPropertyId,
    });

    // 3. Ejecutar toggle
    const favoriteRepository = new FavoriteRepository();
    const toggleResult = await favoriteRepository.toggleFavorite(
      user.id,
      validatedPropertyId
    );

    context.logger.info("Favorite toggled successfully", {
      isFavorite: toggleResult.isFavorite,
    });

    // 4. Revalidar cache
    revalidatePath("/mapa");
    revalidatePath("/favoritos");

    return {
      isFavorite: toggleResult.isFavorite,
    };
  },
  {
    actionName: "toggleFavorite",
    requireAuth: true,
  }
);

/**
 * GET USER FAVORITES ACTION (Refactored)
 */
export const getUserFavoritesActionV2 = withActionHandler(
  async (_input: void, context) => {
    // Usuario ya validado por requireAuth
    const user = await getCurrentUser();
    if (!user) {
      throw new AuthError("Authentication required");
    }

    context.logger.debug("Fetching user favorites", { userId: user.id });

    // Obtener favoritos
    const favoriteRepository = new FavoriteRepository();
    const favorites = await favoriteRepository.getUserFavorites(user.id, {
      skip: 0,
      take: 100,
    });

    // Extraer solo los propertyIds
    const propertyIds = favorites.map((fav) => fav.propertyId);

    context.logger.info("Favorites fetched", { count: propertyIds.length });

    return propertyIds;
  },
  {
    actionName: "getUserFavorites",
    requireAuth: true,
  }
);

/**
 * CHECK IF FAVORITE ACTION (Refactored)
 */
export const checkIfFavoriteActionV2 = withActionHandler(
  async (propertyId: string, context) => {
    // Validar input
    const result = favoriteSchema.safeParse({ propertyId });
    if (!result.success) {
      throw new ValidationError("Invalid property ID");
    }
    const { propertyId: validatedPropertyId } = result.data;

    // Obtener usuario (opcional - puede no estar logueado)
    const user = await getCurrentUser();
    if (!user) {
      return { isFavorite: false };
    }

    context.logger.debug("Checking if favorite", {
      userId: user.id,
      propertyId: validatedPropertyId,
    });

    // Verificar si es favorito
    const favoriteRepository = new FavoriteRepository();
    const isFavorite = await favoriteRepository.isFavorite(
      user.id,
      validatedPropertyId
    );

    return { isFavorite };
  },
  {
    actionName: "checkIfFavorite",
    requireAuth: false, // Esta acción NO requiere auth
  }
);

/**
 * USAGE IN COMPONENTS:
 *
 * Before:
 * const { success, isFavorite } = await toggleFavoriteAction(propertyId);
 * if (!success) { ... }
 *
 * After:
 * const result = await toggleFavoriteActionV2(propertyId);
 * if (!result.success) {
 *   console.error(result.error.message);
 * } else {
 *   console.log(result.data.isFavorite);
 * }
 */
