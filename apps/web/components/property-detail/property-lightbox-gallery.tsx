"use client";

import { cn } from "@repo/ui";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface PropertyLightboxGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt?: string | null;
  }>;
  initialIndex?: number;
  onClose: () => void;
  propertyTitle: string;
}

export function PropertyLightboxGallery({
  images,
  initialIndex = 0,
  onClose,
  propertyTitle,
}: PropertyLightboxGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Animate image on change
  useEffect(() => {
    const imageElement = document.querySelector(
      "[data-lightbox-image]",
    ) as HTMLElement;
    if (imageElement) {
      gsap.fromTo(
        imageElement,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );
    }
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const currentImage = images[currentIndex];

  if (!currentImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
    >
      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-0 md:p-4">
        <div className="relative w-full h-full" data-lightbox-image>
          <Image
            src={currentImage.url}
            alt={
              currentImage.alt || `${propertyTitle} - Image ${currentIndex + 1}`
            }
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-white focus:outline-none"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-white focus:outline-none"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-white focus:outline-none"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Counter & Info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white">
          <span className="text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                currentIndex === index
                  ? "border-white"
                  : "border-white/30 hover:border-white/50 opacity-50 hover:opacity-75",
              )}
              aria-label={`Go to image ${index + 1}`}
              aria-current={currentIndex === index}
            >
              <Image
                src={image.url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
