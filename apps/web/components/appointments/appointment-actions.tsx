"use client";

/**
 * APPOINTMENT ACTIONS - Client Component
 *
 * Botones para confirmar/cancelar citas
 * Solo visible para agentes en sus citas
 */

import { useTransition, useState } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { Button } from "@repo/ui";
import { Check, X } from "lucide-react";

interface AppointmentActionsProps {
  appointmentId: string;
  status: string;
}

export function AppointmentActions({
  appointmentId,
  status,
}: AppointmentActionsProps) {
  const [showConfirm, setShowConfirm] = useState<"confirm" | "cancel" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status !== "PENDING") {
    return (
      <div className="text-sm text-oslo-gray-500">
        No se puede modificar citas en estado {status}
      </div>
    );
  }

  const handleAction = async (action: "CONFIRMED" | "CANCELLED") => {
    setError(null);
    startTransition(async () => {
      const result = await updateAppointmentStatusAction({
        id: appointmentId,
        status: action,
      });

      if (!result.success) {
        setError(result.error || "Failed to update appointment");
      } else {
        setShowConfirm(null);
      }
    });
  };

  return (
    <div className="flex gap-2">
      {showConfirm ? (
        <div className="text-sm space-y-2">
          <p>
            {showConfirm === "confirm" ? "¿Confirmar cita?" : "¿Cancelar cita?"}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                handleAction(
                  showConfirm === "confirm" ? "CONFIRMED" : "CANCELLED",
                )
              }
              disabled={isPending}
              variant={showConfirm === "confirm" ? "default" : "destructive"}
            >
              Sí
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirm(null)}
              disabled={isPending}
            >
              No
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Button
            size="sm"
            onClick={() => setShowConfirm("confirm")}
            disabled={isPending}
          >
            <Check className="w-4 h-4 mr-1" />
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm("cancel")}
            disabled={isPending}
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
