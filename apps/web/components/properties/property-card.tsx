"use client";

import type { PropertyWithRelations } from "@repo/database";
import { Bath, Bed, Building2, Heart, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type { SerializedProperty } from "@/lib/utils/serialize-property";

interface PropertyCardProps {
  property: PropertyWithRelations | SerializedProperty;
  actions?: React.ReactNode;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
}

export function PropertyCard({
  property,
  actions,
  onFavoriteToggle,
  isFavorite = false,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<number>(0);

  const images = property.images.length > 0 ? property.images : [];
  const hasMultipleImages = images.length > 1;

  // Format price
  const formattedPrice = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(property.price));

  // Labels
  const transactionTypeLabels: Record<string, string> = {
    SALE: "Venta",
    RENT: "Arriendo",
  };

  const categoryLabels: Record<string, string> = {
    HOUSE: "Casa",
    APARTMENT: "Departamento",
    SUITE: "Suite",
    VILLA: "Villa",
    PENTHOUSE: "Penthouse",
    DUPLEX: "Dúplex",
    LOFT: "Loft",
    LAND: "Terreno",
    COMMERCIAL: "Local Comercial",
    OFFICE: "Oficina",
    WAREHOUSE: "Bodega",
    FARM: "Finca",
  };

  // Navigate images
  const goToNextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Double-tap to favorite
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      setShowHeartAnimation(true);
      onFavoriteToggle?.(property.id);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }

    lastTapRef.current = now;
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      // Swipe threshold
      if (diff > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevImage();
      if (e.key === "ArrowRight") goToNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImageIndex]);

  return (
    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-2xl transition-shadow group">
      {/* Image Container */}
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <Image
            src={images[currentImageIndex].url}
            alt={images[currentImageIndex].alt || property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={currentImageIndex === 0}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Building2 className="h-20 w-20 text-gray-400" />
          </div>
        )}

        {/* Navigation Areas (desktop) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-0 top-0 bottom-0 w-1/3 opacity-0 hover:opacity-100 transition-opacity z-10"
              aria-label="Previous image"
            >
              <div className="h-full flex items-center justify-start pl-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-0 top-0 bottom-0 w-1/3 opacity-0 hover:opacity-100 transition-opacity z-10"
              aria-label="Next image"
            >
              <div className="h-full flex items-center justify-end pr-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </>
        )}

        {/* Progress Dots */}
        {hasMultipleImages && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-1 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "w-6 bg-white"
                    : "w-1 bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          <Badge className="bg-blue-600 backdrop-blur-sm border-blue-400/30 text-white font-bold px-3 py-1 shadow-lg rounded-full">
            {transactionTypeLabels[property.transactionType]}
          </Badge>
          <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-900 font-semibold rounded-full">
            {categoryLabels[property.category]}
          </Badge>
        </div>

        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(property.id);
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </button>
        )}

        {/* Double-tap Heart Animation */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Heart className="w-24 h-24 fill-white text-white animate-ping" />
          </div>
        )}

        {/* Info Overlay (Glassmorphism) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent backdrop-blur-sm p-4 z-20">
          <Link href={`/dashboard/propiedades/${property.id}/editar`}>
            {/* Price */}
            <p className="text-2xl font-bold text-white mb-1">{formattedPrice}</p>

            {/* Title */}
            <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1 hover:underline">
              {property.title}
            </h3>

            {/* Location */}
            {(property.city || property.state) && (
              <div className="flex items-center gap-1 text-white/90 text-sm mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{[property.city, property.state].filter(Boolean).join(", ")}</span>
              </div>
            )}

            {/* Features */}
            <div className="flex items-center gap-4 text-sm text-white/80">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}

              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{Number(property.bathrooms)}</span>
                </div>
              )}

              {property.area && (
                <div className="flex items-center gap-1">
                  <Maximize className="h-4 w-4" />
                  <span>{Number(property.area)} m²</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Actions (if provided) */}
      {actions && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-30">
          {actions}
        </div>
      )}
    </div>
  );
}
