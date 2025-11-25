/**
 * ADMIN - Panel de Administración
 * Dashboard principal con estadísticas y accesos rápidos
 */

import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Heart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getAdminStatsAction } from "@/app/actions/admin";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"]);
  const stats = await getAdminStatsAction();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {user.name || "Administrador"}
        </h1>
        <p className="text-muted-foreground">
          Panel de administración de InmoApp
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Usuarios
            </span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.recentUsers} últimos 30 días
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Propiedades
            </span>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.recentProperties} últimos 30 días
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Citas
            </span>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Favoritos
            </span>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{stats.totalFavorites}</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/usuarios"
          className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors"
        >
          <Users className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Gestión de Usuarios
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Administra usuarios, cambia roles y gestiona cuentas
          </p>
          <div className="mt-4 flex gap-2">
            {stats.usersByRole.map((item) => (
              <span
                key={item.role}
                className="text-xs px-2 py-1 rounded-full bg-muted"
              >
                {item.count}{" "}
                {item.role === "CLIENT"
                  ? "clientes"
                  : item.role === "AGENT"
                    ? "agentes"
                    : "admins"}
              </span>
            ))}
          </div>
        </Link>

        <Link
          href="/admin/propiedades"
          className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors"
        >
          <Building2 className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Gestión de Propiedades
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Modera y administra todas las propiedades
          </p>
          <div className="mt-4 flex gap-2">
            {stats.propertiesByStatus.slice(0, 2).map((item) => (
              <span
                key={item.status}
                className="text-xs px-2 py-1 rounded-full bg-muted"
              >
                {item.count}{" "}
                {item.status === "AVAILABLE"
                  ? "disponibles"
                  : item.status === "SOLD"
                    ? "vendidas"
                    : item.status.toLowerCase()}
              </span>
            ))}
          </div>
        </Link>

        <Link
          href="/admin/analytics"
          className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors"
        >
          <BarChart3 className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            Analytics
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Métricas y estadísticas de la plataforma
          </p>
        </Link>
      </div>

      {/* Recent activity summary */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen de Actividad</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Citas por Estado
            </h4>
            <div className="space-y-2">
              {stats.appointmentsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.status === "PENDING"
                      ? "Pendientes"
                      : item.status === "CONFIRMED"
                        ? "Confirmadas"
                        : item.status === "CANCELLED"
                          ? "Canceladas"
                          : "Completadas"}
                  </span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Propiedades por Estado
            </h4>
            <div className="space-y-2">
              {stats.propertiesByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.status === "AVAILABLE"
                      ? "Disponibles"
                      : item.status === "PENDING"
                        ? "Pendientes"
                        : item.status === "SOLD"
                          ? "Vendidas"
                          : "Rentadas"}
                  </span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Usuarios por Rol
            </h4>
            <div className="space-y-2">
              {stats.usersByRole.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.role === "CLIENT"
                      ? "Clientes"
                      : item.role === "AGENT"
                        ? "Agentes"
                        : "Admins"}
                  </span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
