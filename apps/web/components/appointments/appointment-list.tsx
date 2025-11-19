/**
 * APPOINTMENT LIST - Server Component
 *
 * Muestra lista de citas con filtros opcionales
 * Reutilizable para dashboard de agentes y perfil de usuarios
 */

import type { AppointmentDetail } from "@repo/database";
import type { ReactNode } from "react";
import { AppointmentCard } from "./appointment-card";

interface AppointmentListProps {
  appointments: AppointmentDetail[];
  variant?: "agent" | "user";
  emptyMessage?: string;
  renderActions?: (appointment: AppointmentDetail) => ReactNode;
}

export function AppointmentList({
  appointments,
  variant = "agent",
  emptyMessage,
  renderActions,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-oslo-gray-600 dark:text-oslo-gray-400">
          {emptyMessage ||
            (variant === "agent"
              ? "No tienes citas agendadas"
              : "No tienes citas")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          showAgent={variant === "user"}
        >
          {renderActions?.(appointment)}
        </AppointmentCard>
      ))}
    </div>
  );
}
