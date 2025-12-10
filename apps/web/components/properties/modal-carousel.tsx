"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ModalCarouselProps {
  images: { url: string; alt: string | null }[];
  title: string;
}

export function ModalCarousel({ images, title }: ModalCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full bg-muted flex items-center justify-center">
         <span className="text-4xl">🏠</span>
      </div>
    );
  }

  return (
    <div className="relative group aspect-[4/3] w-full overflow-hidden bg-muted">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {images.map((image, index) => (
            <div
              className="relative h-full flex-[0_0_100%] min-w-0"
              key={index}
            >
              <Image
                src={image.url}
                alt={image.alt || `${title} - imagen ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient overlay for text readability if needed */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Visible on hover only for desktop */}
      {images.length > 1 && (
        <>
            {/* Left Button */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
             <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm rounded-full"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Right Button */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
             <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 bg-black/30 hover:bg-black/50 text-white border-0 backdrop-blur-sm rounded-full"
                 onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === selectedIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              )}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

       {/* Image counter badge */}
       <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
         {selectedIndex + 1} / {images.length}
       </div>
    </div>
  );
}
