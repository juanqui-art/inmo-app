/**
 * PROPERTY CARD
 * Card component para mostrar una propiedad en la lista
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Bed, Bath, Maximize } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { PropertyWithRelations } from '@repo/database'

interface PropertyCardProps {
  property: PropertyWithRelations
  actions?: React.ReactNode
}

export function PropertyCard({ property, actions }: PropertyCardProps) {
  // Formatear precio para Ecuador (USD con formato europeo: punto para miles, coma para decimales)
  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(Number(property.price))

  // Traducir tipo de transacción
  const transactionTypeLabels: Record<string, string> = {
    SALE: 'Venta',
    RENT: 'Arriendo',
  }

  // Traducir categoría de inmueble
  const categoryLabels: Record<string, string> = {
    HOUSE: 'Casa',
    APARTMENT: 'Departamento',
    SUITE: 'Suite',
    VILLA: 'Villa',
    PENTHOUSE: 'Penthouse',
    DUPLEX: 'Dúplex',
    LOFT: 'Loft',
    LAND: 'Terreno',
    COMMERCIAL: 'Local Comercial',
    OFFICE: 'Oficina',
    WAREHOUSE: 'Bodega',
    FARM: 'Finca',
  }

  // Traducir estado
  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    PENDING: 'Pendiente',
    SOLD: 'Vendida',
    RENTED: 'Rentada',
  }

  const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
    AVAILABLE: 'default',
    PENDING: 'secondary',
    SOLD: 'destructive',
    RENTED: 'destructive',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-muted flex items-center justify-center">
          {property.images.length > 0 && property.images[0] ? (
            <Image
              src={property.images[0].url}
              alt={property.images[0].alt || property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Building2 className="h-16 w-16 text-muted-foreground" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <Badge>{transactionTypeLabels[property.transactionType]}</Badge>
            <Badge variant="secondary">{categoryLabels[property.category]}</Badge>
            <Badge variant={statusColors[property.status]}>
              {statusLabels[property.status]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Title */}
        <Link
          href={`/dashboard/propiedades/${property.id}/editar`}
          className="block"
        >
          <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        {(property.city || property.state) && (
          <p className="text-sm text-muted-foreground mb-3">
            {[property.city, property.state].filter(Boolean).join(', ')}
          </p>
        )}

        {/* Price */}
        <p className="text-2xl font-bold text-primary mb-3">{formattedPrice}</p>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}

          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{Number(property.bathrooms)}</span>
            </div>
          )}

          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{Number(property.area)} m²</span>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {property.description}
          </p>
        )}
      </CardContent>

      {/* Actions (if provided) */}
      {actions && <CardFooter className="p-4 pt-0">{actions}</CardFooter>}
    </Card>
  )
}
