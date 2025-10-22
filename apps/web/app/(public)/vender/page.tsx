/**
 * Vender Page - Property Listing CTA
 *
 * PATTERN: Server Component Landing Page
 *
 * PURPOSE:
 * - Attract property owners to list their properties
 * - Clear value proposition
 * - Simple CTA flow
 *
 * WHY Server Component?
 * - SEO: Google crawls fully rendered HTML
 * - Performance: Zero JavaScript for static content
 * - Simple: No client-side logic needed
 *
 * CONVERSION FUNNEL:
 * 1. User lands on /vender
 * 2. Sees benefits and trust signals
 * 3. Clicks CTA → Redirects to:
 *    - /login (if not authenticated)
 *    - /dashboard/propiedades/nueva (if authenticated)
 *
 * DESIGN PRINCIPLES:
 * - Clear headline: What can I do here?
 * - Benefits: Why should I list here?
 * - Trust signals: Social proof, stats
 * - Single CTA: Don't confuse with multiple options
 */

import { ArrowRight, CheckCircle, Home, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function VenderPage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  // Redirect URL based on auth state
  const ctaUrl = isAuthenticated
    ? "/dashboard/propiedades/nueva"
    : "/signup?redirect=/dashboard/propiedades/nueva";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 opacity-60" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Home className="w-4 h-4" />
                <span>Para propietarios</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Vende o renta tu propiedad{" "}
                <span className="text-blue-600">más rápido</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Publica tu propiedad en minutos y conéctate con miles de
                compradores y arrendatarios interesados. Sin comisiones ocultas,
                sin letra pequeña.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={ctaUrl}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <span>Publicar propiedad gratis</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="#beneficios"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg border-2 border-gray-200 transition-colors"
                >
                  Ver beneficios
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-12 flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>100% Gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Sin comisiones</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Publicación rápida</span>
                </div>
              </div>
            </div>

            {/* Right: Image/Illustration */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl overflow-hidden">
                {/* Placeholder for hero image */}
                <div className="flex items-center justify-center h-full">
                  <Home className="w-48 h-48 text-white/20" />
                </div>
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">10k+</p>
                    <p className="text-sm text-gray-600">
                      Visitantes mensuales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              ¿Por qué publicar en InmoApp?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos las mejores herramientas para que vendas o rentes tu
              propiedad de forma rápida y segura.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Miles de compradores
              </h3>
              <p className="text-gray-600">
                Tu propiedad será vista por miles de personas buscando
                activamente comprar o rentar.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Publicación gratuita
              </h3>
              <p className="text-gray-600">
                Sin costos ocultos, sin comisiones. Publica tu propiedad y
                gestiona tus anuncios completamente gratis.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Gestión fácil
              </h3>
              <p className="text-gray-600">
                Dashboard intuitivo para gestionar tus propiedades, ver
                estadísticas y responder mensajes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Cómo funciona
            </h2>
            <p className="text-xl text-gray-600">
              Publica tu propiedad en solo 3 pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Crea tu cuenta
                </h3>
                <p className="text-gray-600">
                  Regístrate gratis en menos de 1 minuto. Solo necesitas tu
                  email.
                </p>
              </div>
              {/* Arrow connector (hidden on mobile) */}
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-blue-200" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Publica tu propiedad
                </h3>
                <p className="text-gray-600">
                  Completa la información, sube fotos y publica en minutos.
                </p>
              </div>
              {/* Arrow connector (hidden on mobile) */}
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-blue-200" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Recibe contactos
              </h3>
              <p className="text-gray-600">
                Empieza a recibir mensajes de personas interesadas de inmediato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para publicar tu propiedad?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a los miles de propietarios que ya confían en InmoApp
          </p>

          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span>Comenzar ahora</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-6 text-sm text-blue-200">
            Sin tarjeta de crédito • Sin comisiones • Cancelación cuando quieras
          </p>
        </div>
      </section>
    </div>
  );
}

/**
 * METADATA for SEO
 */
export const metadata = {
  title: "Vende o Renta tu Propiedad | InmoApp",
  description:
    "Publica tu propiedad gratis y conéctate con miles de compradores. Sin comisiones, sin letra pequeña. Comienza ahora.",
  openGraph: {
    title: "Vende o Renta tu Propiedad | InmoApp",
    description: "Publica tu propiedad gratis en InmoApp",
    type: "website",
  },
};
