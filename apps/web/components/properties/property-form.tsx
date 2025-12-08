/**
 * PROPERTY FORM
 * Formulario compartido para crear y editar propiedades
 */

"use client";

import type { SerializedProperty, SubscriptionTier } from "@repo/database";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Textarea
} from "@repo/ui";
import { useActionState, useEffect, useState } from "react";
import { LimitReachedModal } from "../modals/limit-reached-modal";
import { LocationPickerMap } from "./location-picker-map";

const AMENITIES_LIST = [
  { id: "pool", label: "Piscina" },
  { id: "gym", label: "Gimnasio" },
  { id: "garage", label: "Garaje" },
  { id: "garden", label: "Jardín" },
  { id: "terrace", label: "Terraza" },
  { id: "security", label: "Seguridad 24/7" },
  { id: "elevator", label: "Ascensor" },
  { id: "ac", label: "Aire Acondicionado" },
  { id: "heating", label: "Calefacción" },
  { id: "internet", label: "Internet / Wifi" },
  { id: "furnished", label: "Amoblado" },
  { id: "pets_allowed", label: "Mascotas Permitidas" },
];

interface PropertyFormState {
  error?: {
    title?: string[];
    description?: string[];
    price?: string[];
    transactionType?: string[];
    category?: string[];
    status?: string[];
    bedrooms?: string[];
    bathrooms?: string[];
    area?: string[];
    address?: string[];
    city?: string[];
    state?: string[];
    zipCode?: string[];
    latitude?: string[];
    longitude?: string[];
    amenities?: string[];
    general?: string;
  };
  success?: boolean;
  data?: any;
  upgradeRequired?: boolean;
  currentLimit?: number;
}

interface PropertyFormProps {
  property?: SerializedProperty;
  action: any; // Server Action
  submitLabel: string;
}

export function PropertyForm({
  property,
  action,
  submitLabel,
}: PropertyFormProps) {
  const [state, formAction, isPending] =
    useActionState<PropertyFormState | null>(action, null);

  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitData, setLimitData] = useState<{
    currentTier: SubscriptionTier;
    limit: number;
  } | null>(null);

  // Estados locales para mapa y amenities
  const [latitude, setLatitude] = useState<number>(property?.latitude || -2.9001); // Cuenca default
  const [longitude, setLongitude] = useState<number>(property?.longitude || -79.0059);
  const [amenities, setAmenities] = useState<string[]>([]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAmenityToggle = (amenityId: string) => {
    setAmenities(prev => 
      prev.includes(amenityId)
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  useEffect(() => {
    if (state?.upgradeRequired) {
      setLimitData({
        currentTier: "FREE", 
        limit: state.currentLimit || 0,
      });
      setLimitModalOpen(true);
    }
  }, [state]);

  return (
    <>
      <form action={formAction} className="space-y-8">
        {/* Hidden inputs for non-standard form fields */}
        {property && <input type="hidden" name="id" value={property.id} />}
        <input type="hidden" name="latitude" value={latitude} />
        <input type="hidden" name="longitude" value={longitude} />
        {amenities.map(amenity => (
           <input key={amenity} type="hidden" name="amenities" value={amenity} /> 
        ))}

        {/* --- SECCIÓN 1: Información Principal --- */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Detalles principales para publicar tu propiedad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={property?.title}
                placeholder="Ej: Hermosa casa en zona residencial"
                className="text-lg"
                required
              />
              {state?.error?.title && (
                <p className="text-sm text-destructive">{state.error.title[0]}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Precio (USD) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={property?.price}
                    placeholder="150000"
                    className="pl-7"
                    required
                  />
                </div>
                {state?.error?.price && (
                  <p className="text-sm text-destructive">{state.error.price[0]}</p>
                )}
              </div>

              {/* Status (solo en edición) */}
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
                    <p className="text-sm text-destructive">
                      {state.error.status[0]}
                    </p>
                  )}
                </div>
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
                defaultValue={property?.description || ""}
                placeholder="Describe las características, ventajas y detalles únicos de la propiedad..."
                rows={5}
                required
              />
              {state?.error?.description && (
                <p className="text-sm text-destructive">
                  {state.error.description[0]}
                </p>
              )}
            </div>

            <Separator />

            {/* Category & Transaction */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionType">Tipo de Transacción</Label>
                <Select
                  name="transactionType"
                  defaultValue={property?.transactionType || "SALE"}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Tipo de Inmueble</Label>
                <Select
                  name="category"
                  defaultValue={property?.category || "HOUSE"}
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- SECCIÓN 2: Detalles y Amenidades --- */}
        <Card>
          <CardHeader>
            <CardTitle>Características Detalladas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Dimensions Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Dormitorios</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  defaultValue={property?.bedrooms || undefined}
                  placeholder="Ej: 3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  step="0.5"
                  min="0"
                  defaultValue={property?.bathrooms ?? undefined}
                  placeholder="Ej: 2.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={property?.area ?? undefined}
                  placeholder="Ej: 120"
                />
              </div>
            </div>

            <Separator />

            {/* Amenities Grid */}
            <div className="space-y-4">
              <Label className="text-base">Amenidades y Servicios</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AMENITIES_LIST.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex flex-row items-center space-x-3 rounded-md border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={amenities.includes(amenity.id)}
                      onCheckedChange={() => handleAmenityToggle(amenity.id)}
                    />
                    <Label
                      htmlFor={`amenity-${amenity.id}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- SECCIÓN 3: Ubicación y Mapa --- */}
        <Card>
          <CardHeader>
            <CardTitle>Ubicación</CardTitle>
            <CardDescription>
              Define la dirección exacta y ajusta el pin en el mapa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección Completa</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={property?.address || ""}
                  placeholder="Calle Principal 123 y Secundaria"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={property?.city || ""}
                  placeholder="Ej: Quito"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Provincia / Estado</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={property?.state || ""}
                  placeholder="Ej: Pichincha"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">Código Postal</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  defaultValue={property?.zipCode || ""}
                  placeholder="Ej: 170150"
                />
              </div>
            </div>

            {/* MAPA */}
            <div className="space-y-3 pt-2">
              <Label>Ubicación en el Mapa (Arrastra el marcador)</Label>
              <div className="rounded-md border overflow-hidden">
                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Lat: {latitude.toFixed(6)}</span>
                <span>Lng: {longitude.toFixed(6)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* General Error */}
        {state?.error?.general && (
          <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">{state.error.general}</p>
          </div>
        )}

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 z-10 -mx-6 -mb-6 p-6 bg-background/80 backdrop-blur-sm border-t flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>

      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        limitType="property"
        currentTier={limitData?.currentTier || "FREE"}
        limit={limitData?.limit || 0}
      />
    </>
  );
}
