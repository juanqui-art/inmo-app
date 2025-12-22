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

import { FAQAccordion } from "@/components/faq/faq-accordion";
import { HeroBackground } from "@/components/home/hero-background";
import { PricingGrid } from "@/components/pricing/pricing-grid";
import { getTierRank, pricingTiers } from "@/lib/pricing/tiers";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, CheckCircle, Home, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default async function VenderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tiers = pricingTiers.map((tier) => {
    if (user) {
      // Helper to check if this is the current plan
      // Note: plan is stored in user_metadata.plan (set during signup in auth.ts)
      const userPlan = (user.user_metadata?.plan as string)?.toUpperCase() || "FREE";
      const isCurrentPlan = userPlan === tier.name;
      // Helper to check if this plan is "lower" than current
      const currentTierRank = getTierRank(userPlan);
      const targetTierRank = getTierRank(tier.name);
      const isLowerPlan = currentTierRank > targetTierRank;

      if (isCurrentPlan) {
        return {
          ...tier,
          ctaText: "Tu Plan Actual",
          ctaUrl: "/dashboard",
          buttonVariant: "outline" as const, // Visual cue
          disabled: true, // Optional: might need to handle this in PricingCard
        };
      }

      if (isLowerPlan) {
        return {
          ...tier,
          ctaText: "Incluido en tu plan",
          ctaUrl: "#",
          disabled: true,
        };
      }

      // Upgrade path
      return {
        ...tier,
        ctaText: "Mejorar Plan",
        ctaUrl: `/dashboard?upgrade=${tier.name.toLowerCase()}`,
      };
    }
    // Create 'buttonVariant' property for non-logged users too if needed, or rely on default
    return tier;
  });

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
            Publica tu propiedad <span className="text-indigo-300">gratis</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg mb-10">
            Comienza con 1 propiedad gratis, sin expiración. Escala cuando
            necesites más. Sin comisiones por transacción.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? "/dashboard" : "#planes"}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-indigo-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1"
            >
              <span>{user ? "Ir a mi Dashboard" : "Comenzar gratis"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="#beneficios"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-xl border border-white/20 transition-colors"
            >
              Ver beneficios
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>1 propiedad gratis, sin límite de tiempo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Publicación permanente (no caduca)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Escala a 3 propiedades por $9.99/mes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Dark Theme & Glassmorphism */}
      <section
        id="beneficios"
        className="py-24 bg-gradient-to-br from-oslo-gray-900 to-oslo-gray-950 text-white relative overflow-hidden"
      >
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
              <h3 className="text-xl font-bold mb-3">Plan gratuito real</h3>
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
              <h3 className="text-xl font-bold mb-3">Búsqueda inteligente con IA</h3>
              <p className="text-oslo-gray-400 leading-relaxed">
                Tu propiedad será encontrada fácilmente gracias a nuestro sistema de búsqueda por lenguaje natural potenciado por inteligencia artificial.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestión profesional</h3>
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
              <h3 className="text-2xl font-bold mb-4">Crea tu cuenta</h3>
              <p className="text-oslo-gray-400 leading-relaxed max-w-xs">
                Regístrate gratis en menos de 1 minuto. Solo necesitas tu correo
                electrónico para empezar.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-oslo-gray-900 border border-indigo-500/30 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-lg shadow-indigo-500/10 z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-indigo-400">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Publica tu propiedad</h3>
              <p className="text-oslo-gray-400 leading-relaxed max-w-xs">
                Completa la información básica, sube tus mejores fotos y publica
                tu anuncio en minutos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-oslo-gray-900 border border-indigo-500/30 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mb-8 shadow-lg shadow-indigo-500/10 z-10 group-hover:scale-110 transition-transform duration-300">
                <span className="text-indigo-400">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Gestiona tu publicación</h3>
              <p className="text-oslo-gray-400 leading-relaxed max-w-xs">
                Controla tus publicaciones desde el dashboard. Edita información, actualiza precios y gestiona disponibilidad fácilmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-oslo-gray-900 to-oslo-gray-950 text-white relative overflow-hidden border-t border-white/5">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/5 dark:bg-purple-400/10 rounded-full blur-3xl -translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm text-oslo-gray-300 rounded-full text-sm font-semibold mb-6 border border-white/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Preguntas frecuentes</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight">
              ¿Tienes dudas?
            </h2>
            <p className="text-xl text-oslo-gray-300 max-w-2xl mx-auto leading-relaxed">
              Respondemos las preguntas más comunes sobre nuestros planes y servicios
            </p>
          </div>

          <FAQAccordion
            items={[
              {
                question: "¿Qué incluye el plan gratuito?",
                answer: "El plan gratuito incluye 1 propiedad activa sin expiración, hasta 6 imágenes por propiedad, búsqueda con IA, y acceso completo al dashboard. Es perfecto para comenzar sin compromiso.",
              },
              {
                question: "¿Qué pasa si necesito publicar más de 1 propiedad?",
                answer: "Puedes escalar fácilmente al plan Plus ($9.99/mes) para publicar hasta 3 propiedades, al plan Agente ($29.99/mes) para hasta 10, o al plan Pro ($59.99/mes) para hasta 20 propiedades. Todos los planes incluyen las mismas herramientas profesionales.",
              },
              {
                question: "¿Puedo cancelar en cualquier momento?",
                answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde tu dashboard sin penalización. Si cancelas, tus propiedades seguirán activas hasta el final del período de facturación actual.",
              },
              {
                question: "¿Cobran comisiones por transacciones?",
                answer: "No, nunca cobramos comisión por la venta o renta de tus propiedades. Solo pagas la suscripción mensual del plan que elijas. El dinero de tus transacciones es 100% tuyo.",
              },
              {
                question: "¿Necesito tarjeta de crédito para el plan gratuito?",
                answer: "No, el plan gratuito no requiere tarjeta de crédito. Solo necesitas crear una cuenta con tu correo electrónico y puedes empezar a publicar inmediatamente.",
              },
              {
                question: "¿Qué son los 'destacados' en los planes pagos?",
                answer: "Los destacados te permiten poner tus propiedades en posiciones privilegiadas en los resultados de búsqueda y en la página principal, aumentando significativamente su visibilidad ante compradores potenciales.",
              },
            ]}
          />

          {/* CTA Footer */}
          <div className="text-center mt-16">
            <p className="text-oslo-gray-400 mb-4">
              ¿No encuentras la respuesta que buscas?
            </p>
            <Link
              href="#planes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
            >
              <span>Ver planes y comenzar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section - Planes y Precios */}
      <section
        id="planes"
        className="relative py-24  from-oslo-gray-50 via-oslo-gray-400 to-oslo-gray-500 dark:from-oslo-gray-950 dark:via-oslo-gray-900 dark:to-oslo-gray-950 overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top left gradient blob */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-full blur-3xl" />
          {/* Top right gradient blob */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-400/10 rounded-full blur-3xl" />
          {/* Bottom center gradient blob */}
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/3 dark:bg-indigo-400/8 rounded-full blur-3xl" />

          {/* Subtle grid pattern - more visible in dark mode */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-oslo-gray-100 dark:bg-oslo-gray-800/80 text-oslo-gray-700 dark:text-oslo-gray-200 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-oslo-gray-200/50 dark:border-oslo-gray-700/50">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              <span>Planes flexibles</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight text-oslo-gray-900 dark:text-oslo-gray-50">
              Elige el plan{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                perfecto para ti
              </span>
            </h2>
            <p className="text-xl text-oslo-gray-600 dark:text-oslo-gray-300 max-w-2xl mx-auto leading-relaxed">
              Comienza gratis con 1 propiedad. Escala cuando necesites más.
              <br />
              <span className="font-semibold text-oslo-gray-900 dark:text-oslo-gray-100">
                Todos los planes sin expiración.
              </span>
            </p>
          </div>

          {/* Pricing Cards Grid - Excluding PRO tier for now */}
          {/* Pricing Grid with Toggle */}
          <PricingGrid tiers={tiers.filter(tier => tier.name !== "PRO")} />

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mb-4">
              ¿Necesitas más información?{" "}
              <Link
                href="/pricing"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 group"
              >
                <span>Ver comparación detallada</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-oslo-gray-500 dark:text-oslo-gray-400 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Cancela en cualquier momento</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Soporte incluido</span>
              </div>
            </div>
          </div>
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
    "Comienza con 1 propiedad gratis, sin expiración. Planes desde $9.99/mes. Sin comisiones por transacción. Escala cuando necesites más.",
  openGraph: {
    title: "Publica tu Propiedad Gratis | InmoApp",
    description:
      "Plan gratuito real. 1 propiedad sin expiración. Planes desde $9.99/mes",
    type: "website",
  },
};
