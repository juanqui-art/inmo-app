"use client";

import { AIDescriptionButton } from "@/components/property-wizard/ai-description-button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from "@repo/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const step1Schema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.coerce.number().min(1, "El precio es requerido"),
  transactionType: z.enum(["SALE", "RENT"]),
  category: z.string().min(1, "Selecciona una categoría"),
});

type Step1Values = z.infer<typeof step1Schema>;

export function Step1() {
  const { formData, updateFormData, setStep, limits } = usePropertyWizardStore();
  
  // Check if tier allows AI description (AGENT or PRO)
  const canUseAI = limits.tierName === "Agente" || limits.tierName === "Pro";

  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      transactionType: formData.transactionType,
      category: formData.category,
    },
  });

  // Update form values if store changes (e.g. from draft)
  useEffect(() => {
    form.reset({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      transactionType: formData.transactionType,
      category: formData.category,
    });
  }, [formData, form]);

  const onSubmit = (values: Step1Values) => {
    updateFormData(values);
    setStep(2);
  };

  return (
    <Form {...form}>
      <form id="wizard-step-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Title */}
          <FormField
            control={form.control as any}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Título de la Propiedad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Casa moderna en el centro" {...field} />
                </FormControl>
                <div className="flex justify-between items-center text-xs">
                  <FormMessage />
                  {!form.formState.errors.title && <span className="text-muted-foreground">Mínimo 5 caracteres</span>}
                </div>
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control as any}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Transaction Type */}
          <FormField
            control={form.control as any}
            name="transactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Transacción</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SALE">Venta</SelectItem>
                    <SelectItem value="RENT">Alquiler</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control as any}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control as any}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Descripción</FormLabel>
                  <AIDescriptionButton
                    onDescriptionGenerated={(description: string) => {
                      field.onChange(description);
                    }}
                    canUse={canUseAI}
                  />
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe los detalles de la propiedad o usa IA para generarla..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center text-xs">
                  <FormMessage />
                  <span className={field.value?.length >= 10 ? "text-green-500" : "text-muted-foreground"}>
                    {field.value?.length || 0} / 10 caracteres
                  </span>
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
