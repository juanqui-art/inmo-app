/**
 * Homepage - Public Landing Page
 *
 * PATTERN: Async Server Component with Parallel Data Fetching
 *
 * WHY Server Component?
 * - SEO: Google crawls fully rendered HTML
 * - Performance: Zero JavaScript for static content
 * - Data Fetching: Direct database access (no API layer)
 * - Fresh Data: Always up-to-date (no stale cache)
 *
 * ALTERNATIVE 1: Client Component with useEffect
 * ❌ Slower: Client renders → useEffect → fetch → re-render
 * ❌ Bad SEO: Content not in initial HTML
 * ❌ Loading states: Need spinners everywhere
 * ❌ More code: API routes + fetch logic
 *
 * ALTERNATIVE 2: Static Site Generation (SSG)
 * ✅ Fast: Pre-rendered at build time
 * ❌ Stale: Content can be outdated
 * ❌ Rebuild: Need to redeploy for new properties
 * ✅ Use case: Content doesn't change often
 *
 * ✅ We chose Server Component because:
 * - Fresh data (new properties show immediately)
 * - Perfect SEO (fully rendered HTML)
 * - Simple code (no API layer)
 * - Industry standard (Zillow, Redfin use this)
 *
 * PARALLEL DATA FETCHING:
 * Promise.all([...]) executes requests in parallel
 *
 * Sequential (BAD):
 * const featured = await getFeatured()  // 100ms
 * const recent = await getRecent()      // 100ms
 * const stats = await getStats()        // 100ms
 * Total: 300ms (waterfall)
 *
 * Parallel (GOOD):
 * const [featured, recent, stats] = await Promise.all([
 *   getFeatured(),  // All execute
 *   getRecent(),    // at the same
 *   getStats()      // time
 * ])
 * Total: 100ms (fastest query wins)
 *
 * PERFORMANCE BENEFIT:
 * - 3x faster page load
 * - Better UX (no waiting)
 * - Lower server costs (less time processing)
 *
 * PITFALLS:
 * - ⚠️ If one query fails, all fail (use try/catch)
 * - ⚠️ Don't fetch TOO much data (keep it lean)
 * - ⚠️ Cache strategically (Next.js cache or Redis)
 *
 * RESOURCES:
 * - https://nextjs.org/docs/app/building-your-application/data-fetching/fetching
 * - https://react.dev/reference/react/use (React 19 parallel fetching)
 */

import { db, PropertyRepository } from "@repo/database";
import { AgentCTASection } from "@/components/home/agent-cta-section";
import { FeaturedPropertiesCarousel } from "@/components/home/featured-properties-carousel";
import { HeroSection } from "@/components/home/hero-section";
import { RecentListingsSection } from "@/components/home/recent-listings-section";
import { StatsSection } from "@/components/home/stats-section";
import { TrendingPropertiesSection } from "@/components/home/trending-properties-section";
import { serializeProperties } from "@/lib/utils/serialize-property";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  /**
   * Initialize repository
   * WHY class-based? Encapsulates query logic
   */
  const propertyRepo = new PropertyRepository();

  /**
   * Check if user is authenticated
   * (for showing/hiding auth modals in client components)
   */
  const currentUser = await getCurrentUser();

  /**
   * Fetch all homepage data in parallel
   *
   * PERFORMANCE: 3 queries execute simultaneously
   * - Featured properties: 12 newest/curated
   * - Recent listings: 8 most recent
   * - Stats: Counts for social proof
   *
   * ERROR HANDLING:
   * If any query fails, entire Promise.all fails
   * In production, add try/catch per query
   */
  const [featuredResult, recentResult, propertyCount, cityCount, agentCount] =
    await Promise.all([
      // Featured Properties
      // TODO: Add 'featured' field to Property model
      // For now, just get newest 9 properties
      propertyRepo.list({
        filters: { status: "AVAILABLE" },
        take: 9,
      }),

      // Recent Listings
      propertyRepo.list({
        filters: { status: "AVAILABLE" },
        take: 9,
      }),

      // Stats: Property count
      db.property.count({
        where: { status: "AVAILABLE" },
      }),

      // Stats: City count (distinct cities)
      db.property
        .findMany({
          select: { city: true },
          distinct: ["city"],
          where: { status: "AVAILABLE" },
        })
        .then((cities) => cities.length),

      // Stats: Agent count
      db.user.count({
        where: { role: "AGENT" },
      }),
    ]);

  /**
   * SERIALIZATION:
   *
   * Convert Prisma Decimal objects to plain numbers before passing to Client Components.
   * This is required because React cannot serialize Decimal objects across the
   * Server/Client boundary.
   *
   * Fields converted: price, bathrooms, area, latitude, longitude
   */
  const serializedFeatured = serializeProperties(featuredResult.properties);
  const serializedRecent = serializeProperties(recentResult.properties);

  /**
   * SECTION COMPOSITION:
   *
   * 1. Hero: Search-first CTA
   * 2. Featured: Carousel (curated selection)
   * 3. Stats: Social proof (trust building)
   * 4. Recent: Grid (latest additions)
   * 5. Agent CTA: Conversion (grow supply)
   *
   * WHY this order?
   * - Hero first: Primary action (search)
   * - Featured: Show best properties (hook interest)
   * - Stats: Build credibility (social proof)
   * - Recent: More options (browse more)
   * - Agent CTA: After user sees value (timing)
   */
  return (
    <>
      {/* Hero Section (Search-First) */}
      <HeroSection />
      {/* Featured Properties Carousel */}
      {serializedFeatured.length > 0 && (
        <FeaturedPropertiesCarousel
          properties={serializedFeatured}
          isAuthenticated={!!currentUser}
        />
      )}
      `{/* Trending Properties (Social Commerce) */}
      {serializedFeatured.length > 0 && (
        <TrendingPropertiesSection properties={serializedFeatured} />
      )}
      {/* Recent Listings Grid */}
      {serializedRecent.length > 0 && (
        <RecentListingsSection properties={serializedRecent} />
      )}
      {/* Stats Section (Social Proof) */}
      <StatsSection
        propertyCount={propertyCount}
        cityCount={cityCount}
        agentCount={agentCount}
      />
      {/* Agent CTA (Conversion) */}
      <AgentCTASection />
    </>
  );
}

/**
 * METADATA (SEO):
 *
 * Define metadata in separate export for Next.js
 */
export const metadata = {
  title: "InmoApp - Encuentra tu Hogar Ideal",
  description:
    "Miles de propiedades en venta y renta. Encuentra tu hogar ideal con InmoApp. Busca casas, departamentos, terrenos y más.",
  keywords: [
    "bienes raíces",
    "propiedades",
    "casas en venta",
    "departamentos en renta",
    "inmobiliaria",
    "comprar casa",
    "rentar departamento",
  ],
  openGraph: {
    title: "InmoApp - Encuentra tu Hogar Ideal",
    description: "Miles de propiedades en venta y renta",
    type: "website",
    locale: "es_ES",
    url: "https://tudominio.com",
    siteName: "InmoApp",
    images: [
      {
        url: "https://tudominio.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InmoApp - Plataforma Inmobiliaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InmoApp - Encuentra tu Hogar Ideal",
    description: "Miles de propiedades en venta y renta",
    images: ["https://tudominio.com/og-image.jpg"],
  },
};

/**
 * CACHING STRATEGY:
 *
 * Next.js 15 automatically caches fetch requests.
 * For database queries, use revalidation:
 */
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * WHY 5 minutes?
 * - Balance: Fresh enough, not too aggressive
 * - Properties: Don't change every second
 * - Performance: Serves cached HTML to most users
 * - Cost: Reduces database load
 *
 * ALTERNATIVES:
 * - revalidate = 0: Always fresh (no cache)
 * - revalidate = 60: Very fresh (1 min)
 * - revalidate = 3600: Very cached (1 hour)
 * - revalidate = false: Cache forever
 *
 * For real-time updates: Use Supabase Realtime subscriptions
 */

/**
 * ERROR HANDLING (Production):
 *
 * Wrap each query in try/catch to handle failures gracefully:
 *
 * const [featuredResult, recentResult, stats] = await Promise.allSettled([
 *   propertyRepo.list({ ... }),
 *   propertyRepo.list({ ... }),
 *   getStats(),
 * ])
 *
 * if (featuredResult.status === 'rejected') {
 *   console.error('Failed to load featured:', featuredResult.reason)
 *   // Show empty carousel or fallback
 * }
 */

/**
 * FUTURE ENHANCEMENTS:
 *
 * 1. Personalization:
 *    - Show properties based on user location
 *    - Remember user preferences (viewed properties)
 *    - Recommend similar properties
 *
 * 2. A/B Testing:
 *    - Test different hero headlines
 *    - Test carousel vs grid for featured
 *    - Test CTA button copy
 *
 * 3. Analytics:
 *    - Track which sections get most clicks
 *    - Track search queries
 *    - Track property views (popular properties)
 *
 * 4. Dynamic content:
 *    - "Hot Properties" (most viewed this week)
 *    - "Price Drops" (recently reduced)
 *    - "Open Houses" (upcoming viewings)
 *
 * 5. Location-based:
 *    - Auto-detect user city
 *    - Show properties in user's area
 *    - "Properties near you"
 *
 * But start simple: Current homepage is clean, fast, and conversion-focused.
 */
