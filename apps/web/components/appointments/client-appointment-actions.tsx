"use client";

/**
 * CLIENT APPOINTMENT ACTIONS - Client Component
 *
 * Botón de cancelación para clientes
 * Permite a los usuarios cancelar sus propias citas pendientes
 */

import { Button } from "@repo/ui";
import { X } from "lucide-react";
import { useState, useTransition } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";

interface ClientAppointmentActionsProps {
  appointmentId: string;
  status: string;
}

export function ClientAppointmentActions({
  appointmentId,
  status,
}: ClientAppointmentActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Solo mostrar botón para citas pendientes
  if (status !== "PENDING") {
    return null;
  }

  const handleCancel = async () => {
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        id: appointmentId,
        status: "CANCELLED",
      });

      if (!result.success) {
        setError(result.error || "Error al cancelar la cita");
      } else {
        setShowConfirm(false);
      }
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-oslo-gray-200 dark:border-oslo-gray-700">
      {showConfirm ? (
        <div className="space-y-2">
          <p className="text-sm text-oslo-gray-700 dark:text-oslo-gray-300">
            ¿Estás seguro de que deseas cancelar esta cita?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
            >
              {isPending ? "Cancelando..." : "Sí, cancelar"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
            >
              No
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
        >
          <X className="w-4 h-4 mr-1" />
          Cancelar cita
        </Button>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
