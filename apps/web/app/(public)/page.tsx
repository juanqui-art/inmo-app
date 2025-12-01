import { db, getPropertiesList } from "@repo/database";
import { AgentCTASection } from "@/components/home/agent-cta-section";
import { FeaturedPropertiesCarousel } from "@/components/home/featured-properties-carousel";
import { HeroSection } from "@/components/home/hero-section";
import { RecentListingsSection } from "@/components/home/recent-listings-section";
import { StatsSection } from "@/components/home/stats-section";
import { TrendingPropertiesSection } from "@/components/home/trending-properties-section";
import { getCurrentUser } from "@/lib/auth";

/**
 * CACHING STRATEGY:
 * Revalidate every 5 minutes (ISR).
 * Balances data freshness with database load and performance.
 */
export const revalidate = 300;

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
 * Homepage - Public Landing Page
 *
 * ARQUITECTURA:
 * - Server Component: Fetching directo a DB para SEO y Performance.
 * - Parallel Data Fetching: Carga propiedades y estadísticas en paralelo.
 */
export default async function HomePage() {
  const currentUser = await getCurrentUser();

  /**
   * Fetch all homepage data in parallel
   *
   * PERFORMANCE OPTIMIZATION:
   * - Single query for properties (used for both Featured and Recent)
   * - Stats counts run in parallel
   */
  const [propertiesResult, propertyCount, cityCount, agentCount] =
    await Promise.all([
      // Properties for both Featured and Recent sections
      getPropertiesList({
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

  return (
    <>
      {/* Hero Section (Search-First) */}
      <HeroSection />

      {/* Featured Properties Carousel */}
      {propertiesResult.properties.length > 0 && (
        <FeaturedPropertiesCarousel
          properties={propertiesResult.properties}
          isAuthenticated={!!currentUser}
        />
      )}

      {/* Trending Properties (Social Commerce) */}
      {propertiesResult.properties.length > 0 && (
        <TrendingPropertiesSection properties={propertiesResult.properties} />
      )}

      {/* Recent Listings Grid */}
      {propertiesResult.properties.length > 0 && (
        <RecentListingsSection properties={propertiesResult.properties} />
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
