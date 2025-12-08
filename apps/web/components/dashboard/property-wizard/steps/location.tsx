"use client";

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
    Input
} from "@repo/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const step2Schema = z.object({
  address: z.string().min(5, "La dirección es requerida y debe tener al menos 5 caracteres"),
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ubicación de la Propiedad</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa la dirección y marca la ubicación exacta en el mapa.
        </p>
      </div>

      <Form {...form}>
        <form id="wizard-step-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Address */}
            <FormField
              control={form.control as any}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle Principal 123 y Secundaria" {...field} />
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
          </div>

          {/* Map */}
          <div className="space-y-2">
            <FormLabel>Ubicación en el Mapa</FormLabel>
            <LocationPickerMap
              latitude={form.watch("latitude")}
              longitude={form.watch("longitude")}
              onLocationSelect={handleLocationSelect}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control as any}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Latitud</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" />
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
                    <FormLabel className="text-xs text-muted-foreground">Longitud</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
