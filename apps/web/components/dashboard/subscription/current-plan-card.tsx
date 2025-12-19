"use client";

import { getNextTierUpgrade } from "@/lib/dashboard/subscription-helpers";
import { getTierPricing } from "@/lib/pricing/tiers";
import type { SubscriptionTier } from "@repo/database";
import { Badge, Button, Card, CardContent, CardHeader } from "@repo/ui";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import Link from "next/link";

interface CurrentPlanCardProps {
  tier: SubscriptionTier;
}

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  FREE: <Star className="w-5 h-5" />,
  PLUS: <Sparkles className="w-5 h-5" />,
  BUSINESS: <Check className="w-5 h-5" />,
  PRO: <Crown className="w-5 h-5" />,
};

const tierColors: Record<SubscriptionTier, string> = {
  FREE: "bg-oslo-gray-100 text-oslo-gray-700 dark:bg-oslo-gray-800 dark:text-oslo-gray-300",
  PLUS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  BUSINESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  PRO: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
};

export function CurrentPlanCard({ tier }: CurrentPlanCardProps) {
  const pricing = getTierPricing(tier);
  const nextTier = getNextTierUpgrade(tier);
  const nextTierPricing = nextTier ? getTierPricing(nextTier) : null;

  return (
    <Card className="border-2">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Plan Actual</p>
            <div className="flex items-center gap-3">
              <Badge className={`${tierColors[tier]} flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold`}>
                {tierIcons[tier]}
                {pricing.displayName}
              </Badge>
            </div>
          </div>

          {tier === "PRO" && (
            <div className="flex items-center gap-1.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
              <Crown className="w-4 h-4" />
              Plan Premium
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${pricing.price}</span>
            <span className="text-lg text-muted-foreground">/ {pricing.period}</span>
          </div>
          {tier === "FREE" && (
            <p className="text-sm text-muted-foreground">
              Perfecto para probar la plataforma
            </p>
          )}
          {tier !== "FREE" && (
            <p className="text-sm text-muted-foreground">
              {tier === "PRO"
                ? "Todas las funcionalidades premium"
                : "Acceso a funcionalidades avanzadas"
              }
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upgrade CTA */}
        {nextTier && nextTierPricing && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    Actualiza a {nextTierPricing.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Desbloquea más funcionalidades
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${nextTierPricing.price}</p>
                  <p className="text-xs text-muted-foreground">/{nextTierPricing.period}</p>
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard/suscripcion/upgrade">
                  Actualizar Plan
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Current Plan Features (Quick Summary) */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Tu plan incluye:
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>{pricing.limits?.properties || 1} {pricing.limits?.properties === 1 ? 'propiedad' : 'propiedades'}</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>{pricing.limits?.images || 6} imágenes por propiedad</span>
            </li>
            {tier !== "FREE" && (
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>
                  {pricing.limits?.featured === Infinity
                    ? 'Destacados ilimitados'
                    : `${pricing.limits?.featured} destacado${pricing.limits?.featured === 1 ? '' : 's'}`
                  }
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Manage Subscription (Placeholder for Stripe) */}
        {tier !== "FREE" && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Próximamente: Administra tu método de pago y renovación
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
