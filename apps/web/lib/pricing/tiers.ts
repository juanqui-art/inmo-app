/**
 * PRICING TIERS - Definición de planes
 *
 * Source: docs/business/DECISIONS_APPROVED.md
 *
 * Decisiones clave:
 * - FREE: 1 propiedad, 5 imágenes, sin expiración
 * - BASIC: 3 propiedades, 10 imágenes, 3 destacados/mes
 * - PRO: 10 propiedades, 20 imágenes, destacados ilimitados
 */

import type { PricingTier } from "@/components/pricing/pricing-card";

export const pricingTiers: PricingTier[] = [
  {
    name: "FREE",
    displayName: "Gratuito",
    price: 0,
    currency: "$",
    period: "por mes",
    description: "Perfecto para empezar a publicar tu primera propiedad",
    features: [
      "1 propiedad activa",
      "5 imágenes por propiedad",
      "Publicación sin expiración",
      "Búsqueda y mapas",
      "Soporte por email (72h)",
    ],
    ctaText: "Comenzar gratis",
    ctaUrl: "/signup",
    highlighted: false,
  },
  {
    name: "BASIC",
    displayName: "Básico",
    price: 4.99,
    currency: "$",
    period: "por mes",
    description: "Ideal para agentes pequeños o particulares con varias propiedades",
    features: [
      "3 propiedades activas",
      "10 imágenes por propiedad",
      "3 destacados por mes",
      "Analytics básico",
      "Publicación sin expiración",
      "Soporte por email (24h)",
    ],
    ctaText: "Comenzar prueba",
    ctaUrl: "/signup?redirect=/dashboard",
    highlighted: true,
  },
  {
    name: "PRO",
    displayName: "Pro",
    price: 14.99,
    currency: "$",
    period: "por mes",
    description: "Para inmobiliarias y agentes profesionales",
    features: [
      "10 propiedades activas",
      "20 imágenes por propiedad",
      "Destacados ilimitados",
      "Analytics avanzado",
      "Badge 'Agente Verificado'",
      "Publicación sin expiración",
      "Soporte WhatsApp (12h)",
    ],
    ctaText: "Escalar ahora",
    ctaUrl: "/signup?redirect=/dashboard",
    highlighted: false,
  },
];

/**
 * Helper: Obtener tier por nombre
 */
export function getTierByName(name: "FREE" | "BASIC" | "PRO"): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.name === name);
}

/**
 * Helper: Obtener tier destacado (para mostrar primero)
 */
export function getHighlightedTier(): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.highlighted);
}
