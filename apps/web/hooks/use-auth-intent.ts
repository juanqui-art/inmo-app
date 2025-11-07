"use client";

/**
 * USE AUTH INTENT HOOK
 *
 * Ejecuta acciones pendientes guardadas antes del login
 *
 * Flujo:
 * 1. Usuario intenta favoritar sin auth
 * 2. AuthModal guarda intent en localStorage
 * 3. Usuario hace login
 * 4. Callback redirige a /perfil
 * 5. /perfil llama este hook
 * 6. Hook ejecuta el intent (ej: guardar favorito)
 * 7. Hook limpia localStorage
 */

import { useEffect } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { toast } from "sonner";

interface AuthIntent {
  action: "favorite";
  propertyId?: string;
}

export function useAuthIntent() {
  useEffect(() => {
    const executeIntent = async () => {
      try {
        // Leer intent de localStorage
        const intentStr = localStorage.getItem("authIntent");
        if (!intentStr) return;

        const intent: AuthIntent = JSON.parse(intentStr);

        // Ejecutar según el tipo de intent
        if (intent.action === "favorite" && intent.propertyId) {
          // Guardar favorito
          const result = await toggleFavoriteAction(intent.propertyId);

          if (result.success) {
            toast.success(
              result.isFavorite
                ? "Propiedad agregada a favoritos"
                : "Propiedad removida de favoritos",
            );
          } else {
            toast.error(result.error || "Error al guardar favorito");
          }
        }

        // Limpiar intent después de ejecutar
        localStorage.removeItem("authIntent");
      } catch (error) {
        console.error("[useAuthIntent] Error:", error);
        // No mostrar error al user, solo en consola
      }
    };

    executeIntent();
  }, []);
}
