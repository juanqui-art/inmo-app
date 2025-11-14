/**
 * Property Detail Page
 *
 * ROUTE: /propiedades/[id-slug]
 * PATTERN: /propiedades/abc123a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a-apartamento-moderno
 *
 * FEATURES:
 * - Server Component for SEO
 * - Fetches full property details via PropertyRepository
 * - Validates slug for SEO redirects
 * - Shows 404 if property not found
 * - Redirects to correct slug if user provides incorrect one (SEO best practice)
 * - Modern minimalist design with GSAP animations
 * - Embla carousel for image gallery with lightbox
 * - Responsive sticky sidebar with floating CTA card
 */

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { PropertyRepository } from "@repo/database";
import { parseIdSlugParam, generateSlug } from "@/lib/utils/slug-generator";
import { getCurrentUser } from "@/lib/auth";
import { checkIfFavoriteAction } from "@/app/actions/favorites";
import { PropertyHeroCarouselWrapper } from "@/components/property-detail/property-hero-carousel-wrapper";
import { PropertyStatsCard } from "@/components/property-detail/property-stats-card";
import { PropertyDescriptionCard } from "@/components/property-detail/property-description-card";
import { PropertyLocationCard } from "@/components/property-detail/property-location-card";
import { PropertyFloatingActionCard } from "@/components/property-detail/property-floating-action-card";

interface PropertyDetailPageProps {
  params: Promise<{
    "id-slug": string;
  }>;
}

/**
 * Metadata generation for SEO
 * Will be enhanced with actual property data
 */
export async function generateMetadata(
  props: PropertyDetailPageProps,
): Promise<Metadata> {
  const params = await props.params;
  const { id } = parseIdSlugParam(params["id-slug"]);

  const propertyRepository = new PropertyRepository();
  const property = await propertyRepository.findById(id);

  if (!property) {
    return {
      title: "Propiedad no encontrada",
    };
  }

  return {
    title: property.title,
    description:
      property.description || `${property.title} - ${property.price}`,
  };
}

/**
 * Property Detail Page Server Component
 *
 * SLUG VALIDATION LOGIC:
 * 1. Parse the [id-slug] parameter to extract id and providedSlug
 * 2. Fetch property by ID
 * 3. If property doesn't exist → Show 404
 * 4. If slug doesn't match generated slug → Redirect to correct URL
 * 5. Otherwise → Render property details
 *
 * This ensures:
 * - URLs are always canonical (SEO benefit)
 * - If property title changes, URL redirects automatically
 * - Old URLs with incorrect slugs still work (via redirect)
 */
export default async function PropertyDetailPage(
  props: PropertyDetailPageProps,
) {
  const params = await props.params;
  const { id, slug: providedSlug } = parseIdSlugParam(params["id-slug"]);

  // Fetch property from database
  const propertyRepository = new PropertyRepository();
  const property = await propertyRepository.findById(id);

  // Show 404 if property not found
  if (!property) {
    notFound();
  }

  // Validate and redirect if slug is incorrect (SEO redirect)
  const correctSlug = generateSlug(property.title);
  if (providedSlug !== correctSlug) {
    // Redirect to canonical URL with correct slug
    redirect(`/propiedades/${id}-${correctSlug}`);
  }

  // Get current user for appointment button
  const user = await getCurrentUser();

  // Check if user has favorited this property
  const favoriteResult = await checkIfFavoriteAction(id);
  const isFavorite = favoriteResult.success && favoriteResult.isFavorite;

  // Format price
  const formattedPrice = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(property.price));

  // Convert Decimal types to numbers for components
  const bedrooms = property.bedrooms ? Number(property.bedrooms) : null;
  const bathrooms = property.bathrooms ? Number(property.bathrooms) : null;
  const area = property.area ? Number(property.area) : null;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-oslo-gray-50/30 to-white dark:bg-gradient-to-b dark:from-oslo-gray-1100 dark:via-oslo-gray-1000 dark:to-oslo-gray-1100">
      {/* Hero Carousel */}
      <PropertyHeroCarouselWrapper
        images={property.images}
        propertyTitle={property.title}
        propertyId={id}
        initialIsFavorite={isFavorite}
        isAuthenticated={!!user && user.role === "CLIENT"}
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8" data-animate-card>
          <h1 className="text-4xl md:text-5xl font-bold text-oslo-gray-950 dark:text-white mb-2">
            {property.title}
          </h1>
          <p className="text-lg text-oslo-gray-600 dark:text-oslo-gray-300 flex items-center gap-2">
            📍 {property.address}
            {property.city && `, ${property.city}`}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Card */}
            <div
              className="bg-white dark:bg-oslo-gray-900 rounded-2xl p-8 shadow-sm border border-oslo-gray-100 dark:border-oslo-gray-800 hover:shadow-md transition-shadow duration-300"
              data-animate-card
            >
              <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 uppercase font-semibold mb-2">
                Precio
              </p>
              <p className="text-5xl font-bold text-oslo-gray-950 dark:text-white">
                {formattedPrice}
              </p>
            </div>

            {/* Stats Card */}
            <div data-animate-card>
              <PropertyStatsCard
                bedrooms={bedrooms}
                bathrooms={bathrooms}
                area={area}
              />
            </div>

            {/* Description Card */}
            {property.description && (
              <div data-animate-card>
                <PropertyDescriptionCard description={property.description} />
              </div>
            )}

            {/* Location Card */}
            <div data-animate-card>
              <PropertyLocationCard
                address={property.address}
                city={property.city}
                state={property.state}
                zipCode={property.zipCode}
              />
            </div>
          </div>

          {/* Right Column - Floating Action Card */}
          <div data-animate-card>
            <PropertyFloatingActionCard
              price={formattedPrice}
              agentName={property.agent?.name}
              agentEmail={property.agent?.email}
              agentPhone={property.agent?.phone}
              agentAvatar={property.agent?.avatar}
              propertyId={id}
              isAuthenticated={!!user && user.role === "CLIENT"}
              isSticky
            />
          </div>
        </div>
      </div>
    </div>
  );
}
