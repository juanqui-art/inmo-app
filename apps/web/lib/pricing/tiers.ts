/**
 * PRICING TIERS - Definición de planes
 *
 * Source: CLAUDE.md - Freemium Model (Actualizado Dic 18, 2025)
 *
 * MVP Simplificado:
 * - FREE: 1 propiedad, 6 imágenes, sin destacados
 * - PLUS: 3 propiedades, 10 imágenes, 1 destacado (B2C)
 * - BUSINESS: 10 propiedades, 15 imágenes, 5 destacados, CRM Lite (B2B)
 * - PRO: EN ESPERA (no mostrar en UI hasta haya demanda)
 *
 * NOTA: El enum en DB ahora es "BUSINESS" (migración completada Dic 18, 2025)
 * Ver: docs/architecture/SUBSCRIPTION_ARCHITECTURE_REFACTOR.md
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
      "10 imágenes por propiedad",
      "1 destacado permanente",
      "1 video por propiedad",
      "Badge 'Publicación Premium'",
      "Click-to-WhatsApp",
      "Publicación sin expiración",
      "Soporte por email (48h)",
    ],
    ctaText: "Vender rápido",
    ctaUrl: "/signup?plan=plus&redirect=/dashboard",
    highlighted: true,
  },
  {
    name: "BUSINESS",
    displayName: "Business",
    price: 29.99,
    currency: "$",
    period: "por mes",
    description: "Para agentes que gestionan su negocio",
    features: [
      "10 propiedades activas",
      "15 imágenes por propiedad",
      "3 videos por propiedad",
      "5 destacados permanentes",
      "Generador de descripción IA",
      "CRM Lite (leads, estados, notas)",
      "Analytics básico",
      "Badge 'Agente Verificado'",
      "Click-to-WhatsApp",
      "Publicación sin expiración",
      "Soporte por email (24h)",
    ],
    ctaText: "Gestionar negocio",
    ctaUrl: "/signup?plan=business&redirect=/dashboard",
    highlighted: false,
  },
  {
    // PRO tier - ON HOLD until there's demand from BUSINESS users
    name: "PRO",
    displayName: "Pro",
    price: 59.99,
    currency: "$",
    period: "por mes",
    description: "Para agencias y equipos grandes",
    features: [
      "20 propiedades activas",
      "20 imágenes por propiedad",
      "5 videos por propiedad",
      "Destacados ilimitados",
      "Todo de Business, más:",
      "CRM Completo (pipeline, export)",
      "Analytics avanzado",
      "Soporte WhatsApp (12h)",
    ],
    ctaText: "Próximamente",
    ctaUrl: "#",
    highlighted: false,
  },
];

/**
 * Helper: Obtener tier por nombre
 */
export function getTierByName(
  name: "FREE" | "PLUS" | "BUSINESS" | "PRO",
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
 * Helper: Get pricing info for a subscription tier
 */
export function getTierPricing(tier: "FREE" | "PLUS" | "BUSINESS" | "PRO") {
  const tierData = pricingTiers.find((t) => t.name === tier);

  if (!tierData) {
    // Fallback to FREE if tier not found
    return {
      displayName: "Gratuito",
      price: 0,
      period: "mes",
      limits: {
        properties: 1,
        images: 6,
        videos: 0,
        featured: 0,
      },
    };
  }

  // Extract limits from tier name (Updated Dic 18, 2025)
  const limits = {
    properties: tier === "FREE" ? 1 : tier === "PLUS" ? 3 : tier === "BUSINESS" ? 10 : 20,
    images: tier === "FREE" ? 6 : tier === "PLUS" ? 10 : tier === "BUSINESS" ? 15 : 20,
    videos: tier === "FREE" ? 0 : tier === "PLUS" ? 1 : tier === "BUSINESS" ? 3 : 5,
    featured: tier === "FREE" ? 0 : tier === "PLUS" ? 1 : tier === "BUSINESS" ? 5 : Infinity,
  };

  return {
    displayName: tierData.displayName,
    price: tierData.price,
    period: "mes",
    limits,
  };
}

/**
 * TIER RANKS - Jerarquía de planes
 * Usado para determinar upgrades/downgrades
 */
export const TIER_RANKS = {
  FREE: 0,
  PLUS: 1,
  BUSINESS: 2,
  PRO: 3,
} as const;

export type TierName = keyof typeof TIER_RANKS;

/**
 * Helper: Obtener rango numérico de un tier
 */
export function getTierRank(name: string): number {
  return TIER_RANKS[name as TierName] ?? -1;
}
