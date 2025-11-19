"use client";

/**
 * SIGNUP MODAL - Intercepted Route
 *
 * Este archivo se muestra cuando el usuario navega a /signup
 * via client-side navigation (soft navigation).
 *
 * Si el usuario accede directamente a /signup o refresca,
 * se mostrará la página completa en (auth)/signup/page.tsx
 *
 * IMPORTANTE: El Dialog Portal está explícitamente vinculado al body
 * para asegurar que se renderiza en el nivel más alto del DOM,
 * evitando que sea ocultado por stacking contexts de componentes padres.
 */

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@repo/ui";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupModal() {
  const router = useRouter();

  // Cerrar modal = volver a la página anterior
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal container={typeof document !== "undefined" ? document.body : undefined}>
        <DialogContent className="w-full max-w-md p-0 overflow-hidden sm:rounded-lg">
        {/* Header del modal */}
        <div className="px-6 pt-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Crear cuenta
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Únete a InmoApp y encuentra tu propiedad ideal
          </DialogDescription>
        </div>

        {/* Formulario de signup */}
        <div className="px-6 py-6">
          <SignupForm />
        </div>
        </DialogContent>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
