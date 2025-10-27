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

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SuccessModal } from "./success-modal";
import { AuthIntentExecutor } from "./auth-intent-executor";

export function AuthSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Detectar si viene de OAuth exitoso
    const authSuccess = searchParams.get("authSuccess");

    if (authSuccess === "true") {
      setShowSuccess(true);

      // Leer redirectTo del localStorage
      const intentStr = localStorage.getItem("authIntent");
      if (intentStr) {
        try {
          const intent = JSON.parse(intentStr);
          const redirectTo = intent.redirectTo || "/";

          // Redirigir de vuelta a la página anterior después de cerrar el modal
          setTimeout(() => {
            router.push(redirectTo);
          }, 2500); // Tiempo igual al autoCloseDuration del modal
        } catch (error) {
          console.error("Error parsing authIntent:", error);
        }
      }
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
