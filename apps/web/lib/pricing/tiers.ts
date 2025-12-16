/**
 * PRICING TIERS - Definición de planes
 *
 * Source: CLAUDE.md - Freemium Model (Actualizado Dic 5, 2025)
 *
 * Decisiones clave:
 * - FREE: 1 propiedad, 6 imágenes, sin destacados
 * - PLUS: 3 propiedades, 25 imágenes, 1 destacado permanente (B2C)
 * - AGENT: 10 propiedades, 20 imágenes, 5 destacados, CRM Lite (B2B)
 * - PRO: 20 propiedades, 25 imágenes, destacados ilimitados, CRM Full (B2B)
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
      "6 imágenes por propiedad",
      "Publicación sin expiración",
      "Búsqueda y mapas",
      "Formulario de contacto básico",
      "Soporte por email (72h)",
    ],
    ctaText: "Comenzar gratis",
    ctaUrl: "/signup?plan=free&redirect=/dashboard/propiedades/nueva",
    highlighted: false,
  },
  {
    name: "PLUS",
    displayName: "Plus",
    price: 9.99,
    currency: "$",
    period: "por mes",
    description: "Ideal para dueños que quieren vender rápido",
    features: [
      "3 propiedades activas",
      "25 imágenes HD por propiedad",
      "1 destacado permanente",
      "Badge 'Publicación Premium'",
      "Video tour (opcional)",
      "Click-to-WhatsApp",
      "Publicación sin expiración",
      "Soporte por email (48h)",
    ],
    ctaText: "Vender rápido",
    ctaUrl: "/signup?plan=plus&redirect=/dashboard",
    highlighted: true,
  },
  {
    name: "AGENT",
    displayName: "Agente",
    price: 29.99,
    currency: "$",
    period: "por mes",
    description: "Para agentes pequeños que gestionan su negocio",
    features: [
      "10 propiedades activas",
      "20 imágenes por propiedad",
      "5 destacados permanentes",
      "Generador de descripción IA",
      "CRM Lite (leads, estados, notas)",
      "Analytics básico",
      "Landing page personal",
      "Badge 'Agente Verificado'",
      "Click-to-WhatsApp",
      "Publicación sin expiración",
      "Soporte por email (24h)",
    ],
    ctaText: "Gestionar negocio",
    ctaUrl: "/signup?plan=agent&redirect=/dashboard",
    highlighted: false,
  },
  {
    name: "PRO",
    displayName: "Pro",
    price: 59.99,
    currency: "$",
    period: "por mes",
    description: "Para agentes profesionales y agencias",
    features: [
      "20 propiedades activas",
      "25 imágenes HD + video por propiedad",
      "Destacados ilimitados",
      "Generador de descripción IA",
      "CRM Completo (pipeline, tags, export)",
      "Analytics avanzado + ROI",
      "Smart Analytics (data local)",
      "Reportes semanales por email",
      "Landing page personal",
      "Badge 'Agente Verificado'",
      "Publicación sin expiración",
      "Soporte prioritario WhatsApp (12h)",
    ],
    ctaText: "Escalar ahora",
    ctaUrl: "/signup?plan=pro&redirect=/dashboard",
    highlighted: false,
  },
];

/**
 * Helper: Obtener tier por nombre
 */
export function getTierByName(
  name: "FREE" | "PLUS" | "AGENT" | "PRO",
): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.name === name);
}

/**
 * Helper: Obtener tier destacado (para mostrar primero)
 */
export function getHighlightedTier(): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.highlighted);
}

/**
 * TIER RANKS - Jerarquía de planes
 * Usado para determinar upgrades/downgrades
 */
export const TIER_RANKS = {
  FREE: 0,
  PLUS: 1,
  AGENT: 2,
  PRO: 3,
} as const;

export type TierName = keyof typeof TIER_RANKS;

/**
 * Helper: Obtener rango numérico de un tier
 */
export function getTierRank(name: string): number {
  return TIER_RANKS[name as TierName] ?? -1;
}
