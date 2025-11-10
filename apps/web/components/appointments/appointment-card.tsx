/**
 * APPOINTMENT CARD - Server Component
 *
 * Muestra información de una cita en formato card
 * Usado en listas del dashboard y perfil de usuario
 */

import {
  formatAppointmentDate,
  getStatusLabel,
} from "@/lib/utils/appointment-helpers";
import { Badge } from "@repo/ui";
import type { AppointmentDetail } from "@repo/database";
import { MapPin, Calendar, User, Phone } from "lucide-react";

interface AppointmentCardProps {
  appointment: AppointmentDetail;
  showAgent?: boolean;
}

export function AppointmentCard({
  appointment,
  showAgent = false,
}: AppointmentCardProps) {
  const { label: statusLabel, color: statusColor } = getStatusLabel(
    appointment.status,
  );

  const colorMap = {
    amber:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    green:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    blue: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  } as const;

  return (
    <div className="bg-white dark:bg-oslo-gray-900 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Property Image */}
      {appointment.property.images[0] && (
        <div className="h-32 bg-oslo-gray-100 dark:bg-oslo-gray-800 overflow-hidden">
          <img
            src={appointment.property.images[0].url}
            alt={
              appointment.property.images[0].alt || appointment.property.title
            }
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Property Info */}
        <div>
          <h3 className="font-semibold text-oslo-gray-950 dark:text-white truncate">
            {appointment.property.title}
          </h3>
          <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {appointment.property.address || "Sin dirección"}
          </p>
        </div>

        {/* Appointment Info */}
        <div className="space-y-2">
          <p className="text-sm flex items-center gap-2 text-oslo-gray-700 dark:text-oslo-gray-300">
            <Calendar className="w-4 h-4" />
            {formatAppointmentDate(appointment.scheduledAt)}
          </p>

          {showAgent && appointment.agent && (
            <p className="text-sm flex items-center gap-2 text-oslo-gray-700 dark:text-oslo-gray-300">
              <User className="w-4 h-4" />
              {appointment.agent.name || "Agente"}
            </p>
          )}

          {appointment.user && !showAgent && (
            <p className="text-sm flex items-center gap-2 text-oslo-gray-700 dark:text-oslo-gray-300">
              <User className="w-4 h-4" />
              {appointment.user.name || "Cliente"}
              {appointment.user.phone && (
                <>
                  <Phone className="w-4 h-4" />
                  {appointment.user.phone}
                </>
              )}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <Badge className={colorMap[statusColor as keyof typeof colorMap]}>
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}
