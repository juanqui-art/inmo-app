/**
 * SERVER ACTIONS - Properties CRUD
 *
 * Server Actions para operaciones de propiedades
 * - Validación con Zod
 * - Permisos verificados por PropertyRepository
 * - Revalidación de cache con revalidatePath
 */

"use server";

import { requireOwnership, requireRole } from "@/lib/auth";
import { isCSRFError, validateCSRFToken } from "@/lib/csrf";
import {
    canAddVideo,
    canCreateProperty,
    canUploadImage,
} from "@/lib/permissions/property-limits";
import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { deletePropertyImage, uploadPropertyImage } from "@/lib/storage/client";
import { logger } from "@/lib/utils/logger";
import {
    createPropertySchema,
    updatePropertySchema,
} from "@/lib/validations/property";
import { db, propertyImageRepository, propertyRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * CREATE PROPERTY ACTION
 * Solo AGENT y ADMIN pueden crear propiedades
 */
export async function createPropertyAction(
  _prevState: unknown,
  formData: FormData,
) {
  // 1. Verificar que el usuario es AGENT o ADMIN
  const user = await requireRole(["AGENT", "ADMIN"]);

  // 1.5 Rate limiting (user-based to prevent spam)
  try {
    await enforceRateLimit({ userId: user.id, tier: "property-create" });
  } catch (error) {
    if (isRateLimitError(error)) {
      logger.warn({ userId: user.id, tier: "property-create" }, "[Property] Rate limit exceeded");
      return { error: { general: error.message } };
    }
    throw error;
  }

  // 2. Check subscription tier limits
  const permissionCheck = await canCreateProperty(user.id);
  if (!permissionCheck.allowed) {
    return {
      error: {
        general: permissionCheck.reason,
      },
      upgradeRequired: true,
      currentLimit: permissionCheck.limit,
    };
  }

  // 3. Extraer y transformar datos del formulario
  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    transactionType: formData.get("transactionType") as "SALE" | "RENT",
    category: formData.get("category") as string,
    status: (formData.get("status") as string) || "AVAILABLE",
    bedrooms: formData.get("bedrooms")
      ? Number(formData.get("bedrooms"))
      : undefined,
    bathrooms: formData.get("bathrooms")
      ? Number(formData.get("bathrooms"))
      : undefined,
    area: formData.get("area") ? Number(formData.get("area")) : undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    zipCode: formData.get("zipCode") || undefined,
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : undefined,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : undefined,
  };

  // 4. Validar con Zod
  const validatedData = createPropertySchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    // 5. Crear propiedad usando el repository
    await propertyRepository.create(validatedData.data, user.id);
  } catch (error) {
    logger.error({ err: error }, "Error creating property");
    return {
      error: {
        general:
          error instanceof Error
            ? error.message
            : "Error al crear la propiedad",
      },
    };
  }

  // 6. Revalidar caches
  // Invalida el mapa y lista de propiedades
  revalidatePath("/mapa");
  revalidatePath("/dashboard/propiedades");

  // 7. Redirigir a la lista (fuera del try/catch para que funcione)
  redirect("/dashboard/propiedades");
}

/**
 * UPDATE PROPERTY ACTION
 * Solo el owner o ADMIN pueden actualizar
 */
export async function updatePropertyAction(
  _prevState: unknown,
  formData: FormData,
) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  // 2. Extraer datos
  const propertyId = formData.get("id") as string;

  const rawData = {
    id: propertyId,
    title: formData.get("title") as string | undefined,
    description: formData.get("description") as string | undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    transactionType: formData.get("transactionType") as
      | "SALE"
      | "RENT"
      | undefined,
    category: formData.get("category") as string | undefined,
    status: formData.get("status") as string | undefined,
    bedrooms: formData.get("bedrooms")
      ? Number(formData.get("bedrooms"))
      : undefined,
    bathrooms: formData.get("bathrooms")
      ? Number(formData.get("bathrooms"))
      : undefined,
    area: formData.get("area") ? Number(formData.get("area")) : undefined,
    address: formData.get("address") as string | undefined,
    city: formData.get("city") as string | undefined,
    state: formData.get("state") as string | undefined,
    zipCode: formData.get("zipCode") as string | undefined,
    latitude: formData.get("latitude")
      ? Number(formData.get("latitude"))
      : undefined,
    longitude: formData.get("longitude")
      ? Number(formData.get("longitude"))
      : undefined,
  };

  // 3. Validar
  const validatedData = updatePropertySchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      error: validatedData.error.flatten().fieldErrors,
    };
  }

  const { id, ...updateData } = validatedData.data;

  // Extract videos from FormData (sent as JSON string)
  const videosJson = formData.get("videos") as string | null;
  let videosToSave: Array<{ url: string; platform: string; title?: string }> = [];
  
  if (videosJson) {
    try {
      videosToSave = JSON.parse(videosJson);
    } catch (e) {
      logger.warn({ videosJson }, "Failed to parse videos JSON");
    }
  }

  try {
    // 4. Actualizar propiedad y videos en transacción
    await db.$transaction(async (tx) => {
      // Update property data
      await tx.property.update({
        where: { id },
        data: updateData as any, // Cast needed for Prisma types
      });

      // If videos were sent, replace all existing videos
      if (videosJson !== null) {
        // Validate video limits
        if (videosToSave.length > 0) {
          const videoCheck = canAddVideo(user.subscriptionTier, videosToSave.length);
          if (!videoCheck.allowed) {
            throw new Error(videoCheck.reason || "Límite de videos excedido");
          }
        }

        // Delete existing videos
        await tx.propertyVideo.deleteMany({
          where: { propertyId: id },
        });

        // Create new videos
        if (videosToSave.length > 0) {
          await tx.propertyVideo.createMany({
            data: videosToSave.map((video, index) => ({
              url: video.url,
              platform: video.platform as any, // Cast to VideoPlatform enum
              title: video.title ?? null,
              order: index,
              propertyId: id,
            })),
          });
        }
      }
    });
  } catch (error) {
    logger.error({ err: error, propertyId: id }, "Error updating property");
    return {
      error: {
        general:
          error instanceof Error
            ? error.message
            : "Error al actualizar la propiedad",
      },
    };
  }

  // 5. Revalidar caches
  // Invalida el mapa, lista de propiedades y detail page
  revalidatePath("/mapa");
  revalidatePath("/dashboard/propiedades");
  revalidatePath(`/dashboard/propiedades/${id}/editar`);

  // 6. Redirigir (fuera del try/catch para que funcione)
  redirect("/dashboard/propiedades");
}

/**
 * DELETE PROPERTY ACTION
 * Solo el owner o ADMIN pueden eliminar
 *
 * CSRF Protected: Requires valid CSRF token for security
 */
export async function deletePropertyAction(
  propertyId: string,
  csrfToken?: string | null
) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  // 2. CSRF Protection (critical destructive operation)
  if (csrfToken) {
    try {
      await validateCSRFToken(csrfToken);
    } catch (error) {
      if (isCSRFError(error)) {
        return { success: false, error: error.message };
      }
      throw error;
    }
  } else {
    // Log warning if CSRF token not provided (should be added by clients)
    logger.warn(
      { propertyId, userId: user.id },
      "deletePropertyAction called without CSRF token"
    );
  }

  try {
    // 3. Eliminar (repository verifica ownership)
    await propertyRepository.delete(propertyId, user.id);

    // 4. Revalidar caches
    revalidatePath("/mapa");
    revalidatePath("/dashboard/propiedades");

    return { success: true };
  } catch (error) {
    logger.error({ err: error, propertyId }, "Error deleting property");
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al eliminar la propiedad",
    };
  }
}

/**
 * SAVE UPLOADED PROPERTY IMAGES ACTION
 * Guarda referencias a imágenes ya subidas a Storage (Presigned URLs)
 * Reemplaza a uploadPropertyImagesAction para evitar límites de tamaño de body
 */
export async function saveUploadedPropertyImagesAction(
  propertyId: string,
  imageUrls: string[]
) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  try {
    // 2. Verificar que la propiedad existe
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      return { error: "Propiedad no encontrada" };
    }

    // Verificar ownership
    await requireOwnership(
      property.agentId,
      "No tienes permiso para modificar esta propiedad"
    );

    if (!imageUrls || imageUrls.length === 0) {
      return { error: "No se enviaron imágenes" };
    }

    // 3-4. TRANSACTION: Check limits + Create images atomically
    // RACE CONDITION PROTECTION: Prevents concurrent uploads from exceeding limits
    // - Count existing images
    // - Validate total doesn't exceed tier limit
    // - Create all images in single atomic operation
    // If any step fails, entire operation is rolled back
    const result = await db.$transaction(async (tx) => {
      // Count existing images inside transaction
      const existingImageCount = await tx.propertyImage.count({
        where: { propertyId },
      });

      const totalAfterUpload = existingImageCount + imageUrls.length;

      // Check tier limitations
      const imageCheck = canUploadImage(user.subscriptionTier, totalAfterUpload);
      if (!imageCheck.allowed) {
        // Create error object with limit info for client handling
        const error: any = new Error(imageCheck.reason || "Límite de imágenes excedido");
        error.limit = imageCheck.limit; // Attach limit for error handling
        throw error;
      }

      // Prepare images to create
      const imagesToCreate = imageUrls
        .filter(url => url) // Filter out empty URLs
        .map((url, index) => ({
          url,
          alt: property.title,
          order: existingImageCount + index,
          propertyId,
        }));

      if (imagesToCreate.length === 0) {
        throw new Error("No hay imágenes válidas para guardar");
      }

      // Create all images atomically (all-or-nothing)
      return tx.propertyImage.createMany({
        data: imagesToCreate,
      });
    });

    // 5. Revalidar
    revalidatePath("/dashboard/propiedades");
    revalidatePath(`/dashboard/propiedades/${propertyId}/editar`);

    return { success: true, count: result.count };
  } catch (error) {
    logger.error({ err: error, propertyId }, "Error saving uploaded images");

    // Handle tier limit errors with upgrade prompt
    if (error instanceof Error && error.message.includes("Límite de imágenes excedido")) {
      return {
        error: error.message,
        upgradeRequired: true,
        currentLimit: (error as any).limit, // Extract limit from error
      };
    }

    return {
      error: error instanceof Error ? error.message : "Error al guardar las imágenes",
    };
  }
}

/**
 * UPLOAD PROPERTY IMAGES ACTION
 * Sube imágenes para una propiedad existente
 * @deprecated Use saveUploadedPropertyImagesAction with client-side uploads instead
 */
export async function uploadPropertyImagesAction(
  propertyId: string,
  formData: FormData,
) {
  // ... existing implementation kept for backward compatibility if needed, 
  // but marked deprecated
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  try {
    // 2. Verificar que la propiedad existe y el usuario tiene permisos
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      return { error: "Propiedad no encontrada" };
    }

    // Verificar ownership usando helper (con logging incluido)
    await requireOwnership(
      property.agentId,
      "No tienes permiso para modificar esta propiedad",
    );

    // 3. Obtener archivos del FormData
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return { error: "No se enviaron imágenes" };
    }

    // 4. Check subscription tier image limits
    const existingImageCount =
      await propertyImageRepository.countByProperty(propertyId);
    const totalAfterUpload = existingImageCount + files.length;

    const imageCheck = canUploadImage(user.subscriptionTier, totalAfterUpload);
    if (!imageCheck.allowed) {
      return {
        error: imageCheck.reason,
        upgradeRequired: true,
        currentLimit: imageCheck.limit,
      };
    }

    // 5. Subir imágenes y guardar en BD
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar que el archivo exista
      if (!file) continue;

      // Subir a Storage
      const url = await uploadPropertyImage(file, propertyId);

      // Guardar en BD
      const image = await propertyImageRepository.create({
        url,
        alt: property.title,
        order: existingImageCount + i,
        propertyId,
      });

      uploadedImages.push(image);
    }

    // 6. Revalidar
    revalidatePath("/dashboard/propiedades");
    revalidatePath(`/dashboard/propiedades/${propertyId}/editar`);

    return { success: true, images: uploadedImages };
  } catch (error) {
    logger.error({ err: error, propertyId }, "Error uploading images");
    return {
      error:
        error instanceof Error ? error.message : "Error al subir las imágenes",
    };
  }
}

/**
 * DELETE PROPERTY IMAGE ACTION
 * Elimina una imagen específica
 *
 * CSRF Protected: image deletion is a destructive operation
 */
export async function deletePropertyImageAction(
  imageId: string,
  csrfToken?: string | null
) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  // 2. CSRF Protection (destructive operation)
  if (csrfToken) {
    try {
      await validateCSRFToken(csrfToken);
    } catch (error) {
      if (isCSRFError(error)) {
        return { error: error.message };
      }
      throw error;
    }
  } else {
    logger.warn(
      { imageId, userId: user.id },
      "deletePropertyImageAction called without CSRF token"
    );
  }

  try {
    // 2. Obtener la imagen
    const image = await propertyImageRepository.findById(imageId);
    if (!image) {
      return { error: "Imagen no encontrada" };
    }

    // 3. Verificar permisos (necesita verificar la propiedad)
    const property = await propertyRepository.findById(image.propertyId);
    if (!property) {
      return { error: "Propiedad no encontrada" };
    }

    // Verificar ownership usando helper (con logging incluido)
    await requireOwnership(
      property.agentId,
      "No tienes permiso para eliminar esta imagen",
    );

    // 4. Eliminar de Storage
    await deletePropertyImage(image.url);

    // 5. Eliminar de BD
    await propertyImageRepository.delete(imageId);

    // 6. Revalidar
    revalidatePath("/dashboard/propiedades");
    revalidatePath(`/dashboard/propiedades/${image.propertyId}/editar`);

    return { success: true };
  } catch (error) {
    logger.error({ err: error, imageId }, "Error deleting image");
    return {
      error:
        error instanceof Error ? error.message : "Error al eliminar la imagen",
    };
  }
}

/**
 * REORDER PROPERTY IMAGES ACTION
 * Actualiza el orden de las imágenes
 */
export async function reorderPropertyImagesAction(
  propertyId: string,
  imageIds: string[],
) {
  // 1. Verificar autenticación
  await requireRole(["AGENT", "ADMIN"]);

  try {
    // 2. Verificar permisos
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      return { error: "Propiedad no encontrada" };
    }

    // Verificar ownership usando helper (con logging incluido)
    await requireOwnership(
      property.agentId,
      "No tienes permiso para modificar esta propiedad",
    );

    // 3. Actualizar orden de imágenes
    const updates = imageIds.map((id, index) => ({
      id,
      order: index,
    }));

    await propertyImageRepository.updateManyOrders(updates);

    // 4. Revalidar
    revalidatePath("/dashboard/propiedades");
    revalidatePath(`/dashboard/propiedades/${propertyId}/editar`);

    return { success: true };
  } catch (error) {
    logger.error({ err: error, propertyId }, "Error reordering images");
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al reordenar las imágenes",
    };
  }
}

/**
 * SEARCH CITIES ACTION
 * Busca ciudades basadas en un query string
 * Usado por el HeroSearchBar y otros componentes de búsqueda
 *
 * @param query - Texto de búsqueda (mínimo 2 caracteres)
 * @returns Lista de ciudades que coinciden con el query
 */
export interface CitySearchResult {
  id: string;
  name: string;
  state: string;
  propertyCount: number;
}

export async function searchCitiesAction(
  query: string,
): Promise<{ cities: CitySearchResult[]; error?: string }> {
  try {
    // Validar input
    if (!query || query.trim().length === 0) {
      return { cities: [] };
    }

    if (query.length > 100) {
      return { cities: [], error: "Búsqueda demasiado larga" };
    }

    // Buscar propiedades en ciudades que coincidan
    // Usamos groupBy para obtener ciudades distintas con conteo
    const { properties } = await propertyRepository.list({
      filters: {
        city: query,
      },
      take: 1000, // Obtener todas las propiedades que coincidan
    });

    // Agrupar por ciudad y contar
    const cityMap = new Map<string, { state: string; propertyCount: number }>();

    properties.forEach((property) => {
      if (property.city) {
        const existing = cityMap.get(property.city);
        if (existing) {
          existing.propertyCount += 1;
        } else {
          cityMap.set(property.city, {
            state: property.state || "",
            propertyCount: 1,
          });
        }
      }
    });

    // Convertir a array ordenado por cantidad de propiedades
    const cities: CitySearchResult[] = Array.from(cityMap.entries())
      .map(([name, data]) => ({
        id: `${name.toLowerCase()}-${data.state.toLowerCase()}`,
        name,
        state: data.state,
        propertyCount: data.propertyCount,
      }))
      .sort((a, b) => b.propertyCount - a.propertyCount); // Ciudades con más propiedades primero

    return { cities };
  } catch (error) {
    logger.error({ err: error, query }, "Error searching cities");
    return {
      cities: [],
      error:
        error instanceof Error ? error.message : "Error al buscar ciudades",
    };
  }
}

/**
 * GET ALL CITIES ACTION
 * Obtiene lista de TODAS las ciudades disponibles (sin filtro de búsqueda)
 * Usado por CityFilterDropdown en el mapa
 *
 * @returns Lista de todas las ciudades con conteo de propiedades, ordenadas por cantidad
 */
export async function getCitiesAction(): Promise<{
  cities: CitySearchResult[];
  error?: string;
}> {
  try {
    // Obtener TODAS las propiedades disponibles
    const { properties } = await propertyRepository.list({
      take: 10000, // Obtener todas
    });

    // Agrupar por ciudad y contar
    const cityMap = new Map<string, { state: string; propertyCount: number }>();

    properties.forEach((property) => {
      if (property.city) {
        const existing = cityMap.get(property.city);
        if (existing) {
          existing.propertyCount += 1;
        } else {
          cityMap.set(property.city, {
            state: property.state || "",
            propertyCount: 1,
          });
        }
      }
    });

    // Convertir a array ordenado por cantidad de propiedades (más propiedades primero)
    const cities: CitySearchResult[] = Array.from(cityMap.entries())
      .map(([name, data]) => ({
        id: `${name.toLowerCase()}-${data.state.toLowerCase()}`,
        name,
        state: data.state,
        propertyCount: data.propertyCount,
      }))
      .sort((a, b) => b.propertyCount - a.propertyCount);

    return { cities };
  } catch (error) {
    logger.error({ err: error }, "Error getting cities");
    return {
      cities: [],
      error:
        error instanceof Error ? error.message : "Error al obtener ciudades",
    };
  }
}

/**
 * GET PROPERTY PREVIEW ACTION
 * Obtiene datos simplificados de una propiedad para el modal de preview
 * Esta action es pública (no requiere autenticación)
 *
 * @param propertyId - ID de la propiedad
 * @returns Datos básicos de la propiedad para preview
 */
export interface PropertyPreviewData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  address: string;
  city: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  latitude: number | null;
  longitude: number | null;
  images: { url: string; alt: string | null }[];
  agent: {
    name: string | null;
    email: string;
    phone?: string | null;
  } | null;
}

export async function getPropertyPreviewAction(propertyId: string): Promise<{
  success: boolean;
  data?: PropertyPreviewData;
  error?: string;
}> {
  try {
    // Validar input
    if (!propertyId || propertyId.length !== 36) {
      return { success: false, error: "ID de propiedad inválido" };
    }

    // Obtener propiedad con datos básicos
    const property = await propertyRepository.findById(propertyId);

    if (!property) {
      return { success: false, error: "Propiedad no encontrada" };
    }

    // Formatear datos para el preview
    const previewData: PropertyPreviewData = {
      id: property.id,
      title: property.title,
      price: Number(property.price),
      description: property.description,
      address: property.address || "",
      city: property.city ?? null,
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      area: property.area ?? 0,
      latitude: property.latitude,
      longitude: property.longitude,
      images: property.images.map((img) => ({
        url: img.url,
        alt: img.alt,
      })),
      agent: property.agent
        ? {
            name: property.agent.name,
            email: property.agent.email,
            phone: property.agent.phone,
          }
        : null,
    };

    return { success: true, data: previewData };
  } catch (error) {
    logger.error({ err: error, propertyId }, "Error getting property preview");
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener la propiedad",
    };
  }
}
