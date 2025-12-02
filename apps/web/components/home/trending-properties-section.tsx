/**
 * TrendingPropertiesSection - Most Shared/Viewed Properties
 *
 * PATTERN: Server Component with Data Fetching
 *
 * WHY show trending properties?
 * - Social proof: Popular properties attract more interest
 * - FOMO: Users don't want to miss hot deals
 * - Discovery: Helps users find what others love
 * - Engagement: Creates urgency to act
 *
 * TRENDING ALGORITHM:
 * Formula: (shares * 3) + views
 * - Shares weighted 3x (stronger signal)
 * - Views count as secondary signal
 * - Time decay (future): Recent activity counts more
 *
 * WHY this formula?
 * - Shares indicate strong interest
 * - Prevents view-only properties from dominating
 * - Balances popularity with quality
 *
 * ALTERNATIVE 1: Just by shares
 * ❌ New properties can't trend
 * ❌ Ignores views
 * ✅ Simple algorithm
 *
 * ALTERNATIVE 2: Machine learning
 * ❌ Overkill for MVP
 * ❌ Complex to maintain
 * ✅ More accurate predictions
 *
 * ✅ We chose Weighted formula because:
 * - Simple to understand
 * - Easy to debug
 * - Good enough for MVP
 * - Can evolve to ML later
 *
 * RESOURCES:
 * - https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9
 * - https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
 */

"use client";

import { AuthModal } from "@/components/auth/auth-modal";
import { PropertyCard } from "@/components/properties/property-card";
import { useFavorites } from "@/hooks/use-favorites";
import type { SerializedProperty } from "@repo/database";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ViewMoreCard } from "./view-more-card";

interface TrendingPropertiesSectionProps {
  properties: SerializedProperty[];
  isAuthenticated?: boolean;
}

export function TrendingPropertiesSection({
  properties,
  isAuthenticated = false,
}: TrendingPropertiesSectionProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPropertyId, setPendingPropertyId] = useState<string | null>(
    null,
  );

  const handleFavoriteClick = (propertyId: string) => {
    if (!isAuthenticated) {
      setPendingPropertyId(propertyId);
      setShowAuthModal(true);
      return;
    }
    toggleFavorite(propertyId);
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    skipSnaps: false,
    dragFree: false,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const updateButtonStates = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    updateButtonStates();
    emblaApi.on("select", updateButtonStates);
    emblaApi.on("reInit", updateButtonStates);
    return () => {
      emblaApi.off("select", updateButtonStates);
      emblaApi.off("reInit", updateButtonStates);
    };
  }, [emblaApi, updateButtonStates]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const displayedProperties = properties.slice(0, 9);

  if (displayedProperties.length === 0) {
    return null;
  }

  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8 bg-oslo-gray-1000"
      aria-label="Propiedades Populares"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-oslo-gray-100">
              Propiedades Populares
            </h2>
            <p className="text-oslo-gray-400 mt-2">
              Las propiedades que más interés están generando.
            </p>
          </div>
          {/* Navigation Buttons */}
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Ver propiedades anteriores"
              className="p-2 rounded-full bg-oslo-gray-800 border-2 border-oslo-gray-700 hover:border-indigo-500 hover:bg-oslo-gray-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-oslo-gray-700 transition-all duration-200 text-oslo-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Ver más propiedades"
              className="p-2 rounded-full bg-oslo-gray-800 border-2 border-oslo-gray-700 hover:border-indigo-500 hover:bg-oslo-gray-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-oslo-gray-700 transition-all duration-200 text-oslo-gray-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Fade edge gradient - indicates more content */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-oslo-gray-1000/60 via-oslo-gray-1000/30 to-transparent pointer-events-none z-10 sm:hidden" />
          
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 -ml-4 isolate">
              {displayedProperties.map((property, index) => (
                <div
                  key={property.id}
                  className="flex-[0_0_88%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <PropertyCard
                    property={property}
                    onFavoriteToggle={handleFavoriteClick}
                    isFavorite={isFavorite(property.id)}
                    priority={index < 3}
                  />
                </div>
              ))}
              <div className="flex-[0_0_88%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                <ViewMoreCard href="/propiedades?sort=trending" />
              </div>
            </div>
          </div>

          {/* Progress Indicators (Dots) - Mobile only */}
          {scrollSnaps.length > 1 && (
            <div className="flex justify-center gap-2 mt-6 sm:hidden">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollTo(index)}
                  aria-label={`Ir a grupo ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex
                      ? "w-8 bg-indigo-500"
                      : "w-2 bg-oslo-gray-700 hover:bg-oslo-gray-600"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        propertyId={pendingPropertyId || undefined}
      />
    </section>
  );
}
