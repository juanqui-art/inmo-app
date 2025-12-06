"use server";

import { requireRole } from "@/lib/auth";
import { canUploadImage } from "@/lib/permissions/property-limits";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

/**
 * GENERATE PRESIGNED UPLOAD URL
 * 
 * Creates a temporary, signed URL that allows the client to upload
 * an image directly to Supabase Storage without exposing credentials.
 * 
 * Flow:
 * 1. Client requests presigned URL from this Server Action
 * 2. Server generates secure, time-limited URL (5 minutes)
 * 3. Client uploads directly to Supabase Storage using the URL
 * 4. Client receives public URL of uploaded image
 * 
 * Benefits:
 * - No file passes through our server (saves bandwidth)
 * - More secure (no credentials exposed to client)
 * - Better performance (direct upload to storage)
 * - More scalable (offloads work to Supabase)
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number
) {
  try {
    // 1. Verify authentication
    const user = await requireRole(["AGENT", "ADMIN"]);

    // 2. Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: `Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(', ')}`,
      };
    }

    // 3. Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      return {
        success: false,
        error: `El archivo es demasiado grande. Tamaño máximo: 5MB`,
      };
    }

    // 4. Check subscription tier limits (this is per-upload, not total)
    // We'll check total count when creating the property
    const imageCheck = canUploadImage(user.subscriptionTier, 1);
    if (!imageCheck.allowed) {
      return {
        success: false,
        error: imageCheck.reason,
        upgradeRequired: true,
        currentLimit: imageCheck.limit,
      };
    }

    // 5. Generate unique file path
    // Format: {userId}/{timestamp}-{sanitizedFileName}
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
      .toLowerCase();
    
    const uniquePath = `${user.id}/${Date.now()}-${sanitizedFileName}`;

    // 6. Create presigned upload URL (valid for 5 minutes)
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .createSignedUploadUrl(uniquePath);

    if (error) {
      logger.error(
        { err: error, userId: user.id, fileName },
        "[Upload] Error creating presigned URL"
      );
      return {
        success: false,
        error: "Error al generar URL de carga",
      };
    }

    // 7. Return presigned URL and path
    return {
      success: true,
      uploadUrl: data.signedUrl,  // Temporary URL for upload (expires in 5 min)
      path: data.path,             // Path in storage bucket
      token: data.token,           // Token for upload verification
    };
  } catch (error) {
    logger.error({ err: error }, "[Upload] Error in generatePresignedUploadUrl");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor",
    };
  }
}

/**
 * GET PUBLIC URL FOR UPLOADED IMAGE
 * 
 * Converts a storage path to a public URL after successful upload.
 * This is called after the client has uploaded the file using the presigned URL.
 */
export async function getPublicImageUrl(path: string) {
  try {
    const supabase = await createClient();
    
    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(path);

    return {
      success: true,
      publicUrl: data.publicUrl,
    };
  } catch (error) {
    logger.error({ err: error, path }, "[Upload] Error getting public URL");
    return {
      success: false,
      error: "Error al obtener URL pública",
    };
  }
}
