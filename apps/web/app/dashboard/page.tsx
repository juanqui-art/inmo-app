/**
 * DASHBOARD - Página principal
 * Vista general con estadísticas y accesos rápidos
 * Solo accesible para AGENT y ADMIN
 *
 * FEATURES:
 * - Real-time statistics from database
 * - Property count by status (active, draft, sold)
 * - Appointment tracking
 * - View statistics
 * - Responsive grid layout
 */

import { db } from "@repo/database/src/client";
import { Building2, Calendar, TrendingUp, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireRole(["AGENT", "ADMIN"]);

  // Fetch real data from database in parallel
  const [propertiesData, appointmentsData, viewsData] = await Promise.all([
    // Total properties and status breakdown
    db.property.findMany({
      where: { agentId: user.id },
      select: { id: true, status: true },
    }),
    // Total appointments
    db.appointment.findMany({
      where: {
        property: {
          agentId: user.id,
        },
      },
      select: { id: true, status: true, createdAt: true },
    }),
    // Total views this month
    db.propertyView.findMany({
      where: {
        property: {
          agentId: user.id,
        },
        viewedAt: {
          gte: new Date(new Date().setDate(1)), // First day of month
        },
      },
      select: { id: true },
    }),
  ]);

  // Calculate statistics
  const totalProperties = propertiesData.length;
  const activeProperties = propertiesData.filter(
    (p) => p.status === "AVAILABLE",
  ).length;
  const draftProperties = propertiesData.filter(
    (p) => p.status === "PENDING",
  ).length;
  const soldProperties = propertiesData.filter(
    (p) => p.status === "SOLD",
  ).length;

  const totalAppointments = appointmentsData.length;
  const pendingAppointments = appointmentsData.filter(
    (a) => a.status === "PENDING",
  ).length;

  const totalViews = viewsData.length;
  const uniqueClients = appointmentsData.length; // Simplified: use appointment count

  const stats = [
    {
      title: "Propiedades",
      value: String(totalProperties),
      description: `${activeProperties} activas, ${draftProperties} borradores`,
      icon: Building2,
      trend: `${soldProperties} vendidas`,
    },
    {
      title: "Citas",
      value: String(totalAppointments),
      description: "Citas programadas",
      icon: Calendar,
      trend: `${pendingAppointments} pendientes`,
    },
    {
      title: "Clientes",
      value: String(uniqueClients),
      description: "Clientes activos",
      icon: Users,
      trend: "Interacciones totales",
    },
    {
      title: "Visitas",
      value: String(totalViews),
      description: "Visitas este mes",
      icon: TrendingUp,
      trend: `${Math.round((totalViews / Math.max(activeProperties, 1)) * 10) / 10} promedio por propiedad`,
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
