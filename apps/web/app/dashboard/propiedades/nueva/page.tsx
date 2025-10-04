/**
 * NUEVA PROPIEDAD
 * Formulario para crear una nueva propiedad
 */

import { requireRole } from '@/lib/auth'
import { PropertyForm } from '@/components/properties/property-form'
import { createPropertyAction } from '@/app/actions/properties'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NuevaPropiedadPage() {
  // Verificar que el usuario es AGENT o ADMIN
  await requireRole(['AGENT', 'ADMIN'])

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/propiedades"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Volver a propiedades
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Propiedad</h1>
        <p className="text-muted-foreground">
          Completa la información de la propiedad
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <div className="rounded-lg border border-border bg-card p-6">
          <PropertyForm action={createPropertyAction} submitLabel="Crear Propiedad" />
        </div>
      </div>
    </div>
  )
}
