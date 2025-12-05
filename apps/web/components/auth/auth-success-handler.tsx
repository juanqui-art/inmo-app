"use client";

/**
 * AUTH SUCCESS HANDLER
 *
 * Muestra modal de éxito después de autenticación OAuth.
 * El callback ya maneja la redirección, este componente solo:
 * 1. Detecta ?authSuccess=true en la URL
 * 2. Muestra el SuccessModal
 * 3. Ejecuta authIntent si existe (para favoritos, etc.)
 * 4. Limpia el parámetro de la URL
 *
 * NOTA: La redirección ya fue manejada por /auth/callback
 * Este componente solo muestra feedback visual.
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthIntentExecutor } from "./auth-intent-executor";
import { SuccessModal } from "./success-modal";

export function AuthSuccessHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const authSuccess = searchParams.get("authSuccess");

    if (authSuccess === "true") {
      setShowSuccess(true);

      // Limpiar el parámetro authSuccess de la URL (sin recargar)
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("authSuccess");
      const newUrl = newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname;

      // Reemplazar la URL sin el parámetro (para que no se muestre en el historial)
      window.history.replaceState({}, "", newUrl);

      // Auto-cerrar el modal después de un tiempo
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname, router]);

  if (!showSuccess) {
    return null;
  }

  return (
    <>
      <AuthIntentExecutor />
      <SuccessModal
        open={showSuccess}
        onOpenChange={setShowSuccess}
        autoCloseDuration={2500}
      />
    </>
  );
}
