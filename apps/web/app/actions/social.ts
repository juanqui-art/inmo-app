/**
 * Social Server Actions
 *
 * PATTERN: Server Actions for tracking social interactions
 *
 * WHY Server Actions?
 * - Type-safe: Full TypeScript support
 * - Secure: Runs on server, can't be bypassed
 * - Simple: No API routes needed
 * - Performance: Direct database access
 *
 * TRACKING FEATURES:
 * - Property shares (by platform)
 * - Property views (for analytics)
 * - Share counts (for social proof)
 * - Trending properties (by shares + views)
 *
 * PRIVACY:
 * - IP address hashed (not stored raw)
 * - User agent anonymized
 * - No PII collected
 *
 * RESOURCES:
 * - https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
 */

"use server";

import { db } from "@repo/database";
import type { SharePlatform } from "@prisma/client";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Track property share
 *
 * Records when a user shares a property
 * Used for analytics and social proof
 */
export async function trackPropertyShare(
  propertyId: string,
  platform: SharePlatform,
): Promise<{ success: boolean }> {
  try {
    // Get user if logged in (optional)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get request metadata
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Create share record
    await db.propertyShare.create({
      data: {
        propertyId,
        platform,
        userId: user?.id,
        ipAddress: hashIP(ipAddress), // Hash for privacy
        userAgent: anonymizeUserAgent(userAgent),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track share:", error);
    // Don't throw - tracking failure shouldn't break sharing
    return { success: false };
  }
}

/**
 * Track property view
 *
 * Records when a user views a property detail page
 * Used for analytics and "trending" calculations
 */
export async function trackPropertyView(
  propertyId: string,
): Promise<{ success: boolean }> {
  try {
    // Get user if logged in (optional)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get request metadata
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Create view record
    await db.propertyView.create({
      data: {
        propertyId,
        userId: user?.id,
        ipAddress: hashIP(ipAddress),
        userAgent: anonymizeUserAgent(userAgent),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to track view:", error);
    return { success: false };
  }
}

/**
 * Get property share count
 *
 * Returns total shares for a property
 * Optionally by platform
 */
export async function getPropertyShareCount(
  propertyId: string,
  platform?: SharePlatform,
): Promise<number> {
  try {
    const count = await db.propertyShare.count({
      where: {
        propertyId,
        ...(platform && { platform }),
      },
    });

    return count;
  } catch (error) {
    console.error("Failed to get share count:", error);
    return 0;
  }
}

/**
 * Get property view count
 *
 * Returns total views for a property
 */
export async function getPropertyViewCount(
  propertyId: string,
): Promise<number> {
  try {
    const count = await db.propertyView.count({
      where: { propertyId },
    });

    return count;
  } catch (error) {
    console.error("Failed to get view count:", error);
    return 0;
  }
}

/**
 * Get property social stats
 *
 * Returns aggregated stats for a property
 * - Total shares
 * - Total views
 * - Shares by platform
 */
export async function getPropertySocialStats(propertyId: string): Promise<{
  totalShares: number;
  totalViews: number;
  sharesByPlatform: Record<SharePlatform, number>;
}> {
  try {
    const [totalShares, totalViews, shares] = await Promise.all([
      // Total shares
      db.propertyShare.count({
        where: { propertyId },
      }),

      // Total views
      db.propertyView.count({
        where: { propertyId },
      }),

      // Shares grouped by platform
      db.propertyShare.groupBy({
        by: ["platform"],
        where: { propertyId },
        _count: { platform: true },
      }),
    ]);

    // Convert to Record<SharePlatform, number>
    const sharesByPlatform = shares.reduce(
      (acc, item) => {
        acc[item.platform] = item._count.platform;
        return acc;
      },
      {} as Record<SharePlatform, number>,
    );

    return { totalShares, totalViews, sharesByPlatform };
  } catch (error) {
    console.error("Failed to get social stats:", error);
    return {
      totalShares: 0,
      totalViews: 0,
      sharesByPlatform: {} as Record<SharePlatform, number>,
    };
  }
}

/**
 * Get trending properties
 *
 * Returns properties sorted by social engagement
 * Formula: (shares * 3) + views (shares weighted more)
 *
 * WHY this formula?
 * - Shares indicate stronger interest than views
 * - Balances new properties (few views) vs old (many views)
 * - Prevents view-only properties from dominating
 */
export async function getTrendingProperties(limit = 10) {
  try {
    // Get properties with share/view counts
    const properties = await db.property.findMany({
      where: { status: "AVAILABLE" },
      include: {
        images: {
          take: 1,
          orderBy: { order: "asc" },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        _count: {
          select: {
            shares: true,
            views: true,
          },
        },
      },
      take: 100, // Get top 100 to calculate engagement
    });

    // Calculate engagement score and sort
    const trending = properties
      .map((property) => {
        const { _count, ...propertyData } = property;
        return {
          ...propertyData,
          shareCount: _count.shares,
          viewCount: _count.views,
          engagementScore: _count.shares * 3 + _count.views,
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);

    return trending;
  } catch (error) {
    console.error("Failed to get trending properties:", error);
    return [];
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Hash IP address for privacy
 *
 * We don't need raw IPs, just want to prevent duplicate counting
 * Uses simple hash (in production, use crypto.subtle)
 */
function hashIP(ip: string): string {
  // Simple hash for privacy
  // In production, use: crypto.createHash('sha256').update(ip).digest('hex')
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Anonymize user agent
 *
 * Keep browser/OS info, remove identifying details
 */
function anonymizeUserAgent(ua: string): string {
  // Extract just browser and OS
  // Example: "Mozilla/5.0 (Macintosh; ...) Chrome/120.0.0.0"
  // Becomes: "Chrome/120 macOS"

  const browser =
    ua.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || "Unknown";
  const os =
    ua.match(/(Windows|Macintosh|Linux|Android|iPhone)/)?.[0] || "Unknown";

  return `${browser} ${os}`;
}
