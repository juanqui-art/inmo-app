"use client";

import { AddressAutocomplete } from "@/components/properties/address-autocomplete";
import { LocationPickerMap } from "@/components/properties/location-picker-map";
import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from "@repo/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const step2Schema = z.object({
  address: z
    .string()
    .min(5, "La dirección es requerida y debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "El estado/provincia es requerido"),
  zipCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

type Step2Values = z.infer<typeof step2Schema>;

export function Step2() {
  const { formData, updateFormData, nextStep } = usePropertyWizardStore();

  const form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      address: formData.address || "",
      city: formData.city || "",
      state: formData.state || "",
      zipCode: formData.zipCode || "",
      latitude: formData.latitude || -2.9001, // Default to Cuenca/Ecuador approx
      longitude: formData.longitude || -79.0059,
    },
  });

  // Update form values if store changes (e.g. navigating back)
  useEffect(() => {
    form.reset({
      address: formData.address || "",
      city: formData.city || "",
      state: formData.state || "",
      zipCode: formData.zipCode || "",
      latitude: formData.latitude || -2.9001,
      longitude: formData.longitude || -79.0059,
    });
  }, [formData, form]);

  const onSubmit = (values: Step2Values) => {
    updateFormData(values);
    nextStep();
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue("latitude", lat, { shouldValidate: true });
    form.setValue("longitude", lng, { shouldValidate: true });
  };

  const handleAddressSelect = (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    form.setValue("address", data.address);
    // Only set city/state/zip if they have content, to avoid clearing user data with empty strings if API returns nothing
    if (data.city) form.setValue("city", data.city);
    if (data.state) form.setValue("state", data.state);
    if (data.zipCode) form.setValue("zipCode", data.zipCode);
    
    form.setValue("latitude", data.latitude);
    form.setValue("longitude", data.longitude);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ubicación de la Propiedad</h2>
        <p className="text-sm text-muted-foreground">
          Busca la dirección para autocompletar o usa el mapa para mayor
          precisión.
        </p>
      </div>

      {/* 1. Smart Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Buscar ubicación
        </label>
        <AddressAutocomplete onAddressSelect={handleAddressSelect} />
      </div>

      <Form {...form}>
        <form
          id="wizard-step-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* 2. Map Visualizer */}
          <div className="space-y-2 rounded-lg border p-1 bg-muted/20">
            <FormLabel className="px-2 pt-2 block">
              Confirmar en el Mapa
            </FormLabel>
            <LocationPickerMap
              latitude={form.watch("latitude")}
              longitude={form.watch("longitude")}
              onLocationSelect={handleLocationSelect}
            />
            <p className="text-xs text-muted-foreground px-2 pb-2">
              Arrastra el marcador rojo para afinar la ubicación exacta de la
              entrada.
            </p>
          </div>

          {/* 3. Manual Details (Verification) */}
          <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
            <div className="col-span-2">
              <h3 className="text-sm font-medium mb-4">
                Detalles de la dirección (Editables)
              </h3>
            </div>

            {/* Address */}
            <FormField
              control={form.control as any}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Calle Principal 123 y Secundaria"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control as any}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cuenca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State */}
            <FormField
              control={form.control as any}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia / Estado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Azuay" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zip Code */}
            <FormField
              control={form.control as any}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Postal (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="010101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manual Latitude/Longitude (for users who get coordinates from Google Maps) */}
            <div className="col-span-2 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">
                Coordenadas (Opcional)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Si el mapa no funciona bien, puedes copiar las coordenadas desde Google Maps y pegarlas aquí.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control as any}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitud</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Ej: -2.9001"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitud</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Ej: -79.0059"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
