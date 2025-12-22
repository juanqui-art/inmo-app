/**
 * PRICING PAGE - Planes y Precios
 *
 * Página dedicada para comparar y seleccionar planes de suscripción.
 * Diseñada siguiendo mejores prácticas de UX para conversión:
 * - 3-4 planes máximo (evitar analysis paralysis)
 * - PLUS destacado como "Más Popular"
 * - Tabla comparativa detallada
 * - FAQ section para resolver objeciones
 * - Toggle mensual/anual (futuro)
 */

import { FAQAccordion } from "@/components/faq/faq-accordion";
import { PricingCard } from "@/components/pricing/pricing-card";
import { getTierRank, pricingTiers } from "@/lib/pricing/tiers";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Check, CheckCircle, HelpCircle, Minus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "Planes y Precios | InmoApp",
  description:
    "Compara nuestros planes de suscripción. Comienza gratis con 1 propiedad. Escala cuando necesites más. Sin comisiones por transacción.",
  openGraph: {
    title: "Planes y Precios | InmoApp",
    description:
      "Plan gratuito real. 1 propiedad sin expiración. Planes desde $9.99/mes",
    type: "website",
  },
};

// Feature comparison data (Updated Dic 18, 2025 - MVP simplified)
// Note: AGENT will be renamed to BUSINESS in DB migration
const comparisonFeatures = [
  {
    category: "Propiedades",
    features: [
      { name: "Propiedades activas", FREE: "1", PLUS: "3", AGENT: "10" },
      { name: "Imágenes por propiedad", FREE: "6", PLUS: "10", AGENT: "15" },
      { name: "Videos por propiedad", FREE: false, PLUS: "1", AGENT: "3" },
      { name: "Publicación permanente", FREE: true, PLUS: true, AGENT: true },
    ],
  },
  {
    category: "Visibilidad",
    features: [
      { name: "Destacados permanentes", FREE: false, PLUS: "1", AGENT: "5" },
      { name: "Badge Premium", FREE: false, PLUS: true, AGENT: false },
      { name: "Badge Verificado", FREE: false, PLUS: false, AGENT: true },
    ],
  },
  {
    category: "Herramientas",
    features: [
      { name: "Dashboard Profesional", FREE: true, PLUS: true, AGENT: true },
      { name: "Métricas de Visibilidad", FREE: false, PLUS: true, AGENT: true },
      { name: "Generador de descripción IA", FREE: false, PLUS: false, AGENT: true },
      { name: "Gestión de Clientes", FREE: false, PLUS: false, AGENT: true },
    ],
  },
  {
    category: "Soporte",
    features: [
      { name: "Nivel de Soporte", FREE: "Digital (72h)", PLUS: "Digital (48h)", AGENT: "Prioritario (24h)" },
    ],
  },
];

// FAQ data specific to pricing
const pricingFAQs = [
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí, puedes actualizar tu plan cuando quieras desde tu dashboard. Si bajas de plan, el cambio se aplicará al final del período de facturación actual. Si subes de plan, el cambio es inmediato y solo pagarás la diferencia prorrateada.",
  },
  {
    question: "¿Qué pasa con mis propiedades si bajo de plan?",
    answer:
      "Si bajas a un plan con menos propiedades de las que tienes publicadas, deberás elegir cuáles mantener activas. Las demás pasarán a estado 'borrador' y podrás reactivarlas cuando subas de plan nuevamente.",
  },
  {
    question: "¿Cobran comisiones por transacciones?",
    answer:
      "No, nunca cobramos comisión por la venta o renta de tus propiedades. Solo pagas la suscripción mensual del plan que elijas. El dinero de tus transacciones es 100% tuyo.",
  },
  {
    question: "¿Necesito tarjeta de crédito para el plan gratuito?",
    answer:
      "No, el plan gratuito no requiere tarjeta de crédito. Solo necesitas crear una cuenta con tu correo electrónico y puedes empezar a publicar inmediatamente.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express). Próximamente habilitaremos PayPal y transferencias bancarias.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción en cualquier momento desde tu dashboard sin penalización. Tus propiedades seguirán activas hasta el final del período de facturación actual.",
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Transform tiers based on user state
  const tiers = pricingTiers.map((tier) => {
    if (user) {
      const userPlan =
        (user.user_metadata?.plan as string)?.toUpperCase() || "FREE";
      const isCurrentPlan = userPlan === tier.name;
      const currentTierRank = getTierRank(userPlan);
      const targetTierRank = getTierRank(tier.name);
      const isLowerPlan = currentTierRank > targetTierRank;

      if (isCurrentPlan) {
        return {
          ...tier,
          ctaText: "Tu Plan Actual",
          ctaUrl: "/dashboard",
          disabled: true,
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

      return {
        ...tier,
        ctaText: "Mejorar Plan",
        ctaUrl: `/dashboard?upgrade=${tier.name.toLowerCase()}`,
      };
    }
    return tier;
  });

  // Filter out PRO tier (temporarily hidden)
  const visibleTiers = tiers.filter((tier) => tier.name !== "PRO");

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/vender"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Vender</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight">
              Elige el plan{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                perfecto para ti
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comienza gratis con 1 propiedad. Escala cuando necesites más.
              <br />
              <span className="font-semibold text-foreground">
                Todos los planes sin expiración.
              </span>
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
            {visibleTiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} />
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Cancela en cualquier momento</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Sin comisiones por transacción</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Comparación detallada
            </h2>
            <p className="text-muted-foreground text-lg">
              Encuentra exactamente lo que necesitas para tu negocio
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border bg-card shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-6 font-semibold text-lg">
                    Características
                  </th>
                  <th className="p-6 text-center">
                    <div className="font-bold text-lg">Gratuito</div>
                    <div className="text-2xl font-extrabold mt-1">$0</div>
                  </th>
                  <th className="p-6 text-center bg-indigo-50 dark:bg-indigo-950/30 border-x-2 border-indigo-200 dark:border-indigo-800">
                    <div className="inline-flex items-center gap-1.5 font-bold text-lg text-indigo-600 dark:text-indigo-400">
                      Plus
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold mt-1">$9.99</div>
                  </th>
                  <th className="p-6 text-center">
                    <div className="font-bold text-lg">Business</div>
                    <div className="text-2xl font-extrabold mt-1">$29.99</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <Fragment key={category.category}>
                    <tr className="bg-muted/30 border-y">
                      <td
                        colSpan={4}
                        className="p-4 font-semibold text-sm uppercase tracking-wider text-muted-foreground"
                      >
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, idx) => (
                      <tr
                        key={feature.name}
                        className={`border-b last:border-0 ${
                          idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                        }`}
                      >
                        <td className="p-4 text-sm">{feature.name}</td>
                        <td className="p-4 text-center">
                          <FeatureValue value={feature.FREE} />
                        </td>
                        <td className="p-4 text-center bg-indigo-50/50 dark:bg-indigo-950/20 border-x-2 border-indigo-200 dark:border-indigo-800">
                          <FeatureValue value={feature.PLUS} highlighted />
                        </td>
                        <td className="p-4 text-center">
                          <FeatureValue value={feature.AGENT} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-6">
            {visibleTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-6 ${
                  tier.highlighted
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{tier.displayName}</h3>
                    <p className="text-2xl font-extrabold">
                      ${tier.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mes
                      </span>
                    </p>
                  </div>
                  {tier.highlighted && (
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {tier.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={tier.ctaUrl}
                  className={`mt-4 block w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                    tier.highlighted
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              <span>Preguntas frecuentes</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              ¿Tienes dudas?
            </h2>
            <p className="text-muted-foreground text-lg">
              Respondemos las preguntas más comunes sobre nuestros planes
            </p>
          </div>

          <FAQAccordion items={pricingFAQs} />

          {/* Contact CTA */}
          <div className="text-center mt-12 p-8 rounded-2xl bg-muted/50 border">
            <p className="text-muted-foreground mb-4">
              ¿No encuentras la respuesta que buscas?
            </p>
            <Link
              href="mailto:soporte@inmoapp.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Contactar Soporte
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Comienza gratis hoy y publica tu primera propiedad en minutos. Sin
            compromiso, sin tarjeta de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?plan=free&redirect=/dashboard/propiedades/nueva"
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Comenzar gratis
            </Link>
            <Link
              href="/vender#beneficios"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Ver beneficios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper component for feature values in comparison table
function FeatureValue({
  value,
  highlighted = false,
}: {
  value: string | boolean;
  highlighted?: boolean;
}) {
  if (value === true) {
    return (
      <Check
        className={`w-5 h-5 mx-auto ${
          highlighted ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-500"
        }`}
      />
    );
  }

  if (value === false) {
    return <Minus className="w-5 h-5 mx-auto text-muted-foreground/50" />;
  }

  return (
    <span
      className={`font-medium ${
        highlighted ? "text-indigo-600 dark:text-indigo-400" : ""
      }`}
    >
      {value}
    </span>
  );
}
