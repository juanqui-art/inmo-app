/**
 * RecentListingsSection - Static Grid of Recent Properties
 *
 * PATTERN: Static Grid (NOT Carousel)
 *
 * WHY static grid here?
 * - Balance: Already have carousel above (Featured Properties)
 * - SEO: All property links visible to crawlers
 * - Simplicity: No JavaScript needed
 * - Fast: Instant render, no carousel logic
 *
 * ALTERNATIVE 1: Carousel (like Featured)
 * ✅ Can show more properties (8-12)
 * ❌ Too many carousels = cognitive overload
 * ❌ User fatigue (already interacted with carousel above)
 *
 * ALTERNATIVE 2: Infinite Scroll
 * ✅ Shows unlimited properties
 * ❌ Bad for footer (can't reach it)
 * ❌ Users lose their place
 * ❌ Complex implementation
 *
 * ✅ We chose Static Grid because:
 * - Mix of patterns = better UX
 * - Featured = carousel (curated selection)
 * - Recent = grid (quick overview)
 * - Links to full listings page for more
 *
 * GRID LAYOUT:
 * - Mobile: 1 column (100%)
 * - Tablet: 2 columns (50%)
 * - Desktop: 4 columns (25%)
 *
 * WHY 4 columns on desktop?
 * - Featured shows 3 cards (differentiation)
 * - 4 cards = perfect use of space
 * - Not too crowded
 *
 * PERFORMANCE:
 * - Static: No hydration cost
 * - Images: Next.js Image optimization
 * - Lazy load: Below the fold (automatic)
 *
 * PITFALLS:
 * - ⚠️ Don't show too many (8 is sweet spot)
 * - ⚠️ Must have CTA to view more
 * - ⚠️ Ensure responsive on all devices
 *
 * RESOURCES:
 * - https://web.dev/css-grid/
 * - https://cssgrid-generator.netlify.app/
 */

"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PropertyCard } from "@/components/properties/property-card";
import type { SerializedProperty } from "@/lib/utils/serialize-property";
import { useFavorites } from "@/hooks/use-favorites";
import { AuthModal } from "@/components/auth/auth-modal";
import { ViewMoreCard } from "./view-more-card";

interface RecentListingsSectionProps {
  properties: SerializedProperty[];
  isAuthenticated?: boolean;
}

export function RecentListingsSection({
  properties,
  isAuthenticated = false,
}: RecentListingsSectionProps) {
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
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateButtonStates = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
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

  const displayedProperties = properties.slice(0, 9);

  if (displayedProperties.length === 0) {
    return null;
  }

  return (
    <section
      className="py-12 px-4 sm:px-6 lg:px-8 bg-oslo-gray-950"
      aria-label="Propiedades Recientes"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-oslo-gray-100">
              Propiedades Recientes
            </h2>
            <p className="text-oslo-gray-400 mt-2">
              Las últimas propiedades agregadas a la plataforma.
            </p>
          </div>
          {/* Navigation Buttons */}
          <div className="flex gap-2">
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
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 -ml-4">
            {displayedProperties.map((property, index) => (
              <div
                key={property.id}
                className="flex-[0_0_100%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <PropertyCard
                  property={property}
                  onFavoriteToggle={handleFavoriteClick}
                  isFavorite={isFavorite(property.id)}
                  priority={index < 3}
                />
              </div>
            ))}
            <div className="flex-[0_0_100%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <ViewMoreCard href="/propiedades" />
            </div>
          </div>
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
