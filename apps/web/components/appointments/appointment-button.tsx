"use client";

/**
 * APPOINTMENT BUTTON COMPONENT
 *
 * Botón para abrir el diálogo de agendar cita
 * - Verifica autenticación (redirige a login si no está autenticado)
 * - Abre el diálogo de formulario de cita
 * - Se integra en la página de detalles de propiedad
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@repo/ui";
import { AppointmentDialog } from "./appointment-dialog";
import { getCurrentUser } from "@/lib/auth";

interface AppointmentButtonProps {
  propertyId: string;
  isAuthenticated?: boolean;
}

export function AppointmentButton({
  propertyId,
  isAuthenticated = false,
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
      <Button
        onClick={handleClick}
        variant="default"
        className="w-full flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {isAuthenticated ? "Agendar una visita" : "Agendar (Inicia sesión)"}
      </Button>

      <AppointmentDialog
        propertyId={propertyId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
