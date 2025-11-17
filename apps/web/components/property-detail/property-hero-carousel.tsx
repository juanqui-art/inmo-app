"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { cn } from "@repo/ui";
import { PropertyImageFallback } from "@/components/map/property-image-fallback";
import { PropertyLightboxGallery } from "./property-lightbox-gallery";
import { PropertyShareMenu } from "@/components/shared/property-share-menu";

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
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize carousel
  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());

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

  const goToSlide = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
      setIsAutoplay(false);
    },
    [emblaApi],
  );

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
        className="relative h-[calc(100vh-18rem)] w-full bg-oslo-gray-100 dark:bg-oslo-gray-900 overflow-hidden"
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
              <div key={image.id} className="relative flex-[0_0_100%]">
                <Image
                  src={image.url}
                  alt={image.alt || `${propertyTitle} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dark Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top-Right Controls: Counter, Share, Favorite */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
          {/* Image Counter */}
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur">
            {selectedIndex + 1} / {displayImages.length}
          </div>

          {/* Share Button */}
          {propertyId && (
            <PropertyShareMenu
              propertyId={propertyId}
              propertyTitle={propertyTitle}
              buttonClassName="w-10 h-10"
            />
          )}

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle();
              }}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </button>
          )}
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-white focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-white focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Navigation */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  selectedIndex === index
                    ? "bg-white w-8 h-2"
                    : "bg-white/50 hover:bg-white/75 w-2 h-2",
                )}
                aria-label={`Go to image ${index + 1}`}
                aria-current={selectedIndex === index}
              />
            ))}
          </div>
        )}

        {/* View Full Gallery Button */}
        {displayImages.length > 1 && (
          <button
            onClick={() => setShowLightbox(true)}
            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg backdrop-blur transition-all duration-300 text-sm font-medium focus:ring-2 focus:ring-white focus:outline-none"
            aria-label="View full gallery"
          >
            Ver galería completa
          </button>
        )}
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
