/**
 * Property Limits and Permissions - Freemium Model
 *
 * Helpers to enforce subscription tier limits for properties, images, and features.
 * Used in Server Actions to validate user permissions before operations.
 *
 * Updated: Dic 5, 2025 - New tier structure (FREE/PLUS/AGENT/PRO)
 */

import type { Prisma, SubscriptionTier } from "@repo/database";
import { db } from "@repo/database";

type TxClient = Prisma.TransactionClient | typeof db;

/**
 * Get maximum properties allowed for a subscription tier
 */
export function getPropertyLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case "FREE":
      return 1;
    case "PLUS":
      return 3;
    case "AGENT":
      return 10;
    case "PRO":
      return 20;
    default:
      return 1; // Fallback to most restrictive
  }
}

/**
 * Get maximum images per property for a subscription tier
 */
export function getImageLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case "FREE":
      return 6;
    case "PLUS":
      return 25;
    case "AGENT":
      return 20;
    case "PRO":
      return 25;
    default:
      return 6; // Fallback to most restrictive
  }
}

/**
 * Get featured properties limit (permanent highlights)
 * @returns Number of featured slots, or null for unlimited
 */
export function getFeaturedLimit(tier: SubscriptionTier): number | null {
  switch (tier) {
    case "FREE":
      return 0; // No featured properties
    case "PLUS":
      return 1; // 1 permanent featured
    case "AGENT":
      return 5; // 5 permanent featured
    case "PRO":
      return null; // Unlimited
    default:
      return 0;
  }
}

/**
 * Check if user can create a new property
 * @returns Object with permission status, reason, and limits
 */
export async function canCreateProperty(
  userId: string,
  tx: TxClient = db,
): Promise<{ allowed: boolean; reason?: string; limit?: number }> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  const limit = getPropertyLimit(user.subscriptionTier);

  const currentCount = await tx.property.count({
    where: { agentId: userId },
  });

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? "propiedad" : "propiedades"}. Actualiza tu plan para publicar más.`,
      limit,
    };
  }

  return { allowed: true, limit };
}

/**
 * Check if user can upload more images to a property
 * @returns Object with permission status, reason, and limit
 */
export function canUploadImage(
  tier: SubscriptionTier,
  currentImageCount: number,
): { allowed: boolean; reason?: string; limit: number } {
  const limit = getImageLimit(tier);

  if (currentImageCount > limit) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} imágenes. Actualiza tu plan para agregar más.`,
      limit,
    };
  }

  return { allowed: true, limit };
}

/**
 * Check if user can feature a property (permanent highlight)
 * @returns Object with permission status, reason, and limit
 */
export async function canFeatureProperty(
  userId: string,
  tx: TxClient = db,
): Promise<{ allowed: boolean; reason?: string; limit: number | null }> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    return { allowed: false, reason: "User not found", limit: 0 };
  }

  const limit = getFeaturedLimit(user.subscriptionTier);

  // If limit is null, it means unlimited
  if (limit === null) {
    return { allowed: true, limit: null };
  }

  // If limit is 0, featured properties are not allowed
  if (limit === 0) {
    return {
      allowed: false,
      reason:
        "Tu plan no incluye propiedades destacadas. Actualiza a PLUS, AGENT o PRO para destacar propiedades.",
      limit: 0,
    };
  }

  // Count currently featured properties (permanent highlights)
  const currentFeaturedCount = await tx.property.count({
    where: {
      agentId: userId,
      isFeatured: true,
    },
  });

  if (currentFeaturedCount >= limit) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? "propiedad destacada" : "propiedades destacadas"}. Actualiza tu plan para destacar más.`,
      limit,
    };
  }

  return { allowed: true, limit };
}

/**
 * Get tier display name for UI (Spanish)
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case "FREE":
      return "Gratuito";
    case "PLUS":
      return "Plus";
    case "AGENT":
      return "Agente";
    case "PRO":
      return "Pro";
    default:
      return "Gratuito";
  }
}

/**
 * Get all tier features for display in pricing page or upgrade modals
 */
export function getTierFeatures(tier: SubscriptionTier) {
  const featuredLimit = getFeaturedLimit(tier);

  return {
    tier,
    displayName: getTierDisplayName(tier),
    propertyLimit: getPropertyLimit(tier),
    imageLimit: getImageLimit(tier),
    featuredLimit,
    hasFeatured: featuredLimit !== 0,
    hasUnlimitedFeatured: featuredLimit === null,
    hasAnalytics: tier !== "FREE",
    hasCRM: tier === "AGENT" || tier === "PRO",
    hasCRMFull: tier === "PRO",
    support:
      tier === "PRO"
        ? "WhatsApp (12h)"
        : tier === "AGENT"
          ? "Email (24h)"
          : tier === "PLUS"
            ? "Email (48h)"
            : "Email (72h)",
  };
}

/**
 * Get pricing information for each tier
 */
export function getTierPricing(tier: SubscriptionTier): {
  price: number;
  currency: string;
  period: string;
} {
  const prices: Record<SubscriptionTier, number> = {
    FREE: 0,
    PLUS: 9.99,
    AGENT: 29.99,
    PRO: 59.99,
  };

  return {
    price: prices[tier],
    currency: "USD",
    period: "mes",
  };
}

/**
 * Get maximum videos per property for a subscription tier
 * Used for external video URLs (YouTube, TikTok, etc.)
 */
export function getVideoLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case "FREE":
      return 0; // No videos for free tier
    case "PLUS":
      return 1; // 1 video for Plus
    case "AGENT":
      return 3; // 3 videos for Agent
    case "PRO":
      return 10; // Generous limit for Pro
    default:
      return 0;
  }
}

/**
 * Check if user can add more videos to a property
 * @returns Object with permission status, reason, and limit
 */
export function canAddVideo(
  tier: SubscriptionTier,
  currentVideoCount: number,
): { allowed: boolean; reason?: string; limit: number } {
  const limit = getVideoLimit(tier);

  if (limit === 0) {
    return {
      allowed: false,
      reason: "Los videos están disponibles desde el plan Plus. Actualiza para agregar videos a tus propiedades.",
      limit: 0,
    };
  }

  if (currentVideoCount >= limit) {
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? "video" : "videos"}. Actualiza tu plan para agregar más.`,
      limit,
    };
  }

  return { allowed: true, limit };
}

