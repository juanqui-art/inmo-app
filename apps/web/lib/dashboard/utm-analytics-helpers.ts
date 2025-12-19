
import { db } from "@repo/database";

export interface UtmSourceStat {
  source: string;
  count: number;
  percentage: number;
}

/**
 * Get lead distribution by UTM Source for the last 30 days
 */
export async function getUtmSourceStats(agentId: string): Promise<UtmSourceStat[]> {
  // Aggregate clients by utmSource
  const groups = await db.agentClient.groupBy({
    by: ["utmSource"],
    where: {
      agentId: agentId,
      // Optional: Filter by date (e.g., last 30 days or all time)
      // createdAt: { gte: subDays(new Date(), 30) } 
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        utmSource: "desc",
      },
    },
  });

  const total = groups.reduce((acc, curr) => acc + curr._count._all, 0);

  // Map to clean format
  const stats = groups.map((g) => ({
    source: g.utmSource || "Directo / Desconocido",
    count: g._count._all,
    percentage: total > 0 ? (g._count._all / total) * 100 : 0,
  }));
  
  // Sort by count desc
  return stats.sort((a, b) => b.count - a.count);
}
