/**
 * DASHBOARD ANALYTICS HELPERS
 * 
 * Server-side functions for calculating real dashboard analytics.
 * Used by AGENT/PRO tiers for advanced statistics.
 */

import { db } from "@repo/database/src/client";

/**
 * Get advanced dashboard analytics for AGENT/PRO users
 * 
 * Calculates:
 * - Views this month vs last month (with trend percentage)
 * - Daily views for sparkline (last 7 days)
 * - Unique clients count
 * - Top performing property
 */
export async function getAdvancedDashboardAnalytics(agentId: string) {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // Get 7 days ago for sparkline
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    viewsThisMonth,
    viewsLastMonth,
    viewsByDay,
    uniqueClients,
    topProperty,
    favoritesThisMonth,
    favoritesLastMonth,
  ] = await Promise.all([
    // Views this month
    db.propertyView.count({
      where: {
        property: { agentId },
        viewedAt: { gte: firstDayThisMonth },
      },
    }),
    
    // Views last month
    db.propertyView.count({
      where: {
        property: { agentId },
        viewedAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth,
        },
      },
    }),
    
    // Views by day (last 7 days) for sparkline
    db.propertyView.groupBy({
      by: ["viewedAt"],
      where: {
        property: { agentId },
        viewedAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
    }),
    
    // Unique clients (users who favorited or scheduled appointments)
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT user_id) as count
      FROM (
        SELECT user_id FROM favorites WHERE property_id IN (SELECT id FROM properties WHERE agent_id = ${agentId}::uuid)
        UNION
        SELECT user_id FROM appointments WHERE property_id IN (SELECT id FROM properties WHERE agent_id = ${agentId}::uuid)
      ) as unique_users
    `,
    
    // Top performing property (most views this month)
    db.property.findFirst({
      where: { agentId },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            views: {
              where: { viewedAt: { gte: firstDayThisMonth } },
            },
          },
        },
      },
      orderBy: {
        views: { _count: "desc" },
      },
    }),
    
    // Favorites this month
    db.favorite.count({
      where: {
        property: { agentId },
        createdAt: { gte: firstDayThisMonth },
        userId: { not: agentId }, // Exclude agent's own favorites
      },
    }),
    
    // Favorites last month
    db.favorite.count({
      where: {
        property: { agentId },
        createdAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth,
        },
        userId: { not: agentId },
      },
    }),
  ]);

  // Calculate trends
  const viewsTrend = calculateTrend(viewsThisMonth, viewsLastMonth);
  const favoritesTrend = calculateTrend(favoritesThisMonth, favoritesLastMonth);
  
  // Process daily views for sparkline (aggregate by date)
  const sparklineData = processSparklineData(viewsByDay, sevenDaysAgo);
  
  // Get unique clients count
  const clientCount = uniqueClients.length > 0 ? Number(uniqueClients[0]?.count || 0) : 0;

  return {
    views: {
      thisMonth: viewsThisMonth,
      lastMonth: viewsLastMonth,
      trend: viewsTrend,
      sparkline: sparklineData,
    },
    favorites: {
      thisMonth: favoritesThisMonth,
      lastMonth: favoritesLastMonth,
      trend: favoritesTrend,
    },
    clients: {
      total: clientCount,
    },
    topProperty: topProperty
      ? {
          id: topProperty.id,
          title: topProperty.title,
          views: topProperty._count.views,
        }
      : null,
  };
}

/**
 * Calculate trend percentage between two values
 * Returns: { percentage: number, direction: 'up' | 'down' | 'neutral' }
 */
function calculateTrend(current: number, previous: number): {
  percentage: number;
  direction: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? "up" : "neutral",
    };
  }
  
  const percentage = Math.round(((current - previous) / previous) * 100);
  
  return {
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? "up" : percentage < 0 ? "down" : "neutral",
  };
}

/**
 * Process raw views data into sparkline format
 * Returns array of 7 numbers representing daily view counts
 */
function processSparklineData(
  viewsByDay: Array<{ viewedAt: Date; _count: { id: number } }>,
  startDate: Date
): number[] {
  // Create array for 7 days
  const result = new Array(7).fill(0);
  
  // Group views by day offset from startDate
  viewsByDay.forEach(({ viewedAt, _count }) => {
    const date = new Date(viewedAt);
    date.setHours(0, 0, 0, 0);
    const dayOffset = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (dayOffset >= 0 && dayOffset < 7) {
      result[dayOffset] += _count.id;
    }
  });
  
  return result;
}

/**
 * Get basic dashboard stats for FREE/PLUS users
 * Simpler query with less data
 */
export async function getBasicDashboardStats(agentId: string) {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [viewsThisMonth, viewsLastMonth, favoritesCount] = await Promise.all([
    // Views this month
    db.propertyView.count({
      where: {
        property: { agentId },
        viewedAt: { gte: firstDayThisMonth },
      },
    }),
    
    // Views last month (for PLUS trend indicator only)
    db.propertyView.count({
      where: {
        property: { agentId },
        viewedAt: {
          gte: firstDayLastMonth,
          lte: lastDayLastMonth,
        },
      },
    }),
    
    // Favorites (excluding agent's own)
    db.favorite.count({
      where: {
        property: { agentId },
        userId: { not: agentId },
      },
    }),
  ]);

  // Simple trend direction (for PLUS only, no percentage)
  const trendDirection = viewsThisMonth > viewsLastMonth
    ? "up"
    : viewsThisMonth < viewsLastMonth
      ? "down"
      : "neutral";

  return {
    viewsThisMonth,
    trendDirection: trendDirection as "up" | "down" | "neutral",
    favoritesCount,
  };
}
