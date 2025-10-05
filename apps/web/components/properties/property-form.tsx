/**
 * PROPERTY FORM
 * Formulario compartido para crear y editar propiedades
 */

'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@repo/ui'
import type { SerializedProperty } from '@repo/database'

interface PropertyFormState {
  error?: {
    title?: string[]
    description?: string[]
    price?: string[]
    transactionType?: string[]
    category?: string[]
    status?: string[]
    bedrooms?: string[]
    bathrooms?: string[]
    area?: string[]
    address?: string[]
    city?: string[]
    state?: string[]
    zipCode?: string[]
    latitude?: string[]
    longitude?: string[]
    general?: string
  }
  success?: boolean
  data?: any
}

interface PropertyFormProps {
  property?: SerializedProperty
  action: any // Server Action
  submitLabel: string
}

export function PropertyForm({ property, action, submitLabel }: PropertyFormProps) {
  const [state, formAction, isPending] = useActionState<PropertyFormState | null>(action, null)

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden ID for edit */}
      {property && <input type="hidden" name="id" value={property.id} />}

      {/* SECCIÓN 1: Información Básica */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold">Información Básica</h3>
          <p className="text-sm text-muted-foreground">
            Campos obligatorios para publicar la propiedad
          </p>
        </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={property?.title}
          placeholder="Casa en venta en zona residencial"
          required
        />
        {state?.error?.title && (
          <p className="text-sm text-destructive">{state.error.title[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={property?.description || ''}
          placeholder="Describe las características de la propiedad... (mínimo 20 caracteres)"
          rows={5}
          required
        />
        {state?.error?.description && (
          <p className="text-sm text-destructive">{state.error.description[0]}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          Precio (USD) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          defaultValue={property?.price}
          placeholder="150000"
          required
        />
        {state?.error?.price && (
          <p className="text-sm text-destructive">{state.error.price[0]}</p>
        )}
      </div>

      {/* Transaction Type & Category Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Type */}
        <div className="space-y-2">
          <Label htmlFor="transactionType">
            Tipo de Transacción <span className="text-destructive">*</span>
          </Label>
          <Select
            name="transactionType"
            defaultValue={property?.transactionType || 'SALE'}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona operación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Venta</SelectItem>
              <SelectItem value="RENT">Arriendo</SelectItem>
            </SelectContent>
          </Select>
          {state?.error?.transactionType && (
            <p className="text-sm text-destructive">
              {state.error.transactionType[0]}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Tipo de Inmueble <span className="text-destructive">*</span>
          </Label>
          <Select
            name="category"
            defaultValue={property?.category || 'HOUSE'}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOUSE">Casa</SelectItem>
              <SelectItem value="APARTMENT">Departamento</SelectItem>
              <SelectItem value="SUITE">Suite</SelectItem>
              <SelectItem value="VILLA">Villa</SelectItem>
              <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
              <SelectItem value="DUPLEX">Dúplex</SelectItem>
              <SelectItem value="LOFT">Loft</SelectItem>
              <SelectItem value="LAND">Terreno</SelectItem>
              <SelectItem value="COMMERCIAL">Local Comercial</SelectItem>
              <SelectItem value="OFFICE">Oficina</SelectItem>
              <SelectItem value="WAREHOUSE">Bodega</SelectItem>
              <SelectItem value="FARM">Finca/Hacienda</SelectItem>
            </SelectContent>
          </Select>
          {state?.error?.category && (
            <p className="text-sm text-destructive">{state.error.category[0]}</p>
          )}
        </div>
      </div>
      </div>
      {/* FIN SECCIÓN 1 */}

      {/* SECCIÓN 2: Características */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold">Características</h3>
          <p className="text-sm text-muted-foreground">
            Información adicional sobre la propiedad (opcional)
          </p>
        </div>

      {/* Bedrooms, Bathrooms, Area Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bedrooms */}
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Dormitorios</Label>
          <Input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            defaultValue={property?.bedrooms || undefined}
            placeholder="3"
          />
          {state?.error?.bedrooms && (
            <p className="text-sm text-destructive">{state.error.bedrooms[0]}</p>
          )}
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Baños</Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            step="0.5"
            min="0"
            defaultValue={property?.bathrooms ?? undefined}
            placeholder="2.5"
          />
          {state?.error?.bathrooms && (
            <p className="text-sm text-destructive">{state.error.bathrooms[0]}</p>
          )}
        </div>

        {/* Area */}
        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            name="area"
            type="number"
            step="0.01"
            min="0"
            defaultValue={property?.area ?? undefined}
            placeholder="150"
          />
          {state?.error?.area && (
            <p className="text-sm text-destructive">{state.error.area[0]}</p>
          )}
        </div>
      </div>
      </div>
      {/* FIN SECCIÓN 2 */}

      {/* SECCIÓN 3: Ubicación */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-semibold">Ubicación</h3>
          <p className="text-sm text-muted-foreground">
            Si proporcionas ubicación, debes incluir al menos Ciudad y Provincia
          </p>
        </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          defaultValue={property?.address || ''}
          placeholder="Av. Principal #123"
        />
        {state?.error?.address && (
          <p className="text-sm text-destructive">{state.error.address[0]}</p>
        )}
      </div>

      {/* City, State, Zip Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            name="city"
            defaultValue={property?.city || ''}
            placeholder="Quito"
          />
          {state?.error?.city && (
            <p className="text-sm text-destructive">{state.error.city[0]}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">Provincia</Label>
          <Input
            id="state"
            name="state"
            defaultValue={property?.state || ''}
            placeholder="Pichincha"
          />
          {state?.error?.state && (
            <p className="text-sm text-destructive">{state.error.state[0]}</p>
          )}
        </div>

        {/* Zip Code */}
        <div className="space-y-2">
          <Label htmlFor="zipCode">Código Postal</Label>
          <Input
            id="zipCode"
            name="zipCode"
            defaultValue={property?.zipCode || ''}
            placeholder="170150 o 12345"
          />
          {state?.error?.zipCode && (
            <p className="text-sm text-destructive">{state.error.zipCode[0]}</p>
          )}
        </div>
      </div>
      </div>
      {/* FIN SECCIÓN 3 */}

      {/* Status (solo para editar) */}
      {property && (
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select name="status" defaultValue={property.status}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Disponible</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="SOLD">Vendida</SelectItem>
              <SelectItem value="RENTED">Rentada</SelectItem>
            </SelectContent>
          </Select>
          {state?.error?.status && (
            <p className="text-sm text-destructive">{state.error.status[0]}</p>
          )}
        </div>
      )}

      {/* General Error */}
      {state?.error?.general && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{state.error.general}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
