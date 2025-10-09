/**
 * DASHBOARD - Página principal
 * Vista general con estadísticas y accesos rápidos
 * Solo accesible para AGENT y ADMIN
 */

import { Building2, Calendar, TrendingUp, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Stats básicas (después conectaremos con datos reales)
  const stats = [
    {
      title: "Propiedades",
      value: "12",
      description: "Propiedades activas",
      icon: Building2,
      trend: "+2 esta semana",
    },
    {
      title: "Citas",
      value: "8",
      description: "Citas programadas",
      icon: Calendar,
      trend: "3 pendientes",
    },
    {
      title: "Clientes",
      value: "24",
      description: "Clientes activos",
      icon: Users,
      trend: "+5 este mes",
    },
    {
      title: "Visitas",
      value: "245",
      description: "Visitas este mes",
      icon: TrendingUp,
      trend: "+12% vs mes anterior",
    },
  ];

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

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <p className="text-xs font-medium text-primary">{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No hay actividad reciente para mostrar.
          </p>
          <p className="text-xs text-muted-foreground">
            Cuando agregues propiedades a favoritos o programes citas,
            aparecerán aquí.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
        <div className="flex gap-4">
          <a
            href="/dashboard/propiedades/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Building2 className="h-4 w-4" />
            Nueva Propiedad
          </a>
          <a
            href="/dashboard/propiedades"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            Ver Mis Propiedades
          </a>
        </div>
      </div>
    </div>
  );
}
