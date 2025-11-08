"use client";

import type { PropertyWithRelations } from "@repo/database";
import { Bath, Bed, Heart, MapPin, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import type { SerializedProperty } from "@/lib/utils/serialize-property";
import { PropertyImageFallback } from "@/components/map/property-image-fallback";
import {
  CATEGORY_BADGE_STYLE,
  TRANSACTION_BADGE_STYLES,
} from "@/lib/styles/property-card-styles";
import { generateSlug } from "@/lib/utils/slug-generator";

interface PropertyCardProps {
  property: PropertyWithRelations | SerializedProperty;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorite?: boolean;
  priority?: boolean;
}

export function PropertyCard({
  property,
  onFavoriteToggle,
  isFavorite = false,
  priority = false,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<number>(0);

  const images = property.images?.length > 0 ? property.images : [];
  const hasMultipleImages = images.length > 1;
  const imageUrl = images[currentImageIndex]?.url;

  // Format price
  const formattedPrice = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(property.price));

  // Labels
  const transactionTypeLabels: Record<string, string> = {
    SALE: "En Venta",
    RENT: "En Alquiler",
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

  const transactionBadgeStyle =
    property.transactionType === "SALE"
      ? TRANSACTION_BADGE_STYLES.SALE
      : TRANSACTION_BADGE_STYLES.RENT;

  // Navigate images
  const goToNextImage = () => {
    if (hasMultipleImages && images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrevImage = () => {
    if (hasMultipleImages && images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length,
      );
    }
  };

  // Double-tap to favorite
  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      setShowHeartAnimation(true);
      onFavoriteToggle?.(property.id);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }

    lastTapRef.current = now;
  };

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0]?.clientX || 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0]?.clientX || 0;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextImage();
      } else {
        goToPrevImage();
      }
    }
  };

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Prevent gallery navigation when typing in an input
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") goToPrevImage();
      if (e.key === "ArrowRight") goToNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentImageIndex]); // Re-bind if index changes, though not strictly necessary

  return (
    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-oslo-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 group border border-oslo-gray-800 hover:border-oslo-gray-700">
      {/* Image Container & Overlays */}
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Property Image Gallery"
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover brightness-110 transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority && currentImageIndex === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
          </>
        ) : (
          <PropertyImageFallback title={property.title} />
        )}

        {/* Top Content: Badges & Favorite Button */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <div className="flex flex-col gap-2">
            <Badge className={transactionBadgeStyle}>
              {transactionTypeLabels[property.transactionType]}
            </Badge>
            {property.category && (
              <Badge variant="secondary" className={CATEGORY_BADGE_STYLE}>
                {categoryLabels[property.category] || property.category}
              </Badge>
            )}
          </div>

          {onFavoriteToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(property.id);
              }}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </button>
          )}
        </div>

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            {/* Progress Dots */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex justify-center gap-1.5 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden md:block">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 active:scale-95 z-20"
                aria-label="Previous image"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 active:scale-95 z-20"
                aria-label="Next image"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Double-tap Heart Animation */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <Heart className="w-24 h-24 text-white/80 animate-heart-pulse-fast" />
          </div>
        )}

        {/* Bottom Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <Link
            href={`/propiedades/${property.id}-${generateSlug(property.title)}`}
            className="block"
          >
            <div className="space-y-2">
              <div>
                <p className="text-white text-3xl font-medium font-stretch-120% drop-shadow-lg">
                  {formattedPrice}
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg line-clamp-1 hover:underline drop-shadow-md">
                  {property.title}
                </h3>
                {(property.city || property.state) && (
                  <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {[property.city, property.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-white/90 mt-3 pt-3 border-t border-white/20">
              {Number(property.bedrooms) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4" />
                  <span className="font-semibold">{property.bedrooms}</span>
                </div>
              )}
              {Number(property.bathrooms) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  <span className="font-semibold">
                    {Number(property.bathrooms)}
                  </span>
                </div>
              )}
              {Number(property.area) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Maximize className="h-4 w-4" />
                  <span className="font-semibold">
                    {Number(property.area)}m²
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
