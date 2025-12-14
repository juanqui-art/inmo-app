/**
 * SIMPLE STATS CARD
 * 
 * Simplified stats card for FREE/PLUS users.
 * Shows count + human-readable text + optional trend indicator.
 */

"use client";

import { cn } from "@/lib/utils";
import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Building2,
    Calendar,
    Eye,
    Heart,
    type LucideIcon
} from "lucide-react";

// Icon mapping for server-to-client component communication
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Calendar,
  Eye,
  Heart,
};

interface SimpleStatsCardProps {
  title: string;
  value: number;
  description: string;
  /** Icon name as string (Building2, Calendar, Eye, Heart) */
  iconName: "Building2" | "Calendar" | "Eye" | "Heart";
  /** Only shows for PLUS tier */
  trendDirection?: "up" | "down" | "neutral";
  /** Whether user is on PLUS tier (shows trend indicator) */
  showTrend?: boolean;
}

export function SimpleStatsCard({
  title,
  value,
  description,
  iconName,
  trendDirection = "neutral",
  showTrend = false,
}: SimpleStatsCardProps) {
  const trendConfig = {
    up: {
      icon: ArrowUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    down: {
      icon: ArrowDown,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    neutral: {
      icon: ArrowRight,
      color: "text-muted-foreground",
      bg: "bg-muted/50",
    },
  };

  const trend = trendConfig[trendDirection];
  const TrendIcon = trend.icon;
  const Icon = iconMap[iconName] || Building2;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        
        {/* Trend indicator (PLUS only) */}
        {showTrend && (
          <div className={cn("p-1.5 rounded-full", trend.bg)}>
            <TrendIcon className={cn("h-3.5 w-3.5", trend.color)} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="space-y-1">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
