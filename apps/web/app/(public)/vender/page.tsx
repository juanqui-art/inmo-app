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

import { HeroBackground } from "@/components/home/hero-background";
import { PricingCard } from "@/components/pricing/pricing-card";
import { getCurrentUser } from "@/lib/auth";
import { pricingTiers } from "@/lib/pricing/tiers";
import { ArrowRight, CheckCircle, Home, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default async function VenderPage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  // Redirect URL based on auth state
  const ctaUrl = isAuthenticated
    ? "/dashboard/propiedades/nueva"
    : "/signup?redirect=/dashboard/propiedades/nueva";

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-start justify-center overflow-hidden -mt-17">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent pointer-events-none z-[5]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-40">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 border border-white/20">
            <Home className="w-4 h-4" />
            <span>Para propietarios</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl tracking-tight leading-[1.1] mb-6">
            Publica tu propiedad{" "}
            <span className="text-indigo-300">gratis</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg mb-10">
            Comienza con 1 propiedad gratis, sin expiración. Escala cuando necesites
            más. Sin comisiones por transacción.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ctaUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1"
            >
              <span>Comenzar gratis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="#planes"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-xl border border-white/20 transition-colors"
            >
              Ver planes y precios
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Plan gratuito real</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Sin expiración</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Planes desde $4.99/mes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Dark Theme & Glassmorphism */}
      <section id="beneficios" className="py-24 bg-gradient-to-br from-oslo-gray-900 to-oslo-gray-950 text-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">
              ¿Por qué publicar en InmoApp?
            </h2>
            <p className="text-xl text-oslo-gray-300 max-w-2xl mx-auto leading-relaxed">
              Ofrecemos las mejores herramientas para que vendas o rentes tu
              propiedad de forma rápida y segura.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Plan gratuito real
              </h3>
              <p className="text-oslo-gray-400 leading-relaxed">
                Publica tu primera propiedad completamente gratis, sin
                expiración, sin límite de tiempo. Escala a planes pagos solo si
                necesitas más.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Miles de compradores
              </h3>
              <p className="text-oslo-gray-400 leading-relaxed">
                Tu propiedad será vista por miles de personas buscando
                activamente comprar o rentar en nuestra plataforma.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Gestión profesional
              </h3>
              <p className="text-oslo-gray-400 leading-relaxed">
                Dashboard intuitivo, analytics en tiempo real, y herramientas
                para escalar tu negocio cuando estés listo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Darker Contrast */}
      <section className="py-24 bg-oslo-gray-950 text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">
              Cómo funciona
            </h2>
            <p className="text-xl text-oslo-gray-300">
              Publica tu propiedad en solo 3 pasos sencillos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-oslo-gray-900 border border-indigo-500/30 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-lg shadow-indigo-500/10 z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-indigo-400">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Crea tu cuenta
              </h3>
              <p className="text-oslo-gray-400 leading-relaxed max-w-xs">
                Regístrate gratis en menos de 1 minuto. Solo necesitas tu
                correo electrónico para empezar.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-oslo-gray-900 border border-indigo-500/30 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-lg shadow-indigo-500/10 z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-indigo-400">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Publica tu propiedad
              </h3>
              <p className="text-oslo-gray-400 leading-relaxed max-w-xs">
                Completa la información básica, sube tus mejores fotos y publica tu anuncio en minutos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-oslo-gray-900 border border-indigo-500/30 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-lg shadow-indigo-500/10 z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-indigo-400">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Recibe contactos
              </h3>
              <p className="text-oslo-gray-400 leading-relaxed max-w-xs">
                Empieza a recibir mensajes y solicitudes de visita de personas interesadas de inmediato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Planes y Precios */}
      <section id="planes" className="py-24 bg-white dark:bg-oslo-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight text-oslo-gray-900 dark:text-oslo-gray-50">
              Elige el plan perfecto para ti
            </h2>
            <p className="text-xl text-oslo-gray-600 dark:text-oslo-gray-400 max-w-2xl mx-auto leading-relaxed">
              Comienza gratis con 1 propiedad. Escala cuando necesites más.
              Todos los planes sin expiración.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} compact={true} />
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
              ¿Necesitas más información?{" "}
              <Link
                href="/pricing"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Ver comparación detallada →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA - Premium Gradient */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 tracking-tight">
            ¿Listo para publicar?
          </h2>
          <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl mx-auto font-medium">
            Únete a los miles de propietarios que ya confían en InmoApp para vender y rentar.
          </p>

          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-gray-50 text-indigo-600 font-bold text-xl rounded-xl shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 hover:-translate-y-1"
          >
            <span>Comenzar ahora</span>
            <ArrowRight className="w-6 h-6" />
          </Link>

          <p className="mt-8 text-sm font-medium text-indigo-200/80 uppercase tracking-wider">
            Sin tarjeta de crédito • Sin comisiones • Cancelación inmediata
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
  title: "Publica tu Propiedad Gratis | InmoApp",
  description:
    "Comienza con 1 propiedad gratis, sin expiración. Planes desde $4.99/mes. Sin comisiones por transacción. Escala cuando necesites más.",
  openGraph: {
    title: "Publica tu Propiedad Gratis | InmoApp",
    description:
      "Plan gratuito real. 1 propiedad sin expiración. Planes desde $4.99/mes",
    type: "website",
  },
};
