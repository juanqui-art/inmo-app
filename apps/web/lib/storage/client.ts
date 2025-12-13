/**
 * SUPABASE STORAGE HELPERS
 *
 * Funciones para manejar la carga y eliminación de imágenes
 * en Supabase Storage
 */

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

const BUCKET_NAME = "property-images";

/**
 * Sube una imagen a Supabase Storage
 *
 * @param file - Archivo de imagen
 * @param propertyId - ID de la propiedad
 * @returns URL pública de la imagen
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string,
): Promise<string> {
  const supabase = await createClient();

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen");
  }

  // Validar tamaño (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error("La imagen no puede exceder 5MB");
  }

  // Generar nombre único: propertyId/timestamp-uuid.ext
  const timestamp = Date.now();
  const uuid = crypto.randomUUID().split("-")[0];
  const extension = file.name.split(".").pop();
  const fileName = `${propertyId}/${timestamp}-${uuid}.${extension}`;

  // Subir archivo
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    logger.error(
      { err: error, propertyId, fileName, fileSize: file.size },
      "[Storage] Error uploading image"
    );
    throw new Error("Error al subir la imagen");
  }

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Elimina una imagen de Supabase Storage
 *
 * @param path - Ruta del archivo en Storage (extraída de la URL)
 */
export async function deletePropertyImage(path: string): Promise<void> {
  const supabase = await createClient();

  // Extraer path de la URL si es una URL completa
  const splitPath = path.split("property-images/");
  const filePath =
    path.includes("property-images/") && splitPath[1] ? splitPath[1] : path;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    logger.error(
      { err: error, path, filePath },
      "[Storage] Error deleting image"
    );
    throw new Error("Error al eliminar la imagen");
  }
}

/**
 * Obtiene la URL pública de una imagen
 *
 * @param path - Ruta del archivo en Storage
 * @returns URL pública
 */
export async function getPublicUrl(path: string): Promise<string> {
  const supabase = await createClient();

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return data.publicUrl;
}
