/**
 * EDITAR PROPIEDAD
 * Formulario para editar una propiedad existente
 * Solo el owner o ADMIN pueden editar
 */

import { requireRole } from '@/lib/auth'
import { propertyRepository } from '@repo/database'
import { PropertyForm } from '@/components/properties/property-form'
import { updatePropertyAction } from '@/app/actions/properties'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditarPropiedadPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarPropiedadPage({
  params,
}: EditarPropiedadPageProps) {
  // Verificar autenticación
  const user = await requireRole(['AGENT', 'ADMIN'])

  // Obtener ID de la propiedad
  const { id } = await params

  // Cargar propiedad
  const property = await propertyRepository.findById(id)

  if (!property) {
    notFound()
  }

  // Verificar ownership (ADMIN puede editar cualquier propiedad)
  if (property.agentId !== user.id && user.role !== 'ADMIN') {
    throw new Error('No tienes permiso para editar esta propiedad')
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Editar Propiedad</h1>
        <p className="text-muted-foreground">{property.title}</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <div className="rounded-lg border border-border bg-card p-6">
          <PropertyForm
            property={property}
            action={updatePropertyAction}
            submitLabel="Guardar Cambios"
          />
        </div>
      </div>
    </div>
  )
}
