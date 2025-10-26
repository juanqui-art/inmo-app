"use client";

/**
 * AUTH INTENT EXECUTOR
 *
 * Client component que ejecuta acciones pendientes guardadas durante login
 *
 * Flujo:
 * 1. Usuario intenta favoritar sin auth → Intent guardado en localStorage
 * 2. Usuario hace login → Redirige a /perfil
 * 3. /perfil renderiza este component (client)
 * 4. Component lee localStorage, ejecuta intent, limpia localStorage
 *
 * No renderiza UI, solo ejecuta side effects
 */

import { useEffect } from "react";
import { toggleFavoriteAction } from "@/app/actions/favorites";
import { toast } from "sonner";

interface AuthIntent {
  action: "favorite";
  propertyId?: string;
}

export function AuthIntentExecutor() {
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
                ? "✅ Propiedad agregada a favoritos"
                : "✅ Propiedad removida de favoritos"
            );
          } else {
            toast.error(result.error || "❌ Error al guardar favorito");
          }
        }

        // Limpiar intent después de ejecutar (éxito o error)
        localStorage.removeItem("authIntent");
      } catch (error) {
        console.error("[AuthIntentExecutor] Error:", error);
        // Limpiar intent incluso si hay error
        localStorage.removeItem("authIntent");
        // No mostrar error al user para no perturbar la experiencia
      }
    };

    executeIntent();
  }, []);

  // No renderiza nada
  return null;
}
