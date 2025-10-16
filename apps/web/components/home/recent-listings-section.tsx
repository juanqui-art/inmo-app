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

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import type { SerializedProperty } from "@/lib/utils/serialize-property";

interface RecentListingsSectionProps {
  properties: SerializedProperty[];
}

export function RecentListingsSection({
  properties,
}: RecentListingsSectionProps) {
  // Don't render if no properties
  if (properties.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-oslo-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-oslo-gray-100">
            Propiedades Recientes
          </h2>
          <p className="text-oslo-gray-400 mt-2">
            Las últimas propiedades agregadas a la plataforma
          </p>
        </div>

        {/* Grid Container */}
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-6
        "
        >
          {/*
            CSS GRID BREAKDOWN:

            grid: Enable CSS Grid layout

            grid-cols-1: Mobile (1 column)
            - Full width cards
            - Easy to read/tap

            sm:grid-cols-2: Tablet (2 columns)
            - 640px+ breakpoint
            - Good balance of info + overview

            lg:grid-cols-4: Desktop (4 columns)
            - 1024px+ breakpoint
            - Optimal use of horizontal space
            - Quick scan of multiple properties

            gap-6: 1.5rem spacing between cards
            - Not too tight (cards don't touch)
            - Not too loose (still feels grouped)

            WHY CSS Grid vs Flexbox?
            - Grid: Better for 2D layouts (rows AND columns)
            - Flexbox: Better for 1D layouts (just rows OR columns)
            - Grid: Easier responsive control
            - Grid: Auto-fill/auto-fit features

            PERFORMANCE:
            - No JavaScript
            - Native CSS (fastest)
            - GPU accelerated
          */}
          {properties.slice(0, 8).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link
            href="/propiedades"
            className="
              inline-flex items-center gap-2
              px-6 py-3
              bg-oslo-gray-800 hover:bg-oslo-gray-700
              text-oslo-gray-100 font-semibold
              border-2 border-oslo-gray-700
              rounded-lg
              transition-colors duration-200
            "
          >
            Ver Todas las Propiedades
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * USAGE in Homepage:
 *
 * import { RecentListingsSection } from '@/components/home/recent-listings-section'
 * import { propertyRepository } from '@repo/database'
 *
 * export default async function HomePage() {
 *   const recent = await propertyRepository.findMany({
 *     where: { status: 'AVAILABLE' },
 *     take: 8,
 *     orderBy: { createdAt: 'desc' },
 *     include: {
 *       images: { take: 1, orderBy: { order: 'asc' } },
 *       agent: { select: { name: true, avatar: true } }
 *     }
 *   })
 *
 *   return (
 *     <main>
 *       <HeroSection />
 *       <FeaturedPropertiesCarousel properties={featured} />
 *       <RecentListingsSection properties={recent} />
 *     </main>
 *   )
 * }
 */

/**
 * DESIGN DECISIONS:
 *
 * 1. Background Color (bg-gray-50):
 *    - Visual separation from featured section
 *    - Alternating backgrounds = better readability
 *    - Not too dark (keeps it light and airy)
 *
 * 2. Max 8 Properties:
 *    - 2 rows on desktop (4x2)
 *    - Not overwhelming
 *    - Encourages click to "View All"
 *
 * 3. CTA Button Style:
 *    - Outlined (vs filled) to differentiate from primary CTA above
 *    - Border matches Featured's filled button
 *    - Hierarchy: Featured (primary) > Recent (secondary)
 *
 * 4. Center Text Header:
 *    - Draws attention
 *    - Consistent with section importance
 *    - Better for shorter headings
 *
 * FUTURE ENHANCEMENTS:
 *
 * 1. Filter Toggle:
 *    <Tabs>
 *      <Tab>Todas</Tab>
 *      <Tab>Venta</Tab>
 *      <Tab>Renta</Tab>
 *    </Tabs>
 *
 * 2. View Toggle:
 *    <button onClick={() => setView('grid')}>Grid</button>
 *    <button onClick={() => setView('list')}>List</button>
 *
 * 3. Skeleton Loading:
 *    <div className="grid grid-cols-4 gap-6">
 *      {[...Array(8)].map((_, i) => <PropertyCardSkeleton key={i} />)}
 *    </div>
 *
 * But start simple: Current implementation is clean and effective.
 */
