"use server";

import { requireRole } from "@/lib/auth";
import {
    canCreateProperty,
} from "@/lib/permissions/property-limits";
import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { logger } from "@/lib/utils/logger";
import { propertyImageRepository, propertyRepository } from "@repo/database";
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

  // 3. Check subscription tier limits
  const permissionCheck = await canCreateProperty(user.id);
  if (!permissionCheck.allowed) {
    return {
      success: false,
      error: permissionCheck.reason,
      upgradeRequired: true,
      currentLimit: permissionCheck.limit,
    };
  }

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
    // 5. Create property using repository
    const property = await propertyRepository.create(
      {
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
      },
      user.id
    );

    // 6. Save image URLs to database (images already uploaded via presigned URLs)
    console.log("[Wizard] Image URLs received:", validatedData.data.imageUrls);
    
    if (validatedData.data.imageUrls && validatedData.data.imageUrls.length > 0) {
      console.log(`[Wizard] Saving ${validatedData.data.imageUrls.length} images for property ${property.id}...`);
      
      for (let i = 0; i < validatedData.data.imageUrls.length; i++) {
        const url = validatedData.data.imageUrls[i];
        
        // Skip if URL is undefined or empty
        if (!url) {
          console.log(`[Wizard] Skipping empty URL at index ${i}`);
          continue;
        }
        
        console.log(`[Wizard] Attempting to save image ${i + 1}:`, url);
        
        try {
          const savedImage = await propertyImageRepository.create({
            url,
            alt: property.title,
            order: i,
            propertyId: property.id,
          });
          console.log(`[Wizard] Image ${i + 1} saved successfully. ID: ${savedImage.id}, PropertyID: ${savedImage.propertyId}`);
          
          // Verify immediate persistence
          const verifyImage = await propertyImageRepository.findById(savedImage.id);
          if (verifyImage) {
             console.log(`[Wizard] Verification successful: Image ${savedImage.id} found in DB.`);
          } else {
             console.error(`[Wizard] CRITICAL: Image ${savedImage.id} reported saved but not found in DB immediately after!`);
          }

        } catch (error) {
          console.error(`[Wizard] Error saving image ${i + 1}:`, error);
          if (error instanceof Error) {
             console.error(`[Wizard] Error stack:`, error.stack);
             console.error(`[Wizard] Error name:`, error.name);
             console.error(`[Wizard] Error message:`, error.message);
          }
          logger.error(
            { err: error, propertyId: property.id, imageIndex: i },
            "[Property] Error saving image URL"
          );
          // Continue with other images even if one fails
        }
      }
      
      console.log("[Wizard] Finished image saving process");
    } else {
      console.log("[Wizard] No image URLs to save");
    }

    // 7. Revalidate caches
    revalidatePath("/mapa");
    revalidatePath("/dashboard/propiedades");

    return {
      success: true,
      propertyId: property.id,
    };
  } catch (error) {
    logger.error({ err: error, userId: user.id }, "Error creating property from wizard");
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al crear la propiedad",
    };
  }
}
