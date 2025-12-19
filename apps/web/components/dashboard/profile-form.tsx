"use client";

import { updateProfileAction } from "@/app/actions/profile";
import { Button, Input, Label, Separator, Textarea } from "@repo/ui";
import { FileText, Globe, Loader2, Palette, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileFormProps {
  initialName: string | null;
  initialPhone: string | null;
  initialBio: string | null;
  initialLicenseId: string | null;
  initialWebsite: string | null;
  initialBrandColor: string | null;
  initialLogoUrl: string | null;
}

export function ProfileForm({ 
  initialName, 
  initialPhone,
  initialBio,
  initialLicenseId,
  initialWebsite,
  initialBrandColor,
  initialLogoUrl,
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [color, setColor] = useState(initialBrandColor || "#4F46E5");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      
      {/* Sección Personal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-medium text-oslo-gray-950 dark:text-white">
           <User className="h-5 w-5 text-primary" />
           <h3>Información Personal</h3>
        </div>
        <Separator className="bg-oslo-gray-200 dark:bg-oslo-gray-800" />
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialName || ""}
              placeholder="Tu nombre"
              required
              className="bg-white dark:bg-oslo-gray-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={initialPhone || ""}
              placeholder="+593 99 999 9999"
              className="bg-white dark:bg-oslo-gray-950"
            />
          </div>
        </div>

        <div className="space-y-2">
           <Label htmlFor="bio">Biografía Profesional</Label>
           <Textarea 
              id="bio" 
              name="bio" 
              defaultValue={initialBio || ""} 
              placeholder="Cuéntale a tus clientes sobre tu experiencia y especialidades..."
              className="h-24 resize-none bg-white dark:bg-oslo-gray-950"
           />
           <p className="text-xs text-muted-foreground">Una descripción breve aparece en tu perfil público.</p>
        </div>
      </div>

      {/* Sección Profesional */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-medium text-oslo-gray-950 dark:text-white mt-8">
           <FileText className="h-5 w-5 text-primary" />
           <h3>Credenciales</h3>
        </div>
        <Separator className="bg-oslo-gray-200 dark:bg-oslo-gray-800" />

        <div className="grid md:grid-cols-2 gap-6">
           <div className="space-y-2">
            <Label htmlFor="licenseId">No. Licencia (Opcional)</Label>
            <Input
              id="licenseId"
              name="licenseId"
              defaultValue={initialLicenseId || ""}
              placeholder="Ej. #12345-ACB"
              className="bg-white dark:bg-oslo-gray-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <div className="relative">
               <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <Input
                 id="website"
                 name="website"
                 defaultValue={initialWebsite || ""}
                 placeholder="https://tuzona.com"
                 className="pl-9 bg-white dark:bg-oslo-gray-950"
               />
            </div>
          </div>
        </div>
      </div>

      {/* Sección Branding (Solo Agente) */}
      <div className="space-y-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 p-6">
        <div className="flex items-center gap-2 text-lg font-medium text-indigo-900 dark:text-indigo-100">
           <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
           <h3>Personalización de Marca</h3>
           <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
              Plan Agente
           </span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 pt-2">
           {/* Color Picker */}
           <div className="space-y-3">
              <Label htmlFor="brandColor">Color de Marca</Label>
              <div className="flex items-center gap-4">
                 <div 
                    className="h-10 w-10 rounded-full border shadow-sm transition-colors"
                    style={{ backgroundColor: color }}
                 />
                 <Input 
                   type="color" 
                   id="brandColor" 
                   name="brandColor"
                   value={color}
                   onChange={(e) => setColor(e.target.value)}
                   className="w-24 h-10 p-1 cursor-pointer"
                 />
                 <Input 
                    type="text" 
                    value={color.toUpperCase()} 
                    onChange={(e) => setColor(e.target.value)}
                    className="w-28 font-mono uppercase"
                    maxLength={7}
                 />
              </div>
              <p className="text-xs text-muted-foreground">Este color se usará en botones y detalles de tu perfil.</p>
           </div>

           {/* Logo Upload (Placeholder logic for now) */}
           <div className="space-y-3">
              <Label htmlFor="logoUrl">Logo Personal</Label>
              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-white dark:bg-oslo-gray-950">
                    {initialLogoUrl ? (
                       <img src={initialLogoUrl} alt="Logo" className="max-h-full max-w-full p-1" />
                    ) : (
                       <span className="text-xs text-muted-foreground">Sin logo</span>
                    )}
                 </div>
                 <div className="space-y-2">
                    <Input 
                       id="logoUrl" 
                       name="logoUrl" 
                       placeholder="URL de tu logo (https://...)" 
                       defaultValue={initialLogoUrl || ""}
                       className="text-sm"
                    />
                    {/* TODO: Implement real file upload */}
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Perfil
        </Button>
      </div>
    </form>
  );
}
