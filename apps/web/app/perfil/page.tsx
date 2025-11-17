/**
 * PERFIL - Página principal del cliente
 * Solo accesible para usuarios autenticados (todos los roles)
 *
 * Ejecuta acciones pendientes (intents) guardadas durante login
 * (ej: guardar favorito sin estar autenticado)
 */

import { Building2, Heart } from "lucide-react";
// DISABLED: Calendar icon temporarily unused due to disabled Mis Citas link
// import { Calendar } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { AuthSuccessHandler } from "@/components/auth/auth-success-handler";

export default async function PerfilPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Auth Success Handler (Client Component) - muestra modal de éxito y redirige */}
      <AuthSuccessHandler />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">InmoApp</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm text-destructive hover:underline"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hola, {user.name || "Usuario"}
            </h1>
            <p className="text-muted-foreground">
              Encuentra tu propiedad ideal
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/propiedades"
              className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
            >
              <Building2 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Buscar Propiedades</h3>
              <p className="text-sm text-muted-foreground">
                Explora propiedades disponibles
              </p>
            </Link>

            <Link
              href="/perfil/favoritos"
              className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
            >
              <Heart className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Mis Favoritos</h3>
              <p className="text-sm text-muted-foreground">
                Propiedades que te interesan
              </p>
            </Link>

            {/* DISABLED: Mis Citas link temporarily disabled to fix Turbopack build
            <Link
              href="/perfil/citas"
              className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
            >
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Mis Citas</h3>
              <p className="text-sm text-muted-foreground">Citas programadas</p>
            </Link>
            */}
          </div>

          {/* Info Message */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2">Área de Cliente</h2>
            <p className="text-sm text-muted-foreground">
              Esta es tu área personal. Aquí podrás gestionar tus propiedades
              favoritas, ver tus citas programadas con agentes y actualizar tu
              perfil.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
