"use client";

import { getUsagePercentage, getWarningLevel } from "@/lib/dashboard/subscription-helpers";
import { getTierPricing } from "@/lib/pricing/tiers";
import type { SubscriptionTier } from "@repo/database";
import { Badge, Button, Card, CardContent, CardHeader, Progress } from "@repo/ui";
import { ArrowRight, Check, Crown, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface SubscriptionSummaryCardProps {
  tier: SubscriptionTier;
  usage: {
    properties: { current: number; limit: number };
  };
}

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  FREE: <Star className="w-4 h-4" />,
  PLUS: <Sparkles className="w-4 h-4" />,
  BUSINESS: <Check className="w-4 h-4" />,
  PRO: <Crown className="w-4 h-4" />,
};

const tierColors: Record<SubscriptionTier, string> = {
  FREE: "bg-oslo-gray-100 text-oslo-gray-700 dark:bg-oslo-gray-800 dark:text-oslo-gray-300",
  PLUS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  BUSINESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  PRO: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
};

export function SubscriptionSummaryCard({ tier, usage }: SubscriptionSummaryCardProps) {
  const pricing = getTierPricing(tier);
  
  const percentage = useMemo(() => 
    getUsagePercentage(usage.properties.current, usage.properties.limit), 
    [usage.properties]
  );
  
  const warningLevel = getWarningLevel(percentage);
  const isUnlimited = usage.properties.limit === Infinity;

  // Progress bar colors
  const progressColors = {
    safe: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Tu Suscripción</h3>
          <Badge className={`${tierColors[tier]} flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold border-none`}>
            {tierIcons[tier]}
            {pricing.displayName}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Properties Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Propiedades</span>
            <span className="font-medium">
              {usage.properties.current} / {isUnlimited ? "∞" : usage.properties.limit}
            </span>
          </div>
          
          {!isUnlimited && (
            <Progress 
              value={percentage} 
              className="h-2" 
              indicatorClassName={progressColors[warningLevel]} 
            />
          )}
        </div>
        
        {/* Quick Link */}
        <Button variant="outline" className="w-full justify-between group" asChild>
          <Link href="/dashboard/suscripcion">
            <span className="text-sm">Gestionar Plan</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
