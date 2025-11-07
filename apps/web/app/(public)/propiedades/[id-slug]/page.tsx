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
 */

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { PropertyRepository } from "@repo/database";
import { parseIdSlugParam, generateSlug } from "@/lib/utils/slug-generator";
import { AppointmentButton } from "@/components/appointments/appointment-button";
import { getCurrentUser } from "@/lib/auth";

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

  // Format price
  const formattedPrice = new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(property.price));

  return (
    <div className="min-h-screen bg-white dark:bg-oslo-gray-1000">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-oslo-gray-950 dark:text-white mb-2">
            {property.title}
          </h1>
          <p className="text-xl text-oslo-gray-600 dark:text-oslo-gray-300">
            {property.address}
            {property.city && `, ${property.city}`}
          </p>
        </div>

        {/* Images Grid */}
        {property.images && property.images.length > 0 && (
          <div className="mb-8 bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <p className="text-oslo-gray-500">
              [Galería de imágenes - Implementar en próxima fase]
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price */}
            <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 p-6 rounded-lg">
              <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm">
                Precio
              </p>
              <p className="text-4xl font-bold text-oslo-gray-950 dark:text-white">
                {formattedPrice}
              </p>
            </div>

            {/* Property Specs */}
            {(property.bedrooms || property.bathrooms || property.area) && (
              <div className="grid grid-cols-3 gap-4">
                {property.bedrooms && (
                  <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 p-4 rounded-lg text-center">
                    <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm">
                      Habitaciones
                    </p>
                    <p className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
                      {property.bedrooms}
                    </p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 p-4 rounded-lg text-center">
                    <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm">
                      Baños
                    </p>
                    <p className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
                      {Number(property.bathrooms).toFixed(1)}
                    </p>
                  </div>
                )}
                {property.area && (
                  <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 p-4 rounded-lg text-center">
                    <p className="text-oslo-gray-600 dark:text-oslo-gray-400 text-sm">
                      Área (m²)
                    </p>
                    <p className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
                      {Number(property.area).toLocaleString("es-EC")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white mb-4">
                  Descripción
                </h2>
                <p className="text-oslo-gray-700 dark:text-oslo-gray-300 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            )}

            {/* Location Info */}
            <div>
              <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white mb-4">
                Ubicación
              </h2>
              <div className="space-y-2 text-oslo-gray-700 dark:text-oslo-gray-300">
                {property.address && <p>📍 {property.address}</p>}
                {property.city && (
                  <p>
                    🏙️ {property.city}
                    {property.state && `, ${property.state}`}
                  </p>
                )}
                {property.zipCode && <p>📮 {property.zipCode}</p>}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div>
            {/* Agent Card */}
            {property.agent && (
              <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 p-6 rounded-lg sticky top-4">
                <h3 className="text-lg font-bold text-oslo-gray-950 dark:text-white mb-4">
                  Agente
                </h3>
                <div className="space-y-4">
                  {property.agent.avatar && (
                    <div className="w-16 h-16 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-full mx-auto" />
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-oslo-gray-950 dark:text-white">
                      {property.agent.name || "Agente"}
                    </p>
                    {property.agent.email && (
                      <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                        {property.agent.email}
                      </p>
                    )}
                    {property.agent.phone && (
                      <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                        {property.agent.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 mt-6">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
                    Contactar Agente
                  </button>
                  <AppointmentButton
                    propertyId={id}
                    isAuthenticated={!!user && user.role === "CLIENT"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
