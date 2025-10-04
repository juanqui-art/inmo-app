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
import type { PropertyWithRelations } from '@repo/database'

interface PropertyFormProps {
  property?: PropertyWithRelations
  action: any // Server Action
  submitLabel: string
}

export function PropertyForm({ property, action, submitLabel }: PropertyFormProps) {
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden ID for edit */}
      {property && <input type="hidden" name="id" value={property.id} />}

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
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={property?.description || ''}
          placeholder="Describe las características de la propiedad..."
          rows={5}
        />
        {state?.error?.description && (
          <p className="text-sm text-destructive">{state.error.description[0]}</p>
        )}
      </div>

      {/* Price & Type Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Precio (MXN) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={property?.price ? Number(property.price) : undefined}
            placeholder="1500000"
            required
          />
          {state?.error?.price && (
            <p className="text-sm text-destructive">{state.error.price[0]}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">
            Tipo <span className="text-destructive">*</span>
          </Label>
          <Select name="type" defaultValue={property?.type || 'SALE'} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Venta</SelectItem>
              <SelectItem value="RENT">Renta</SelectItem>
            </SelectContent>
          </Select>
          {state?.error?.type && (
            <p className="text-sm text-destructive">{state.error.type[0]}</p>
          )}
        </div>
      </div>

      {/* Bedrooms, Bathrooms, Area Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Bedrooms */}
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Recámaras</Label>
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
            defaultValue={property?.bathrooms ? Number(property.bathrooms) : undefined}
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
            defaultValue={property?.area ? Number(property.area) : undefined}
            placeholder="150"
          />
          {state?.error?.area && (
            <p className="text-sm text-destructive">{state.error.area[0]}</p>
          )}
        </div>
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
            placeholder="Guadalajara"
          />
          {state?.error?.city && (
            <p className="text-sm text-destructive">{state.error.city[0]}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            name="state"
            defaultValue={property?.state || ''}
            placeholder="Jalisco"
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
            placeholder="44100"
          />
          {state?.error?.zipCode && (
            <p className="text-sm text-destructive">{state.error.zipCode[0]}</p>
          )}
        </div>
      </div>

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
