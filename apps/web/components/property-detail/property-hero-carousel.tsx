"use client";

import { PropertyImageFallback } from "@/components/map/property-image-fallback";
import { PropertyShareMenu } from "@/components/shared/property-share-menu";
import { cn } from "@repo/ui";
import useEmblaCarousel from "embla-carousel-react";
import { Heart, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { PropertyLightboxGallery } from "./property-lightbox-gallery";

interface PropertyHeroCarouselProps {
  images?: Array<{
    id: string;
    url: string;
    alt?: string | null;
  }>;
  propertyTitle: string;
  propertyId?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

// Mock images for testing/development - Remove or comment out when not needed
const MOCK_IMAGES_FOR_TESTING = [
  {
    id: "mock-1",
    url: "/luxury-modern-real-estate-property-exterior-with-g.jpg",
    alt: "Vista exterior de propiedad moderna",
  },
  {
    id: "mock-2",
    url: "/luxury-modern-real-estate-property-exterior-with-g.jpg",
    alt: "Fachada principal",
  },
  {
    id: "mock-3",
    url: "/luxury-modern-real-estate-property-exterior-with-g.jpg",
    alt: "Diseño arquitectónico",
  },
  {
    id: "mock-4",
    url: "/luxury-modern-real-estate-property-exterior-with-g.jpg",
    alt: "Vista panorámica",
  },
  {
    id: "mock-5",
    url: "/luxury-modern-real-estate-property-exterior-with-g.jpg",
    alt: "Detalles de fachada",
  },
];

export function PropertyHeroCarousel({
  images = [],
  propertyTitle,
  propertyId,
  isFavorite = false,
  onFavoriteToggle,
}: PropertyHeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize carousel
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay logic
  useEffect(() => {
    if (!emblaApi || !isAutoplay || images.length === 0) return;

    const autoplay = () => {
      emblaApi.scrollNext();
    };

    autoplayTimerRef.current = setInterval(autoplay, 5000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [emblaApi, isAutoplay, images.length]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
    setIsAutoplay(false);
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
    setIsAutoplay(false);
  }, [emblaApi]);

  const handleMouseEnter = () => setIsAutoplay(false);
  const handleMouseLeave = () => setIsAutoplay(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext]);

  // Use mock images for testing if no real images exist
  const displayImages = images.length === 0 ? MOCK_IMAGES_FOR_TESTING : images;

  if (displayImages.length === 0) {
    return <PropertyImageFallback title={propertyTitle} />;
  }

  return (
    <>
      <div
        className="relative h-[calc(100vh-18rem)] w-full bg-black overflow-hidden"
        style={{ aspectRatio: "16/9" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Embla Carousel Container */}
        <div
          ref={emblaRef}
          className="h-full w-full overflow-hidden"
          role="region"
          aria-label="Property image carousel"
        >
          <div className="flex h-full w-full">
            {displayImages.map((image, index) => (
              <div key={image.id} className="relative flex-[0_0_100%] flex items-center justify-center overflow-hidden bg-black">
                {/* Ambilight Background (Blurred) */}
                <div className="absolute inset-0 z-0">
                   <Image
                      src={image.url}
                      alt=""
                      fill
                      className="object-cover blur-2xl scale-110 opacity-60 dark:opacity-40"
                      aria-hidden="true"
                   />
                   <div className="absolute inset-0 bg-black/20" /> 
                </div>

                {/* Main Image */}
                <div className="relative z-10 w-full h-full">
                  <Image
                    src={image.url}
                    alt={image.alt || `${propertyTitle} - Image ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top-Right Controls: Actions (Favorite above Share to match Card) */}
        <div className="absolute top-4 right-4 md:right-8 flex flex-col items-end gap-2 z-20">
          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm hover:bg-white/40"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-colors",
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                )}
              />
            </button>
          )}

          {/* Share Button */}
          {propertyId && (
            <PropertyShareMenu
              propertyId={propertyId}
              propertyTitle={propertyTitle}
              buttonClassName="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 text-white shadow-sm"
            />
          )}
        </div>

        {/* Bottom-Right: Image Counter / Gallery Button */}
        <div className="absolute bottom-4 right-4 md:right-8 z-20">
          <button
            onClick={() => setShowLightbox(true)}
            className="bg-white/20 text-white px-3.5 py-2 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2 border border-white/30 shadow-sm transition-all hover:bg-white/40 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Ver galería completa"
          >
            <span className="font-bold">{selectedIndex + 1} / {displayImages.length}</span>
            <div className="w-px h-3.5 bg-white/40" />
            <ImageIcon className="w-4 h-4 opacity-90" />
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <PropertyLightboxGallery
          images={displayImages}
          initialIndex={selectedIndex}
          onClose={() => setShowLightbox(false)}
          propertyTitle={propertyTitle}
        />
      )}
    </>
  );
}
