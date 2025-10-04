/**
 * ADMIN - Panel de Administración
 * Solo accesible para rol ADMIN
 */

import { requireRole } from '@/lib/auth'
import { Users, Building2, BarChart3, Settings } from 'lucide-react'

export default async function AdminPage() {
  const user = await requireRole(['ADMIN'])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Bienvenido, {user.name || 'Administrador'}
            </h2>
            <p className="text-muted-foreground">
              Gestiona usuarios, propiedades y configuración de la plataforma
            </p>
          </div>

          {/* Admin Links */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Usuarios</h3>
              <p className="text-sm text-muted-foreground">
                Gestionar usuarios y roles
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Building2 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Propiedades</h3>
              <p className="text-sm text-muted-foreground">
                Todas las propiedades
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <BarChart3 className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Reportes</h3>
              <p className="text-sm text-muted-foreground">
                Analytics y estadísticas
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <Settings className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Configuración</h3>
              <p className="text-sm text-muted-foreground">
                Ajustes de la plataforma
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">
              Panel de Administración
            </h3>
            <p className="text-sm text-muted-foreground">
              Como administrador, tienes acceso completo a todas las
              funcionalidades de la plataforma. Puedes gestionar usuarios,
              propiedades, ver reportes y configurar el sistema.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
