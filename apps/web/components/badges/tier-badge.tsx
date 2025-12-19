/**
 * TIER BADGE
 * 
 * Visual badge indicating subscription tier perks.
 * - PLUS: "Premium" badge (golden)
 * - AGENT/PRO: "Verificado" badge (blue with checkmark)
 * 
 * Used on property cards and agent profiles.
 */

import { cn } from "@/lib/utils";
import { BadgeCheck, Crown, Sparkles } from "lucide-react";

export type TierBadgeType = "premium" | "verified" | "none";

interface TierBadgeProps {
  /** Subscription tier of the agent */
  tier: "FREE" | "PLUS" | "AGENT" | "PRO";
  /** Size variant */
  size?: "sm" | "default";
  /** Additional class names */
  className?: string;
}

/**
 * Get badge type based on subscription tier
 */
function getBadgeType(tier: string): TierBadgeType {
  switch (tier) {
    case "PLUS":
      return "premium";
    case "AGENT":
    case "PRO":
      return "verified";
    default:
      return "none";
  }
}

export function TierBadge({ tier, size = "default", className }: TierBadgeProps) {
  const badgeType = getBadgeType(tier);
  
  if (badgeType === "none") {
    return null;
  }

  const isSmall = size === "sm";

  if (badgeType === "premium") {
    return (
      <div
        data-testid="tier-badge"
        className={cn(
          "inline-flex items-center gap-1 font-semibold rounded-full",
          "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25",
          isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
          className
        )}
      >
        <Crown className={cn(isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
        <span>Premium</span>
      </div>
    );
  }

  // Verified badge for AGENT/PRO
  return (
    <div
      data-testid="tier-badge"
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full",
        "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <BadgeCheck className={cn(isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
      <span>Verificado</span>
    </div>
  );
}

/**
 * Compact icon-only badge for tight spaces
 */
export function TierBadgeIcon({ tier, className }: { tier: string; className?: string }) {
  const badgeType = getBadgeType(tier);
  
  if (badgeType === "none") {
    return null;
  }

  if (badgeType === "premium") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-full",
          "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm",
          className
        )}
        title="Publicación Premium"
      >
        <Sparkles className="h-3 w-3" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 rounded-full",
        "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm",
        className
      )}
      title="Agente Verificado"
    >
      <BadgeCheck className="h-3 w-3" />
    </div>
  );
}
