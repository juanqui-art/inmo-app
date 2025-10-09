/**
 * IMAGE VALIDATION HELPERS
 *
 * Funciones de validación client-side para imágenes
 * (Separado de client.ts para evitar importar código de servidor)
 */

/**
 * Valida múltiples imágenes antes de subirlas
 *
 * @param files - Array de archivos
 * @returns Error message o null si todo está OK
 */
export function validateImages(files: File[]): string | null {
  const MAX_FILES = 10;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (files.length > MAX_FILES) {
    return `Máximo ${MAX_FILES} imágenes permitidas`;
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo de archivo no permitido: ${file.name}. Solo se permiten JPG, PNG y WebP`;
    }

    if (file.size > MAX_SIZE) {
      return `La imagen ${file.name} excede el tamaño máximo de 5MB`;
    }
  }

  return null;
}
