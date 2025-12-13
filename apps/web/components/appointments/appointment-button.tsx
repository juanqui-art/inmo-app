"use client";

/**
 * APPOINTMENT BUTTON COMPONENT
 *
 * Botón para abrir el diálogo de agendar cita
 * - Verifica autenticación (redirige a login si no está autenticado)
 * - Abre el diálogo de formulario de cita
 * - Se integra en la página de detalles de propiedad
 */

import { cn } from "@repo/ui";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppointmentDialog } from "./appointment-dialog";

interface AppointmentButtonProps {
  propertyId: string;
  isAuthenticated?: boolean;
  compact?: boolean; // Para usar en modales con espacio limitado
}

export function AppointmentButton({
  propertyId,
  isAuthenticated = false,
  compact = false,
}: AppointmentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!isAuthenticated) {
      // Redirigir a login con intent de agendar cita
      router.push(`/login?intent=appointment&propertyId=${propertyId}`);
      return;
    }

    setIsDialogOpen(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={
          isAuthenticated
            ? "Abrir formulario para agendar una visita"
            : "Iniciar sesión para agendar una visita"
        }
        aria-haspopup="dialog"
        aria-expanded={isDialogOpen}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 h-12 text-base font-semibold rounded-lg transition-all duration-300 motion-safe:active:scale-[0.98]",
          compact ? "text-xs sm:text-sm h-11 sm:h-10 gap-1" : "", // h-11 = 44px (mobile-safe)
          // Use indigo color scheme to match the email button in PropertyFloatingActionCard
          "bg-indigo-600 hover:bg-indigo-700 text-white"
        )}
      >
        <Calendar className={compact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-5 h-5"} aria-hidden="true" />
        {compact ? (
          <>
            <span className="hidden sm:inline">{isAuthenticated ? "Agendar" : "Inicia sesión"}</span>
            <span className="sm:hidden">
              <Calendar className="w-4 h-4" />
            </span>
          </>
        ) : (
          <span>{isAuthenticated ? "Agendar una visita" : "Agendar (Inicia sesión)"}</span>
        )}
      </button>

      <AppointmentDialog
        propertyId={propertyId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
