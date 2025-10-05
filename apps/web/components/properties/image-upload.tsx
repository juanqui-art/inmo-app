/**
 * IMAGE UPLOAD COMPONENT
 *
 * Componente para subir imágenes de propiedades
 * - Validación client-side
 * - Preview de imágenes
 * - Progress durante upload
 */

'use client'

import { useState, useRef } from 'react'
import { uploadPropertyImagesAction } from '@/app/actions/properties'
import { validateImages } from '@/lib/storage/validation'
import { Button } from '@repo/ui'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  propertyId: string
  onUploadComplete?: () => void
}

export function ImageUpload({ propertyId, onUploadComplete }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validar
    const validationError = validateImages(files)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSelectedFiles(files)

    // Crear previews
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  // Eliminar archivo de la selección
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)

    // Limpiar URL del preview eliminado
    const previewUrl = previews[index]
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFiles(newFiles)
    setPreviews(newPreviews)
  }

  // Subir imágenes
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('images', file)
      })

      const result = await uploadPropertyImagesAction(propertyId, formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        // Limpiar
        setSelectedFiles([])
        setPreviews([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Callback
        onUploadComplete?.()

        // Limpiar mensaje de éxito después de 3s
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('Error inesperado al subir las imágenes')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input de archivo */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Seleccionar Imágenes
          </Button>
        </label>
        <p className="text-sm text-muted-foreground mt-2">
          Máximo 10 imágenes, 5MB cada una. Formatos: JPG, PNG, WebP
        </p>
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
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Principal
                  </span>
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
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir {selectedFiles.length} {selectedFiles.length === 1 ? 'imagen' : 'imágenes'}
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
    </div>
  )
}
