/**
 * DASHBOARD - CITAS PAGE
 *
 * Panel de citas para agentes
 * Muestra todas las citas pendientes y confirmadas
 * Permite confirmar o cancelar citas
 */

import { requireRole } from "@/lib/auth";
import { AppointmentRepository } from "@repo/database";
import { AppointmentCard } from "@/components/appointments/appointment-card";
import { AppointmentActions } from "@/components/appointments/appointment-actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardCitasPage() {
  // Requerir que sea agente
  const user = await requireRole(["AGENT", "ADMIN"]);

  if (!user) {
    return null; // La función requireRole redirige si no es válido
  }

  // Obtener citas del agente
  const appointmentRepository = new AppointmentRepository();
  const appointments = await appointmentRepository.getAgentAppointments(
    user.id,
  );

  // Separar citas por estado
  const pending = appointments.filter((apt) => apt.status === "PENDING");
  const confirmed = appointments.filter((apt) => apt.status === "CONFIRMED");
  const completed = appointments.filter((apt) => apt.status === "COMPLETED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
          Mis citas
        </h1>
        <p className="text-oslo-gray-600 dark:text-oslo-gray-400 mt-2">
          Gestiona tus citas con clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-oslo-gray-900 rounded-lg p-4 border border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
            Pendientes
          </p>
          <p className="text-2xl font-bold text-oslo-gray-950 dark:text-white">
            {pending.length}
          </p>
        </div>
        <div className="bg-white dark:bg-oslo-gray-900 rounded-lg p-4 border border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
            Confirmadas
          </p>
          <p className="text-2xl font-bold text-oslo-gray-950 dark:text-white">
            {confirmed.length}
          </p>
        </div>
        <div className="bg-white dark:bg-oslo-gray-900 rounded-lg p-4 border border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
            Completadas
          </p>
          <p className="text-2xl font-bold text-oslo-gray-950 dark:text-white">
            {completed.length}
          </p>
        </div>
      </div>

      {/* Pending Appointments */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white mb-4">
            Citas pendientes de confirmación
          </h2>
          <div className="space-y-4">
            {pending.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white dark:bg-oslo-gray-900 rounded-lg border border-amber-200 dark:border-amber-900/30 p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-oslo-gray-950 dark:text-white">
                    {appointment.property.title}
                  </h3>
                  <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                    {appointment.user.name} -{" "}
                    {format(appointment.scheduledAt, "PPpp", { locale: es })}
                  </p>
                  {appointment.notes && (
                    <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mt-2 italic">
                      Notas: {appointment.notes}
                    </p>
                  )}
                </div>
                <AppointmentActions
                  appointmentId={appointment.id}
                  status={appointment.status}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirmed Appointments */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white mb-4">
            Citas confirmadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmed.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Appointments */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white mb-4">
            Citas completadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-12 bg-oslo-gray-50 dark:bg-oslo-gray-900 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-oslo-gray-600 dark:text-oslo-gray-400">
            No tienes citas agendadas aún
          </p>
        </div>
      )}
    </div>
  );
}
