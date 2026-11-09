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

import { createHash } from "node:crypto";
import { SharePlatform } from "@prisma/client";
import { db } from "@repo/database";
import { headers } from "next/headers";
import { z } from "zod";
import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

const propertyIdSchema = z.string().uuid();
const sharePlatformSchema = z.nativeEnum(SharePlatform);

/**
 * Validates input and applies the "social" rate limit.
 * Returns false if the event should NOT be recorded (invalid or rate limited).
 */
async function canTrack(
  propertyId: unknown,
  userId: string | undefined,
): Promise<boolean> {
  if (!propertyIdSchema.safeParse(propertyId).success) return false;

  try {
    await enforceRateLimit({ userId, tier: "social" });
    return true;
  } catch (error) {
    if (isRateLimitError(error)) {
      logger.warn({ userId, propertyId }, "[Social] Rate limit exceeded");
      return false;
    }
    throw error;
  }
}

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

    if (!sharePlatformSchema.safeParse(platform).success) {
      return { success: false };
    }
    if (!(await canTrack(propertyId, user?.id))) {
      return { success: false };
    }

    // Get request metadata
    const headersList = await headers();
    const ipAddress = getClientIP(headersList);
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
    logger.error(
      { err: error, propertyId, platform },
      "[Social] Failed to track share"
    );
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

    if (!(await canTrack(propertyId, user?.id))) {
      return { success: false };
    }

    // Get request metadata
    const headersList = await headers();
    const ipAddress = getClientIP(headersList);
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
    logger.error(
      { err: error, propertyId },
      "[Social] Failed to track view"
    );
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
    logger.error(
      { err: error, propertyId },
      "[Social] Failed to get share count"
    );
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
    logger.error(
      { err: error, propertyId },
      "[Social] Failed to get view count"
    );
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
    logger.error(
      { err: error, propertyId },
      "[Social] Failed to get social stats"
    );
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
    logger.error(
      { err: error, limit },
      "[Social] Failed to get trending properties"
    );
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
  // SHA-256 instead of the previous 32-bit rolling hash (collision-prone and
  // trivially reversible). Note: unsalted, so IPv4 is still brute-forceable;
  // add a server-side salt if this data is ever exposed.
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * First IP in x-forwarded-for is the client; the rest are proxies.
 */
function getClientIP(
  headersList: Awaited<ReturnType<typeof headers>>,
): string {
  const forwarded = headersList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
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
