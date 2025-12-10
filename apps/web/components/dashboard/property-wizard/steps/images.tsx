"use client";

import { generatePresignedUploadUrl, getPublicImageUrl } from "@/app/actions/upload";
import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UploadedImage {
  file: File;
  preview: string;
  url?: string; // Public URL after upload
  uploading?: boolean;
  error?: string;
}

export function Step4() {
  const { formData, updateFormData, nextStep, limits } = usePropertyWizardStore();
  const maxImages = limits.maxImages;
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize from store
  useEffect(() => {
    // If formData.imageUrls exists and is not empty, we should reconstruct the state
    // This assumes that if we have imageUrls, the files themselves are not needed for re-upload
    // but we might want to display them. For now, we'll just display them if they are already uploaded.
    if (formData.imageUrls && formData.imageUrls.length > 0) {
      const existingUploadedImages: UploadedImage[] = formData.imageUrls.map(url => ({
        // We don't have the original File object here, so we create a dummy one or handle it differently
        // For display purposes, we only need the URL.
        file: new File([], "placeholder.jpg", { type: "image/jpeg" }), // Placeholder file
        preview: url, // Use the public URL as preview
        url: url,
        uploading: false,
        error: undefined,
      }));
      setImages(existingUploadedImages);
    }
    // Cleanup function for previews created from File objects (if any were added in the current session)
    return () => {
      images.forEach(img => {
        if (img.file && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [formData.imageUrls]); // Depend on imageUrls to re-initialize if they change

  /**
   * Upload a single file using presigned URL
   */
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // 1. Get presigned URL from server
      const presignedResult = await generatePresignedUploadUrl(
        file.name,
        file.type,
        file.size
      );

      if (!presignedResult.success || !presignedResult.uploadUrl || !presignedResult.path) {
        throw new Error(presignedResult.error || "Error al generar URL de carga");
      }

      // 2. Upload directly to Supabase Storage
      const uploadResponse = await fetch(presignedResult.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'x-upsert': 'true', // Allow overwrite if file exists
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // 3. Get public URL
      const publicUrlResult = await getPublicImageUrl(presignedResult.path);
      
      if (!publicUrlResult.success || !publicUrlResult.publicUrl) {
        throw new Error("Error al obtener URL pública");
      }

      return publicUrlResult.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  /**
   * Handle file drop/selection
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Filter out files that would exceed maxFiles
    const filesToProcess = acceptedFiles.slice(0, Math.max(0, 10 - images.length));

    if (filesToProcess.length === 0 && acceptedFiles.length > 0) {
      alert("Has alcanzado el límite máximo de 10 imágenes.");
      return;
    }

    // Add files to state with preview
    const newImagesToAdd: UploadedImage[] = filesToProcess.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setImages(prev => [...prev, ...newImagesToAdd]);
    setIsUploading(true);

    // Upload each file
    const uploadPromises = filesToProcess.map(async (file, index) => {
      // Calculate the correct index for the newly added images
      const imageIndexInState = images.length + index;
      
      try {
        const publicUrl = await uploadFile(file);
        
        // Update image with URL
        setImages(prev => prev.map((img, i) => 
          i === imageIndexInState
            ? { ...img, url: publicUrl ?? undefined, uploading: false }
            : img
        ));

        return publicUrl;
      } catch (error) {
        // Mark as error
        setImages(prev => prev.map((img, i) => 
          i === imageIndexInState
            ? { 
                ...img, 
                uploading: false, 
                error: error instanceof Error ? error.message : "Error al subir" 
              }
            : img
        ));
        return null;
      }
    });

    const newUrls = await Promise.all(uploadPromises);
    setIsUploading(false);

    // Filter successful uploads (non-null)
    const successfulNewUrls = newUrls.filter((url): url is string => url !== null);

    // Get existing URLs from current state (we need to be careful about state updates, 
    // but here we can iterate over the previous 'images' we had access to in the closure 
    // PLUS the new ones we just uploaded)
    
    // Better approach: Get the latest valid URLs from the *filtered* list we just created
    // We know 'images' (from closure) contains the old images.
    const existingUrls = images
      .filter(img => img.url && !img.error)
      .map(img => img.url!);
    
    const allUrls = [...existingUrls, ...successfulNewUrls];
    
    // Update store
    console.log("[ImagesStep] Updating store with URLs:", allUrls);
    updateFormData({ imageUrls: allUrls });
  }, [images, updateFormData]);

  const removeFile = (index: number) => {
    setImages(prev => {
      const imageToRemove = prev[index];
      
      // Revoke preview URL if it was a blob URL
      if (imageToRemove && imageToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      
      const newImages = prev.filter((_, i) => i !== index);
      
      // Update store with new list of uploaded URLs
      const uploadedUrls = newImages
        .filter(img => img.url && !img.error)
        .map(img => img.url!);
      updateFormData({ imageUrls: uploadedUrls });
      
      return newImages;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading || images.length >= 10,
  });

  const handleContinue = () => {
    // Validation: Check if all images are uploaded
    const hasUploadingImages = images.some(img => img.uploading);
    const hasErrors = images.some(img => img.error);
    
    if (hasUploadingImages) {
      alert("Espera a que todas las imágenes terminen de subir");
      return;
    }
    
    if (hasErrors) {
      alert("Algunas imágenes tienen errores. Por favor, elimínalas e intenta de nuevo.");
      return;
    }

    if (images.length === 0) {
      alert("Por favor, sube al menos una imagen de tu propiedad.");
      return;
    }
    
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Galería de Fotos</h2>
        <p className="text-sm text-muted-foreground">
          Sube fotos de alta calidad de tu propiedad. Las imágenes se suben automáticamente.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
          ${isUploading || images.length >= maxImages ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-full bg-muted">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isUploading 
                ? "Subiendo imágenes..." 
                : isDragActive 
                  ? "Suelta las imágenes aquí" 
                  : images.length >= maxImages
                    ? `Límite de ${maxImages} imágenes alcanzado`
                    : "Haz clic o arrastra imágenes aquí"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WEBP hasta 5MB por imagen (Máx {maxImages} en total)
            </p>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.preview}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              
              {/* Upload status overlay */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              
              {/* Error overlay */}
              {image.error && (
                <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center p-2">
                  <p className="text-white text-xs text-center">{image.error}</p>
                </div>
              )}
              
              {/* Success indicator */}
              {image.url && !image.uploading && !image.error && (
                <div className="absolute top-2 left-2 p-1 rounded-full bg-green-500">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {/* Remove button */}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                type="button"
                disabled={image.uploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden submit button to be triggered by WizardLayout */}
      <form id="wizard-step-form" onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="hidden">
        <button type="submit"></button>
      </form>
    </div>
  );
}
