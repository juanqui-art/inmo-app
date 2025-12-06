"use client";

import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Checkbox,
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

const step3Schema = z.object({
  bedrooms: z.number().min(0, "Debe ser mayor o igual a 0"),
  bathrooms: z.number().min(0, "Debe ser mayor o igual a 0"),
  area: z.number().min(1, "El área debe ser mayor a 0"),
  amenities: z.array(z.string()).default([]),
});

type Step3Values = z.infer<typeof step3Schema>;

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

export function Step3() {
  const { formData, updateFormData, nextStep } = usePropertyWizardStore();

  const form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema) as any,
    defaultValues: {
      bedrooms: formData.bedrooms || 0,
      bathrooms: formData.bathrooms || 0,
      area: formData.area || 0,
      amenities: formData.amenities || [],
    },
  });

  useEffect(() => {
    form.reset({
      bedrooms: formData.bedrooms || 0,
      bathrooms: formData.bathrooms || 0,
      area: formData.area || 0,
      amenities: formData.amenities || [],
    });
  }, [formData, form]);

  const onSubmit = (values: Step3Values) => {
    updateFormData(values);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Características y Amenidades</h2>
        <p className="text-sm text-muted-foreground">
          Detalla las características principales y selecciona las comodidades que ofrece.
        </p>
      </div>

      <Form {...form}>
        <form id="wizard-step-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Bedrooms */}
            <FormField
              control={form.control as any}
              name="bedrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habitaciones</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bathrooms */}
            <FormField
              control={form.control as any}
              name="bathrooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baños</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Area */}
            <FormField
              control={form.control as any}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área (m²)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormLabel className="text-base">Amenidades</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES_LIST.map((amenity) => (
                <FormField
                  key={amenity.id}
                  control={form.control as any}
                  name="amenities"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={amenity.id}
                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(amenity.id)}
                            onCheckedChange={(checked: boolean | string) => {
                              return checked
                                ? field.onChange([...field.value, amenity.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value: string) => value !== amenity.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer w-full">
                          {amenity.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </div>
        </form>
      </Form>
    </div>
  );
}
