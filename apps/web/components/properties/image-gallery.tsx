/**
 * IMAGE GALLERY COMPONENT
 *
 * Muestra las imágenes existentes de una propiedad
 * - Grid de imágenes
 * - Eliminar imagen individual
 * - Indicador de imagen principal
 */

'use client'

import { useState } from 'react'
import { deletePropertyImageAction } from '@/app/actions/properties'
import { Button } from '@repo/ui'
import { Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface PropertyImage {
  id: string
  url: string
  alt: string | null
  order: number
}

interface ImageGalleryProps {
  images: PropertyImage[]
  onImageDeleted?: () => void
}

export function ImageGallery({ images, onImageDeleted }: ImageGalleryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Ordenar imágenes por orden
  const sortedImages = [...images].sort((a, b) => a.order - b.order)

  // Eliminar imagen
  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
      return
    }

    setDeletingId(imageId)
    setError(null)

    try {
      const result = await deletePropertyImageAction(imageId)

      if (result.error) {
        setError(result.error)
      } else {
        // Callback para refrescar
        onImageDeleted?.()
      }
    } catch (err) {
      setError('Error inesperado al eliminar la imagen')
    } finally {
      setDeletingId(null)
    }
  }

  if (sortedImages.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No hay imágenes. Sube algunas para mostrar tu propiedad.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedImages.map((image, index) => (
          <div key={image.id} className="relative group">
            {/* Imagen */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={image.url}
                alt={image.alt || `Imagen ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>

            {/* Badge de imagen principal */}
            {image.order === 0 && (
              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg">
                Principal
              </span>
            )}

            {/* Botón eliminar */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
                className="h-8 w-8 p-0"
              >
                {deletingId === image.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Número de orden */}
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              #{index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Información */}
      <p className="text-sm text-muted-foreground">
        {sortedImages.length} {sortedImages.length === 1 ? 'imagen' : 'imágenes'} •
        La primera imagen se mostrará como principal
      </p>
    </div>
  )
}
