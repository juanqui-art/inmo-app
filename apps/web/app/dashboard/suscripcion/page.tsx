import { CurrentPlanCard } from "@/components/dashboard/subscription/current-plan-card";
import { PlanComparisonTable } from "@/components/dashboard/subscription/plan-comparison-table";
import { UsageStatsCard } from "@/components/dashboard/subscription/usage-stats-card";
import { requireRole } from "@/lib/auth";
import {
  combineUsageWithLimits,
  getUserUsageStats,
  getUsageLimits,
} from "@/lib/dashboard/subscription-helpers";
import { Card, CardContent, CardHeader } from "@repo/ui";
import { CreditCard, Receipt } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suscripción | Dashboard",
  description: "Administra tu plan y uso de recursos",
};

export default async function SubscriptionPage() {
  // Require authentication (any logged-in user can access)
  const user = await requireRole(["CLIENT", "AGENT", "ADMIN"]);

  // Fetch usage stats
  const stats = await getUserUsageStats(user.id);
  const limits = getUsageLimits(user.subscriptionTier);
  const usage = combineUsageWithLimits(stats, limits);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Suscripción</h1>
        <p className="text-muted-foreground">
          Administra tu plan, monitorea tu uso y actualiza cuando lo necesites
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Plan + Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <CurrentPlanCard tier={user.subscriptionTier} />

          {/* Usage Stats */}
          <UsageStatsCard usage={usage} />
        </div>

        {/* Right Column: Quick Info */}
        <div className="space-y-6">
          {/* Payment Method (Placeholder) */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Método de Pago</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-sm text-muted-foreground">
                <p className="mb-2">Disponible próximamente</p>
                <p className="text-xs">
                  Pronto podrás gestionar tu método de pago con Stripe
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing History (Placeholder) */}
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Historial</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-sm text-muted-foreground">
                <p className="mb-2">Sin transacciones aún</p>
                <p className="text-xs">
                  Tu historial de pagos aparecerá aquí
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plan Comparison Table */}
      <PlanComparisonTable currentTier={user.subscriptionTier} />
    </div>
  );
}
