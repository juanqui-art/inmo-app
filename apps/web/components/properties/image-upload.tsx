/**
 * IMAGE UPLOAD COMPONENT
 *
 * Componente para subir imágenes de propiedades
 * - Drag & drop con react-dropzone
 * - Validación client-side
 * - Preview de imágenes
 * - Progress durante upload
 */

"use client";

import { saveUploadedPropertyImagesAction } from "@/app/actions/properties";
import { generatePresignedUploadUrl, getPublicImageUrl } from "@/app/actions/upload";
import { validateImages } from "@/lib/storage/validation";
import type { SubscriptionTier } from "@repo/database";
import { Button } from "@repo/ui";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { LimitReachedModal } from "../modals/limit-reached-modal";

interface ImageUploadProps {
  propertyId: string;
  onUploadComplete?: () => void;
  maxImages: number;
  currentImageCount: number;
  tier: SubscriptionTier; 
}

export function ImageUpload({
  propertyId,
  onUploadComplete,
  maxImages,
  currentImageCount,
  tier,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitData, setLimitData] = useState<{
    currentTier: SubscriptionTier;
    limit: number;
  } | null>(null);

  // Manejar archivos seleccionados (drag & drop o click)
  const onDrop = useCallback((acceptedFiles: File[]) => {

    // Validar cantidad total
    if (currentImageCount + acceptedFiles.length > maxImages) {
      // Mostrar modal de upgrade en lugar de solo texto
      setLimitData({
        currentTier: tier,
        limit: maxImages,
      });
      setLimitModalOpen(true);
      return;
    }

    // Validar
    const validationError = validateImages(acceptedFiles);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFiles(acceptedFiles);

    // Crear previews
    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  }, []);

  // Configurar react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true,
    disabled: isUploading,
  });

  // Eliminar archivo de la selección
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Limpiar URL del preview eliminado
    const previewUrl = previews[index];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Comprimir imagen antes de subir
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5, // Máximo 500KB por imagen
      maxWidthOrHeight: 1920, // Redimensionar si es muy grande
      useWebWorker: true, // No bloquear UI
      fileType: file.type, // Mantener formato original (o usar 'image/webp')
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file; // Si falla, usar original
    }
  };

  // Upload individual file helper
  const uploadSingleFile = async (file: File, index: number): Promise<string | null> => {
    try {
      // 1. Get presigned URL
      const presignedResult = await generatePresignedUploadUrl(
        file.name,
        file.type,
        file.size
      );

      if (!presignedResult.success || !presignedResult.uploadUrl || !presignedResult.path) {
          // If upgrade required, we handle it in the main loop or here
          if (presignedResult.upgradeRequired) {
            setLimitData({
                currentTier: "FREE", 
                limit: presignedResult.currentLimit || 0
            });
            setLimitModalOpen(true);
            throw new Error(presignedResult.error || "Upgrade requerida");
          }
        throw new Error(presignedResult.error || "Error al generar URL");
      }

      // 2. Upload to Storage
      // Use XHR or fetch with progress simulation
      // Here we simulate progress for UX consistency
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
            const current = prev[index] || 0;
            if (current >= 90) return prev;
            return { ...prev, [index]: current + 10 };
        });
      }, 200);

      const uploadResponse = await fetch(presignedResult.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'x-upsert': 'true',
        },
      });
      
      clearInterval(progressInterval);

      if (!uploadResponse.ok) {
        throw new Error("Fallo al subir archivo");
      }

      setUploadProgress(prev => ({ ...prev, [index]: 100 }));

      // 3. Get public URL
      const publicUrlResult = await getPublicImageUrl(presignedResult.path);
      
      if (!publicUrlResult.success || !publicUrlResult.publicUrl) {
        throw new Error("Error al obtener URL pública");
      }

      return publicUrlResult.publicUrl;
    } catch (error) {
      console.error(`Error uploading file ${index}:`, error);
      return null;
    }
  };

  // Subir imágenes
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setError(null);
    setSuccess(false);
    setUploadProgress({});

    try {
      // Paso 1: Comprimir imágenes
      setIsCompressing(true);
      const compressedFiles = await Promise.all(
        selectedFiles.map((file) => compressImage(file)),
      );
      setIsCompressing(false);

      // Paso 2: Iniciar upload en paralelo (Client-side directly to Storage)
      setIsUploading(true);
      
      const uploadPromises = compressedFiles.map((file, index) => 
        uploadSingleFile(file, index)
      );

      const publicUrls = await Promise.all(uploadPromises);
      
      // Filter successful uploads
      const successfulUrls = publicUrls.filter((url): url is string => url !== null);
      
      if (successfulUrls.length === 0) {
        throw new Error("No se pudo subir ninguna imagen");
      }
      
      if (successfulUrls.length < compressedFiles.length) {
          console.warn(`Only ${successfulUrls.length}/${compressedFiles.length} images uploaded successfully`);
          // We continue saving the ones that succeeded
      }

      // Paso 3: Guardar referencias en BD
      const result = await saveUploadedPropertyImagesAction(propertyId, successfulUrls);

      if (result.error) {
        if (result.upgradeRequired) {
          setLimitData({
            currentTier: tier, 
            limit: result.currentLimit || 0,
          });
          setLimitModalOpen(true);
        }
        setError(result.error);
      } else {
        // Mostrar éxito
        setSuccess(true);
        
        // Limpiar después de 1s
        setTimeout(() => {
          setSelectedFiles([]);
          setPreviews([]);
          setUploadProgress({});
          onUploadComplete?.();
        }, 1000);

        // Limpiar mensaje de éxito después de 3s
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
        console.error(err);
      setError(err.message || "Error inesperado al subir las imágenes");
      setUploadProgress({});
    } finally {
      setIsCompressing(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Zona de drag & drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/50"
          }
          ${isUploading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isDragActive ? (
            <>
              <ImagePlus className="h-12 w-12 text-primary" />
              <p className="text-sm font-medium text-primary">
                Suelta las imágenes aquí...
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium">
                Arrastra y suelta imágenes aquí, o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                Plan {tier}: Máximo {maxImages} imágenes ({maxImages - currentImageCount} restantes). 5MB/img.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">
            Imágenes seleccionadas ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={preview} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Progress overlay */}
                  {isUploading && uploadProgress[index] !== undefined && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                      <div className="w-3/4 bg-oslo-gray-200 dark:bg-oslo-gray-700 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[index]}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {Math.round(uploadProgress[index])}%
                      </span>
                    </div>
                  )}
                </div>

                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de subir */}
      {selectedFiles.length > 0 && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || isCompressing}
          className="w-full"
        >
          {isCompressing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Optimizando imágenes...
            </>
          ) : isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir {selectedFiles.length}{" "}
              {selectedFiles.length === 1 ? "imagen" : "imágenes"}
            </>
          )}
        </Button>
      )}

      {/* Mensajes */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/10 p-3">
          <p className="text-sm text-green-600 dark:text-green-400">
            ¡Imágenes subidas exitosamente!
          </p>
        </div>
      )}

      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        limitType="image"
        currentTier={limitData?.currentTier || "FREE"}
        limit={limitData?.limit || 0}
      />
    </div>
  );
}
