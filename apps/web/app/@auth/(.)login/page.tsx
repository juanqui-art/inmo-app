"use client";

/**
 * LOGIN MODAL - Intercepted Route
 *
 * Este archivo se muestra cuando el usuario navega a /login
 * via client-side navigation (soft navigation).
 *
 * Si el usuario accede directamente a /login o refresca,
 * se mostrará la página completa en (auth)/login/page.tsx
 *
 * IMPORTANTE: El Dialog Portal está explícitamente vinculado al body
 * para asegurar que se renderiza en el nivel más alto del DOM,
 * evitando que sea ocultado por stacking contexts de componentes padres.
 */

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { useRouter } from "next/navigation";
import { LoginFormStyled } from "@/components/auth/login-form-styled";

export default function LoginModal() {
  const router = useRouter();

  // Cerrar modal = volver a la página anterior
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal
        container={typeof document !== "undefined" ? document.body : undefined}
      >
        <DialogContent className="w-full max-w-md p-0 overflow-hidden sm:rounded-lg">
          {/* Header del modal */}
          <div className="px-6 pt-6 pb-0">
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              Bienvenido
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              Inicia sesión para acceder a tu cuenta
            </DialogDescription>
          </div>

          {/* Formulario de login */}
          <div className="px-6 py-6">
            <LoginFormStyled />
          </div>
        </DialogContent>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
