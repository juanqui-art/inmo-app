"use client";

/**
 * AUTH SUCCESS HANDLER
 *
 * Client component que maneja post-auth flow:
 * 1. Detecta si viene de OAuth exitoso
 * 2. Muestra SuccessModal
 * 3. Redirige de vuelta a la página anterior
 * 4. Ejecuta el authIntent (favoritos, etc)
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthIntentExecutor } from "./auth-intent-executor";
import { SuccessModal } from "./success-modal";

export function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Detectar si viene de OAuth exitoso
    const authSuccess = searchParams.get("authSuccess");

    if (authSuccess === "true") {
      setShowSuccess(true);

      // Leer URL de retorno del localStorage (guardada en google-button.tsx)
      const authReturnUrl = localStorage.getItem("authReturnUrl");

      // Leer redirectTo del authIntent (para intents personalizados como guardar favorito)
      const intentStr = localStorage.getItem("authIntent");
      let redirectTo = "/";

      // Prioridad: authIntent.redirectTo > authReturnUrl > home
      if (intentStr) {
        try {
          const intent = JSON.parse(intentStr);
          redirectTo = intent.redirectTo || authReturnUrl || "/";
        } catch (error) {
          console.error("Error parsing authIntent:", error);
          redirectTo = authReturnUrl || "/";
        }
      } else if (authReturnUrl) {
        redirectTo = authReturnUrl;
      }

      // Limpiar localStorage
      localStorage.removeItem("authReturnUrl");
      localStorage.removeItem("authIntent");

      // Redirigir de vuelta a la página anterior después de cerrar el modal
      setTimeout(() => {
        router.push(redirectTo);
      }, 2500); // Tiempo igual al autoCloseDuration del modal
    }
  }, [searchParams, router]);

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
