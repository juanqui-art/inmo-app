"use client";

import { Button, cn } from "@repo/ui";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
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
    <div className="relative group w-full h-full overflow-hidden bg-black">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {images.map((image, index) => (
            <div
              className="relative h-full flex-[0_0_100%] min-w-0 flex items-center justify-center overflow-hidden"
              key={index}
            >
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
                  alt={image.alt || `${title} - imagen ${index + 1}`}
                  fill
                  className="object-contain"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent opacity-60 z-20" />
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
       <div className="absolute bottom-4 right-4 md:right-8 z-10">
          <div className="bg-white/20 text-white px-3.5 py-2 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2 border border-white/30 shadow-sm transition-all hover:bg-white/40">
            <span className="font-bold">{selectedIndex + 1} / {images.length}</span>
            <div className="w-px h-3.5 bg-white/40" />
            <ImageIcon className="w-4 h-4 opacity-90" />
          </div>
       </div>
    </div>
  );
}
