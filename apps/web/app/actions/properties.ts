/**
 * SERVER ACTIONS - Properties CRUD
 *
 * Server Actions para operaciones de propiedades
 * - Validación con Zod
 * - Permisos verificados por PropertyRepository
 * - Revalidación de cache con revalidatePath
 * - Error handling y logging con @repo/shared
 */

"use server";

import { propertyImageRepository, propertyRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { deletePropertyImage, uploadPropertyImage } from "@/lib/storage/client";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/lib/validations/property";
import { withFormActionHandler } from "@/lib/action-wrapper";
import { ValidationError, NotFoundError, PermissionError } from "@repo/shared/errors";

/**
 * CREATE PROPERTY ACTION (Refactored with error handling)
 * Solo AGENT y ADMIN pueden crear propiedades
 */
export const createPropertyAction = withFormActionHandler(
  async (formData: FormData, context) => {
    // 1. Verificar que el usuario es AGENT o ADMIN
    const user = await requireRole(["AGENT", "ADMIN"]);

    context.logger.info("Creating property", { userId: user.id });

    // 2. Extraer y transformar datos del formulario
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

    // 3. Validar con Zod
    const validatedData = createPropertySchema.safeParse(rawData);

    if (!validatedData.success) {
      const fieldErrors = validatedData.error.flatten().fieldErrors;
      context.logger.warn("Validation failed", { fieldErrors });

      throw new ValidationError("Invalid property data", {
        fieldErrors,
      });
    }

    // 4. Crear propiedad usando el repository
    const property = await propertyRepository.create(validatedData.data, user.id);

    context.logger.info("Property created successfully", {
      propertyId: property.id,
    });

    // 5. Revalidar caches
    revalidatePath("/mapa");
    revalidatePath("/dashboard/propiedades");

    // 6. Redirigir a la lista
    redirect("/dashboard/propiedades");
  },
  {
    actionName: "createProperty",
    requiredRoles: ["AGENT", "ADMIN"],
  }
);

/**
 * CREATE PROPERTY ACTION (Original - kept for reference)
 *
 * This is the original implementation before refactoring.
 * Can be removed once the new implementation is tested.
 */
// export async function createPropertyAction(
//   _prevState: unknown,
//   formData: FormData,
// ) {
//   const user = await requireRole(["AGENT", "ADMIN"]);
//   const rawData = {
//     title: formData.get("title") as string,
//     description: formData.get("description") as string,
//     price: Number(formData.get("price")),
//     transactionType: formData.get("transactionType") as "SALE" | "RENT",
//     category: formData.get("category") as string,
//     status: (formData.get("status") as string) || "AVAILABLE",
//     bedrooms: formData.get("bedrooms")
//       ? Number(formData.get("bedrooms"))
//       : undefined,
//     bathrooms: formData.get("bathrooms")
//       ? Number(formData.get("bathrooms"))
//       : undefined,
//     area: formData.get("area") ? Number(formData.get("area")) : undefined,
//     address: formData.get("address") as string | undefined,
//     city: formData.get("city") as string | undefined,
//     state: formData.get("state") as string | undefined,
//     zipCode: formData.get("zipCode") as string | undefined,
//     latitude: formData.get("latitude")
//       ? Number(formData.get("latitude"))
//       : undefined,
//     longitude: formData.get("longitude")
//       ? Number(formData.get("longitude"))
//       : undefined,
//   };
//   const validatedData = createPropertySchema.safeParse(rawData);
//   if (!validatedData.success) {
//     return {
//       error: validatedData.error.flatten().fieldErrors,
//     };
//   }
//   try {
//     await propertyRepository.create(validatedData.data, user.id);
//   } catch (error) {
//     console.error("Error creating property:", error);
//     return {
//       error: {
//         general:
//           error instanceof Error
//             ? error.message
//             : "Error al crear la propiedad",
//       },
//     };
//   }
//   revalidatePath("/mapa");
//   revalidatePath("/dashboard/propiedades");
//   redirect("/dashboard/propiedades");
// }

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

  try {
    // 4. Actualizar (repository verifica ownership)
    await propertyRepository.update(id, updateData, user.id);
  } catch (error) {
    console.error("Error updating property:", error);
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
 */
export async function deletePropertyAction(propertyId: string) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  try {
    // 2. Eliminar (repository verifica ownership)
    await propertyRepository.delete(propertyId, user.id);

    // 3. Revalidar caches
    revalidatePath("/mapa");
    revalidatePath("/dashboard/propiedades");

    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al eliminar la propiedad",
    };
  }
}

/**
 * UPLOAD PROPERTY IMAGES ACTION
 * Sube imágenes para una propiedad existente
 */
export async function uploadPropertyImagesAction(
  propertyId: string,
  formData: FormData,
) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

  try {
    // 2. Verificar que la propiedad existe y el usuario tiene permisos
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      return { error: "Propiedad no encontrada" };
    }

    if (property.agentId !== user.id && user.role !== "ADMIN") {
      return { error: "No tienes permiso para modificar esta propiedad" };
    }

    // 3. Obtener archivos del FormData
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return { error: "No se enviaron imágenes" };
    }

    // 4. Obtener el orden inicial (contar imágenes existentes)
    const existingCount =
      await propertyImageRepository.countByProperty(propertyId);

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
        order: existingCount + i,
        propertyId,
      });

      uploadedImages.push(image);
    }

    // 6. Revalidar
    revalidatePath("/dashboard/propiedades");
    revalidatePath(`/dashboard/propiedades/${propertyId}/editar`);

    return { success: true, images: uploadedImages };
  } catch (error) {
    console.error("Error uploading images:", error);
    return {
      error:
        error instanceof Error ? error.message : "Error al subir las imágenes",
    };
  }
}

/**
 * DELETE PROPERTY IMAGE ACTION
 * Elimina una imagen específica
 */
export async function deletePropertyImageAction(imageId: string) {
  // 1. Verificar autenticación
  const user = await requireRole(["AGENT", "ADMIN"]);

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

    if (property.agentId !== user.id && user.role !== "ADMIN") {
      return { error: "No tienes permiso para eliminar esta imagen" };
    }

    // 4. Eliminar de Storage
    await deletePropertyImage(image.url);

    // 5. Eliminar de BD
    await propertyImageRepository.delete(imageId);

    // 6. Revalidar
    revalidatePath("/dashboard/propiedades");
    revalidatePath(`/dashboard/propiedades/${image.propertyId}/editar`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
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
  const user = await requireRole(["AGENT", "ADMIN"]);

  try {
    // 2. Verificar permisos
    const property = await propertyRepository.findById(propertyId);
    if (!property) {
      return { error: "Propiedad no encontrada" };
    }

    if (property.agentId !== user.id && user.role !== "ADMIN") {
      return { error: "No tienes permiso para modificar esta propiedad" };
    }

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
    console.error("Error reordering images:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al reordenar las imágenes",
    };
  }
}
