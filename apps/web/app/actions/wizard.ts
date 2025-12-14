"use server";

import { requireRole } from "@/lib/auth";
import {
    canCreateProperty,
    canUploadImage,
} from "@/lib/permissions/property-limits";
import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for wizard data validation
const wizardPropertySchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  transactionType: z.enum(["SALE", "RENT"]),
  category: z.string(),
  
  // Step 2: Location
  address: z.string().min(5, "La dirección es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado/provincia es requerido"),
  zipCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  
  // Step 3: Features
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  area: z.number().positive("El área debe ser mayor a 0"),
  amenities: z.array(z.string()).default([]),
  
  // Step 4: Image URLs (already uploaded via API route)
  imageUrls: z.array(z.string()).default([]),
});

type WizardPropertyData = z.infer<typeof wizardPropertySchema>;

/**
 * CREATE PROPERTY FROM WIZARD
 * 
 * Handles property creation from the multi-step wizard.
 * Images should be uploaded separately via /api/upload-property-images
 * and their URLs passed in the imageUrls array.
 * 
 * This avoids the 1MB Server Action body limit.
 */
export async function createPropertyFromWizard(
  data: WizardPropertyData
) {
  // 1. Verificar que el usuario es AGENT o ADMIN
  const user = await requireRole(["AGENT", "ADMIN"]);

  // 2. Rate limiting
  try {
    await enforceRateLimit({ userId: user.id, tier: "property-create" });
  } catch (error) {
    if (isRateLimitError(error)) {
      logger.warn({ userId: user.id, tier: "property-create" }, "[Property] Rate limit exceeded");
      return { 
        success: false,
        error: error.message 
      };
    }
    throw error;
  }

  // 3. Removed external check, moving to transaction for atomicity
  /*
  const permissionCheck = await canCreateProperty(user.id);
  if (!permissionCheck.allowed) {
    return {
      success: false,
      error: permissionCheck.reason,
      upgradeRequired: true,
      currentLimit: permissionCheck.limit,
    };
  }
  */

  // 4. Validate data with Zod
  const validatedData = wizardPropertySchema.safeParse(data);

  if (!validatedData.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: validatedData.error.flatten().fieldErrors,
    };
  }

  try {
    // 5-6. TRANSACTION: Create property + images atomically
    // ATOMICITY PROTECTION: All-or-nothing operation
    // - Property creation
    // - Image references creation
    // If ANY step fails, entire operation is rolled back (no orphaned properties)
    const property = await db.$transaction(async (tx) => {
      // 1. Check Property Limit (INSIDE TX)
      // Pass 'tx' to verify limit with current transaction snapshot
      const permCheck = await canCreateProperty(user.id, tx);
      if (!permCheck.allowed) {
        throw new Error(permCheck.reason || "Límite de propiedades excedido");
      }

      // Create property
      const newProperty = await tx.property.create({
        data: {
          title: validatedData.data.title,
          description: validatedData.data.description,
          price: validatedData.data.price,
          transactionType: validatedData.data.transactionType,
          category: validatedData.data.category as any, // Cast to PropertyCategory enum
          status: "AVAILABLE",
          address: validatedData.data.address,
          city: validatedData.data.city,
          state: validatedData.data.state,
          zipCode: validatedData.data.zipCode ?? null,
          latitude: validatedData.data.latitude,
          longitude: validatedData.data.longitude,
          bedrooms: validatedData.data.bedrooms,
          bathrooms: validatedData.data.bathrooms,
          area: validatedData.data.area,
          amenities: validatedData.data.amenities,
          agentId: user.id,
        },
      });

      logger.info(
        { propertyId: newProperty.id, imageCount: validatedData.data.imageUrls.length },
        "[Wizard] Property created, saving images"
      );

      // Save image URLs (images already uploaded via presigned URLs)
      if (validatedData.data.imageUrls && validatedData.data.imageUrls.length > 0) {
        const imagesToCreate = validatedData.data.imageUrls
          .filter(url => url) // Filter out empty URLs
          .map((url, index) => ({
            url,
            alt: newProperty.title,
            order: index,
            propertyId: newProperty.id,
          }));

        if (imagesToCreate.length > 0) {
          // 2. Check Image Limit (INSIDE TX)
          const imageCheck = canUploadImage(user.subscriptionTier, imagesToCreate.length);
          if (!imageCheck.allowed) {
             throw new Error(imageCheck.reason || "Límite de imágenes excedido");
          }

          // Create all images atomically (all-or-nothing)
          await tx.propertyImage.createMany({
            data: imagesToCreate,
          });

          logger.info(
            { propertyId: newProperty.id, imageCount: imagesToCreate.length },
            "[Wizard] Images saved successfully"
          );
        }
      }

      return newProperty;
    });

    // 7. Revalidate caches
    revalidatePath("/mapa");
    revalidatePath("/dashboard/propiedades");

    logger.info(
      { propertyId: property.id, userId: user.id },
      "[Wizard] Property creation completed successfully"
    );

    return {
      success: true,
      propertyId: property.id,
    };
  } catch (error) {
    logger.error({ err: error, userId: user.id }, "[Wizard] Error creating property from wizard");
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al crear la propiedad",
    };
  }
}
