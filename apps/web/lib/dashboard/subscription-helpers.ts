import { db } from "@repo/database";
import type { SubscriptionTier } from "@repo/database";
import {
  getFeaturedLimit,
  getImageLimit,
  getPropertyLimit,
  getVideoLimit,
} from "@/lib/permissions/property-limits";

/**
 * User usage statistics
 */
export interface UsageStats {
  properties: number;
  images: number;
  videos: number;
  featured: number;
}

/**
 * Usage limits per tier
 */
export interface UsageLimits {
  properties: number;
  imagesPerProperty: number;
  videosPerProperty: number;
  featured: number;
}

/**
 * Combined usage stats with limits
 */
export interface UsageWithLimits {
  properties: { current: number; limit: number };
  images: { current: number; limit: number };
  videos: { current: number; limit: number };
  featured: { current: number; limit: number };
}

/**
 * Get current usage stats for a user
 */
export async function getUserUsageStats(userId: string): Promise<UsageStats> {
  const [properties, images, videos, featured] = await Promise.all([
    // Count total properties
    db.property.count({
      where: { agentId: userId },
    }),

    // Count total images across all properties
    db.propertyImage.count({
      where: {
        property: {
          agentId: userId,
        },
      },
    }),

    // Count total videos across all properties
    db.propertyVideo.count({
      where: {
        property: {
          agentId: userId,
        },
      },
    }),

    // Count featured properties
    db.property.count({
      where: {
        agentId: userId,
        isFeatured: true,
      },
    }),
  ]);

  return {
    properties,
    images,
    videos,
    featured,
  };
}

/**
 * Get usage limits for a subscription tier
 */
export function getUsageLimits(tier: SubscriptionTier): UsageLimits {
  return {
    properties: getPropertyLimit(tier),
    imagesPerProperty: getImageLimit(tier),
    videosPerProperty: getVideoLimit(tier),
    featured: getFeaturedLimit(tier) ?? 0, // Default to 0 if null
  };
}

/**
 * Combine usage stats with limits
 */
export function combineUsageWithLimits(
  stats: UsageStats,
  limits: UsageLimits
): UsageWithLimits {
  return {
    properties: {
      current: stats.properties,
      limit: limits.properties,
    },
    images: {
      current: stats.images,
      // Total images limit = imagesPerProperty * number of properties
      limit: limits.imagesPerProperty * Math.max(stats.properties, 1),
    },
    videos: {
      current: stats.videos,
      // Total videos limit = videosPerProperty * number of properties
      limit: limits.videosPerProperty * Math.max(stats.properties, 1),
    },
    featured: {
      current: stats.featured,
      limit: limits.featured,
    },
  };
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(current: number, limit: number): number {
  if (limit === 0) return 0;
  if (limit === Infinity) return 0; // Unlimited
  return Math.min((current / limit) * 100, 100);
}

/**
 * Get warning level based on usage percentage
 */
export function getWarningLevel(
  percentage: number
): "safe" | "warning" | "danger" {
  if (percentage >= 90) return "danger";
  if (percentage >= 70) return "warning";
  return "safe";
}

/**
 * Get next tier upgrade option
 */
export function getNextTierUpgrade(
  currentTier: SubscriptionTier
): SubscriptionTier | null {
  const upgradeMap: Record<SubscriptionTier, SubscriptionTier | null> = {
    FREE: "PLUS",
    PLUS: "AGENT",
    AGENT: "PRO",
    PRO: null, // Already at highest tier
  };

  return upgradeMap[currentTier];
}
