"use client";

import { updateProfileAction } from "@/app/actions/profile";
import { Button, Input, Label } from "@repo/ui";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileFormProps {
  initialName: string | null;
  initialPhone: string | null;
}

export function ProfileForm({ initialName, initialPhone }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialName || ""}
          placeholder="Tu nombre"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={initialPhone || ""}
          placeholder="+593 99 999 9999"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar Cambios
      </Button>
    </form>
  );
}
