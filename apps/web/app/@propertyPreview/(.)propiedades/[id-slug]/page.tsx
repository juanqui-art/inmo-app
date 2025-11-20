"use client";

/**
 * PROPERTY PREVIEW MODAL - Intercepted Route
 *
 * This file is shown when user navigates to /propiedades/[id-slug]
 * via client-side navigation (soft navigation).
 *
 * If user accesses directly or refreshes, the full page at
 * (public)/propiedades/[id-slug]/page.tsx will be shown instead.
 *
 * FEATURES:
 * - Simplified preview with essential info
 * - Single hero image (no carousel)
 * - Basic stats and truncated description
 * - "View full details" CTA
 * - Favorite button
 */

import { Dialog, DialogContent, DialogTitle } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Bed, Bath, Maximize, MapPin, Heart, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPropertyPreviewAction } from "@/app/actions/properties";
import { toggleFavoriteAction, checkIfFavoriteAction } from "@/app/actions/favorites";
import { toast } from "sonner";

interface PropertyPreviewData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  address: string;
  city: string | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: { url: string; alt: string | null }[];
  agent: {
    name: string | null;
    email: string;
  } | null;
}

export default function PropertyPreviewModal({
  params,
}: {
  params: Promise<{ "id-slug": string }>;
}) {
  const router = useRouter();
  const [property, setProperty] = useState<PropertyPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Extract ID from id-slug parameter
  const extractId = (idSlug: string): string => {
    const uuidLength = 36;
    return idSlug.substring(0, uuidLength);
  };

  useEffect(() => {
    async function loadProperty() {
      try {
        const resolvedParams = await params;
        const propertyId = extractId(resolvedParams["id-slug"]);

        // Fetch property and favorite status in parallel
        const [propertyResult, favoriteResult] = await Promise.all([
          getPropertyPreviewAction(propertyId),
          checkIfFavoriteAction(propertyId),
        ]);

        if (!propertyResult.success || !propertyResult.data) {
          setError(propertyResult.error || "Propiedad no encontrada");
          return;
        }

        setProperty(propertyResult.data);
        setIsFavorite(favoriteResult.success && favoriteResult.isFavorite);
      } catch {
        setError("Error al cargar la propiedad");
      } finally {
        setIsLoading(false);
      }
    }

    loadProperty();
  }, [params]);

  const handleOpenChange = (open: boolean | undefined) => {
    if (!open) {
      router.back();
    }
  };

  const handleFavoriteToggle = () => {
    if (!property) return;

    startTransition(async () => {
      const result = await toggleFavoriteAction(property.id);
      if (result.success) {
        setIsFavorite(result.isFavorite);
        toast.success(
          result.isFavorite
            ? "Agregado a favoritos"
            : "Eliminado de favoritos"
        );
      } else {
        toast.error(result.error || "Error al actualizar favoritos");
      }
    });
  };

  const formattedPrice = property
    ? new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(property.price)
    : "";

  const heroImage = property?.images[0];

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden sm:rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {property ? property.title : "Vista previa de propiedad"}
        </DialogTitle>
        {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6">
              <p className="text-destructive">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground"
              >
                Volver
              </button>
            </div>
          ) : property ? (
            <>
              {/* Hero Image */}
              <div className="relative aspect-[16/10] bg-muted">
                {heroImage ? (
                  <Image
                    src={heroImage.url}
                    alt={heroImage.alt || property.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-oslo-gray-100 dark:bg-oslo-gray-900">
                    <span className="text-4xl">🏠</span>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => router.back()}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Favorite button */}
                <button
                  onClick={handleFavoriteToggle}
                  disabled={isPending}
                  className="absolute top-3 left-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                  aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                  />
                </button>

                {/* Image counter */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
                    +{property.images.length - 1} fotos
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Price */}
                <div>
                  <p className="text-3xl font-bold">{formattedPrice}</p>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold">{property.title}</h2>

                {/* Location */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {property.address}
                    {property.city && `, ${property.city}`}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 py-3 border-y border-border">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {property.bedrooms} hab.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {property.bathrooms} baños
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {property.area} m²
                    </span>
                  </div>
                </div>

                {/* Description (truncated) */}
                {property.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {property.description}
                  </p>
                )}

                {/* Agent info */}
                {property.agent && (
                  <div className="text-sm text-muted-foreground">
                    Agente: {property.agent.name || property.agent.email}
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href={`/propiedades/${property.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/propiedades/${property.id}`);
                  }}
                  className="block w-full py-3 px-4 bg-primary text-primary-foreground text-center font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ver detalles completos
                </Link>
              </div>
            </>
          ) : null}
      </DialogContent>
    </Dialog>
  );
}
