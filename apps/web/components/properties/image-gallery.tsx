/**
 * IMAGE GALLERY COMPONENT
 *
 * Muestra las imágenes existentes de una propiedad
 * - Grid de imágenes con drag & drop para reordenar
 * - Eliminar imagen individual
 * - Indicador de imagen principal
 */

"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@repo/ui";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  deletePropertyImageAction,
  reorderPropertyImagesAction,
} from "@/app/actions/properties";

interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

interface ImageGalleryProps {
  images: PropertyImage[];
  propertyId: string;
  onImageDeleted?: () => void;
  onImagesReordered?: () => void;
}

// Skeleton loading component
function ImageGallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-square bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Cargando imágenes...</p>
    </div>
  );
}

// Componente sortable individual
function SortableImageItem({
  image,
  index,
  onDelete,
  isDeleting,
}: {
  image: PropertyImage;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Imagen */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-move">
        <Image
          src={image.url}
          alt={image.alt || `Imagen ${index + 1}`}
          fill
          className="object-cover"
        />

        {/* Handle para arrastrar */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Badge de imagen principal */}
      {image.order === 0 && (
        <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg">
          Principal
        </span>
      )}

      {/* Botón eliminar */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(image.id)}
          disabled={isDeleting}
          className="h-8 w-8 p-0"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Número de orden */}
      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        #{index + 1}
      </span>
    </div>
  );
}

export function ImageGallery({
  images,
  propertyId,
  onImageDeleted,
  onImagesReordered,
}: ImageGalleryProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<PropertyImage[]>(
    [...images].sort((a, b) => a.order - b.order),
  );
  const [isReordering, setIsReordering] = useState(false);

  // Fix hydration mismatch: solo renderizar después de montar en cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Mostrar skeleton mientras no está montado (evita hydration mismatch)
  if (!isMounted) {
    return <ImageGallerySkeleton />;
  }

  // Manejar reordenamiento
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localImages.findIndex((img) => img.id === active.id);
    const newIndex = localImages.findIndex((img) => img.id === over.id);

    // Actualizar estado local inmediatamente (optimistic UI)
    const newImages = arrayMove(localImages, oldIndex, newIndex);
    setLocalImages(newImages);

    // Actualizar en el servidor
    setIsReordering(true);
    setError(null);

    try {
      const imageIds = newImages.map((img) => img.id);

      const result = await reorderPropertyImagesAction(propertyId, imageIds);

      if (result.error) {
        // Revertir si hay error
        setLocalImages(localImages);
        setError(result.error);
      } else {
        // Callback para refrescar
        onImagesReordered?.();
      }
    } catch (_err) {
      // Revertir si hay error
      setLocalImages(localImages);
      setError("Error inesperado al reordenar las imágenes");
    } finally {
      setIsReordering(false);
    }
  };

  // Eliminar imagen
  const handleDelete = async (imageId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) {
      return;
    }

    setDeletingId(imageId);
    setError(null);

    try {
      const result = await deletePropertyImageAction(imageId);

      if (result.error) {
        setError(result.error);
      } else {
        // Actualizar estado local
        setLocalImages(localImages.filter((img) => img.id !== imageId));
        // Callback para refrescar
        onImageDeleted?.();
      }
    } catch (_err) {
      setError("Error inesperado al eliminar la imagen");
    } finally {
      setDeletingId(null);
    }
  };

  if (localImages.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">
          No hay imágenes. Sube algunas para mostrar tu propiedad.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Grid de imágenes con drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localImages.map((img) => img.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {localImages.map((image, index) => (
              <SortableImageItem
                key={image.id}
                image={image}
                index={index}
                onDelete={handleDelete}
                isDeleting={deletingId === image.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Información */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {localImages.length}{" "}
          {localImages.length === 1 ? "imagen" : "imágenes"} • Arrastra para
          reordenar
        </p>
        {isReordering && (
          <span className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Guardando orden...
          </span>
        )}
      </div>
    </div>
  );
}
