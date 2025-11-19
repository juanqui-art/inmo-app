/**
 * ADMIN - Analytics y Métricas
 * Dashboard con estadísticas globales de la plataforma
 */

import { requireRole } from "@/lib/auth";
import { getAdminStatsAction, getAdminMetricsByPeriodAction } from "@/app/actions/admin";
import {
  Users,
  Building2,
  Calendar,
  Heart,
  TrendingUp,
  UserCheck,
  Home,
  Clock,
} from "lucide-react";

// Labels for roles and statuses
const roleLabels: Record<string, string> = {
  CLIENT: "Clientes",
  AGENT: "Agentes",
  ADMIN: "Admins",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponibles",
  PENDING: "Pendientes",
  SOLD: "Vendidas",
  RENTED: "Rentadas",
};

const appointmentStatusLabels: Record<string, string> = {
  PENDING: "Pendientes",
  CONFIRMED: "Confirmadas",
  CANCELLED: "Canceladas",
  COMPLETED: "Completadas",
};

export default async function AnalyticsPage() {
  await requireRole(["ADMIN"]);

  const [stats, metrics] = await Promise.all([
    getAdminStatsAction(),
    getAdminMetricsByPeriodAction(30),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Métricas y estadísticas de la plataforma
        </p>
      </div>

      {/* Main stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={Users}
          description={`+${stats.recentUsers} últimos 30 días`}
        />
        <StatsCard
          title="Total Propiedades"
          value={stats.totalProperties}
          icon={Building2}
          description={`+${stats.recentProperties} últimos 30 días`}
        />
        <StatsCard
          title="Total Citas"
          value={stats.totalAppointments}
          icon={Calendar}
        />
        <StatsCard
          title="Total Favoritos"
          value={stats.totalFavorites}
          icon={Heart}
        />
      </div>

      {/* Breakdowns */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users by role */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Usuarios por Rol
          </h3>
          <div className="space-y-3">
            {stats.usersByRole.map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {roleLabels[item.role] || item.role}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(item.count / stats.totalUsers) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by status */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Propiedades por Estado
          </h3>
          <div className="space-y-3">
            {stats.propertiesByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {statusLabels[item.status] || item.status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${stats.totalProperties > 0 ? (item.count / stats.totalProperties) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments by status */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Citas por Estado
          </h3>
          <div className="space-y-3">
            {stats.appointmentsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {appointmentStatusLabels[item.status] || item.status}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${stats.totalAppointments > 0 ? (item.count / stats.totalAppointments) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity summary */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Actividad Últimos 30 Días
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-3xl font-bold text-primary">
              {metrics.users.reduce((acc, u) => acc + u.count, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Nuevos usuarios</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-3xl font-bold text-primary">
              {metrics.properties.reduce((acc, p) => acc + p.count, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Nuevas propiedades</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-3xl font-bold text-primary">
              {metrics.appointments.reduce((acc, a) => acc + a.count, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Nuevas citas</p>
          </div>
        </div>
      </div>

      {/* Daily activity breakdown */}
      {metrics.users.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Registro Diario de Usuarios</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {metrics.users.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center"
                  title={`${day.date}: ${day.count} usuarios`}
                >
                  <div
                    className="w-3 bg-primary rounded-sm"
                    style={{
                      height: `${Math.max(4, day.count * 8)}px`,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 rotate-45">
                    {day.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stats card component
function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
