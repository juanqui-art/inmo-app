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

import { checkIfFavoriteAction } from "@/app/actions/favorites";
import { PropertyDescriptionCard } from "@/components/property-detail/property-description-card";
import { PropertyFloatingActionCard } from "@/components/property-detail/property-floating-action-card";
import { PropertyHeroCarouselWrapper } from "@/components/property-detail/property-hero-carousel-wrapper";
import { PropertyLocationCard } from "@/components/property-detail/property-location-card";
import { PropertyStatsCard } from "@/components/property-detail/property-stats-card";
import { getCurrentUser } from "@/lib/auth";
import { generateSlug, parseIdSlugParam } from "@/lib/utils/slug-generator";
import { PropertyRepository } from "@repo/database";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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
  // Note: property is already serialized (Decimal → number) by findByIdCached
  const formattedPrice = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(property.price);

  // Extract numeric values (already serialized, no conversion needed)
  const bedrooms = property.bedrooms;
  const bathrooms = property.bathrooms;
  const area = property.area;
  // Map coordinates
  const latitude = property.latitude;
  const longitude = property.longitude;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-oslo-gray-50/30 to-white dark:bg-gradient-to-b dark:from-oslo-gray-1100 dark:via-oslo-gray-1000 dark:to-oslo-gray-1100">
      {/* Hero Carousel */}
      <PropertyHeroCarouselWrapper
        images={property.images}
        propertyTitle={property.title}
        propertyId={id}
        initialIsFavorite={isFavorite}
        isAuthenticated={!!user}
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-8" data-animate-card>
          <h1 className="text-4xl md:text-5xl font-bold text-oslo-gray-950 dark:text-white mb-2">
            {property.title}
          </h1>
          <p className="text-lg text-oslo-gray-600 dark:text-oslo-gray-300 flex items-center gap-2">
            <span className="text-primary">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            {property.address}
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
                latitude={latitude}
                longitude={longitude}
                title={property.title}
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
              propertyId={id}
              isAuthenticated={!!user}
              isSticky
            />
          </div>
        </div>
      </div>
    </div>
  );
}
