/**
 * DASHBOARD - Página principal
 * Vista general con estadísticas y accesos rápidos
 * Solo accesible para AGENT y ADMIN
 *
 * FEATURES:
 * - Tiered analytics: Simple for FREE/PLUS, Advanced for AGENT/PRO
 * - Real-time statistics from database
 * - Property count by status (active, draft, sold)
 * - Appointment tracking
 * - View statistics
 * - Responsive grid layout
 */

import { UtmSourceStats } from "@/components/dashboard/analytics/utm-source-stats";
import { Sparkline } from "@/components/dashboard/charts/sparkline";
import { StatusDonut } from "@/components/dashboard/charts/status-donut";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityItem, RecentActivity } from "@/components/dashboard/recent-activity";
import { SimpleStatsCard } from "@/components/dashboard/simple-stats-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SubscriptionSummaryCard } from "@/components/dashboard/subscription-summary-card";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { requireRole } from "@/lib/auth";
import {
    getAdvancedDashboardAnalytics,
    getBasicDashboardStats
} from "@/lib/dashboard/analytics-helpers";
import { getUtmSourceStats } from "@/lib/dashboard/utm-analytics-helpers";
import { canCreateProperty, getPropertyLimit } from "@/lib/permissions/property-limits";
import { TIER_RANKS, type TierName } from "@/lib/pricing/tiers";
import { db } from "@repo/database/src/client";
import { Building2, Calendar, Eye, Heart, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);
  
  // Determine if user has advanced analytics access
  const userTier = (user.subscriptionTier || "FREE") as TierName;
  const hasAdvancedAnalytics = TIER_RANKS[userTier] >= TIER_RANKS.BUSINESS;
  const showTrendIndicators = TIER_RANKS[userTier] >= TIER_RANKS.PLUS;

  // Check property creation permission
  const propertyPermission = await canCreateProperty(user.id);
  const propertyLimit = getPropertyLimit(userTier);

  // Fetch base data for all tiers in parallel
  const [propertiesData, appointmentsData, recentFavorites, recentProperties, utmStats] = await Promise.all([
    // Total properties and status breakdown
    db.property.findMany({
      where: { agentId: user.id },
      select: { id: true, status: true },
    }),
    // Total appointments (and recent ones)
    db.appointment.findMany({
      where: {
        property: {
          agentId: user.id,
        },
      },
      include: {
        user: { select: { name: true } },
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent favorites (exclude agent's own)
    db.favorite.findMany({
      where: {
        property: {
          agentId: user.id,
        },
        userId: { not: user.id },
      },
      include: {
        user: { select: { name: true } },
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent properties created
    db.property.findMany({
      where: { agentId: user.id },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // UTM Stats (only if advanced analytics allowed)
    hasAdvancedAnalytics ? getUtmSourceStats(user.id) : Promise.resolve([]),
  ]);

  // Fetch tier-specific analytics
  const analyticsData = hasAdvancedAnalytics
    ? await getAdvancedDashboardAnalytics(user.id)
    : await getBasicDashboardStats(user.id);

  // Prepare Activity Feed
  const activities: ActivityItem[] = [];

  // Add Appointments
  appointmentsData.forEach((app) => {
    activities.push({
      id: `app-${app.id}`,
      type: "APPOINTMENT",
      title: "Nueva Cita Agendada",
      description: `${app.user.name || "Usuario"} quiere ver "${app.property.title}"`,
      date: app.createdAt,
    });
  });

  // Add Favorites
  recentFavorites.forEach((fav) => {
    activities.push({
      id: `fav-${fav.id}`,
      type: "FAVORITE",
      title: "Nuevo Favorito",
      description: `${fav.user.name || "Alguien"} guardó "${fav.property.title}"`,
      date: fav.createdAt,
    });
  });

  // Add Created Properties
  recentProperties.forEach((prop) => {
    activities.push({
      id: `prop-${prop.id}`,
      type: "PROPERTY_CREATED",
      title: "Propiedad Publicada",
      description: `Publicaste "${prop.title}"`,
      date: prop.createdAt,
    });
  });

  // Sort by date desc and take top 5
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recentActivities = activities.slice(0, 5);

  // Calculate property statistics (all tiers)
  const totalProperties = propertiesData.length;
  const activeProperties = propertiesData.filter((p) => p.status === "AVAILABLE").length;
  const draftProperties = propertiesData.filter((p) => p.status === "PENDING").length;
  const soldProperties = propertiesData.filter((p) => p.status === "SOLD").length;

  const totalAppointments = appointmentsData.length;
  const pendingAppointments = appointmentsData.filter((a) => a.status === "PENDING").length;

  // Extract analytics values based on tier
  const viewsThisMonth = hasAdvancedAnalytics 
    ? (analyticsData as Awaited<ReturnType<typeof getAdvancedDashboardAnalytics>>).views.thisMonth
    : (analyticsData as Awaited<ReturnType<typeof getBasicDashboardStats>>).viewsThisMonth;
  
  const favoritesCount = hasAdvancedAnalytics
    ? (analyticsData as Awaited<ReturnType<typeof getAdvancedDashboardAnalytics>>).favorites.thisMonth
    : (analyticsData as Awaited<ReturnType<typeof getBasicDashboardStats>>).favoritesCount;

  const trendDirection = !hasAdvancedAnalytics
    ? (analyticsData as Awaited<ReturnType<typeof getBasicDashboardStats>>).trendDirection
    : undefined;

  // Advanced analytics data (only for AGENT/PRO)
  const advancedData = hasAdvancedAnalytics 
    ? analyticsData as Awaited<ReturnType<typeof getAdvancedDashboardAnalytics>>
    : null;

  // Build stats for advanced view
  const advancedStats = hasAdvancedAnalytics ? [
    {
      title: "Propiedades",
      value: String(totalProperties),
      description: `${activeProperties} activas`,
      icon: Building2,
      trend: `${soldProperties} vendidas`,
      chart: (
        <StatusDonut
          data={[
            { name: "Activas", value: activeProperties, color: "#EAB308" },
            { name: "Borrador", value: draftProperties, color: "#71717A" },
            { name: "Vendidas", value: soldProperties, color: "#22C55E" },
          ]}
        />
      ),
    },
    {
      title: "Visitas",
      value: String(viewsThisMonth),
      description: `${advancedData!.views.trend.direction === "up" ? "+" : advancedData!.views.trend.direction === "down" ? "-" : ""}${advancedData!.views.trend.percentage}% vs mes pasado`,
      icon: Eye,
      trend: "Últimos 7 días",
      chart: (
        <Sparkline
          data={advancedData!.views.sparkline}
          color="#EAB308"
        />
      ),
    },
    {
      title: "Favoritos",
      value: String(favoritesCount),
      description: `${advancedData!.favorites.trend.direction === "up" ? "+" : advancedData!.favorites.trend.direction === "down" ? "-" : ""}${advancedData!.favorites.trend.percentage}% vs mes pasado`,
      icon: Heart,
      trend: "Interés real",
      chart: null,
    },
    {
      title: "Citas",
      value: String(totalAppointments),
      description: "Citas programadas",
      icon: Calendar,
      trend: `${pendingAppointments} pendientes`,
      chart: null,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {user.name || "Usuario"}
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus propiedades y citas con clientes
        </p>
      </div>

      {/* Stats Grid - TIERED */}
      {hasAdvancedAnalytics ? (
        /* AGENT/PRO: Advanced Stats with Charts */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {advancedStats.map((stat, index) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
              index={index}
            />
          ))}
        </div>
      ) : (
        /* FREE/PLUS: Simple Stats */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SimpleStatsCard
            title="Propiedades"
            value={totalProperties}
            description={`${activeProperties} activas, ${soldProperties} vendidas`}
            iconName="Building2"
          />
          <SimpleStatsCard
            title="Visitas"
            value={viewsThisMonth}
            description="Visitas a tus propiedades este mes"
            iconName="Eye"
            showTrend={showTrendIndicators}
            trendDirection={trendDirection}
          />
          <SimpleStatsCard
            title="Favoritos"
            value={favoritesCount}
            description="Personas interesadas en tus propiedades"
            iconName="Heart"
          />
          <SimpleStatsCard
            title="Citas"
            value={totalAppointments}
            description={pendingAppointments > 0 ? `${pendingAppointments} pendientes` : "Sin citas pendientes"}
            iconName="Calendar"
          />
        </div>
      )}



      {/* Top Property (AGENT/PRO only) */}
      {hasAdvancedAnalytics && advancedData?.topProperty && advancedData.topProperty.views > 0 && (
        <div className="rounded-xl border border-border bg-gradient-to-r from-primary/5 to-transparent p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Propiedad más popular este mes</p>
              <p className="font-semibold">{advancedData.topProperty.title}</p>
              <p className="text-sm text-primary">{advancedData.topProperty.views} visitas</p>
            </div>
          </div>
        </div>
      )}

      {/* Clients Card (AGENT/PRO only) */}
      {hasAdvancedAnalytics && advancedData && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
              <p className="text-2xl font-bold">{advancedData.clients.total}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Usuarios que han mostrado interés en tus propiedades (favoritos o citas)
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Left Column: Activity & Onboarding */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding Checklist (Shows only if incomplete) */}
          <OnboardingChecklist
            hasProperties={totalProperties > 0}
            hasAppointments={totalAppointments > 0}
            userName={user.name}
          />

          {/* Recent Activity */}
          <RecentActivity activities={recentActivities} />
          
          {/* UTM Source Analytics (AGENT/PRO only) */}
          {hasAdvancedAnalytics && (
             <UtmSourceStats 
               stats={utmStats} 
               totalLeads={utmStats.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0)} 
             />
          )}
        </div>

        {/* Right Column: Subscription & Actions */}
        <div className="space-y-6">
           {/* Subscription Summary */}
           <SubscriptionSummaryCard 
              tier={userTier} 
              usage={{
                 properties: { 
                   current: totalProperties, 
                   limit: propertyLimit 
                 }
              }} 
           />

          {/* Quick Actions */}
          <QuickActions
            canCreateProperty={propertyPermission.allowed}
            currentTier={userTier}
            propertyLimit={propertyLimit}
          />
        </div>
      </div>

      {/* Upgrade Modal (Client Component) */}
      <UpgradeModal />
    </div>
  );
}
