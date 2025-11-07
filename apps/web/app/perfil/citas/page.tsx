/**
 * PERFIL - CITAS PAGE
 *
 * Mis citas para usuarios
 * Muestra todas las citas del usuario actual
 * Permite cancelar citas pendientes
 */

import { requireRole } from "@/lib/auth";
import { AppointmentRepository } from "@repo/database";
import { AppointmentList } from "@/components/appointments/appointment-list";

export default async function PerfilCitasPage() {
  // Requerir que esté autenticado
  const user = await requireRole(["CLIENT", "AGENT", "ADMIN"]);

  if (!user) {
    return null; // La función requireRole redirige si no es válido
  }

  // Obtener citas del usuario
  const appointmentRepository = new AppointmentRepository();
  const appointments = await appointmentRepository.getUserAppointments(user.id);

  // Separar por estado
  const pending = appointments.filter((apt) => apt.status === "PENDING");
  const confirmed = appointments.filter((apt) => apt.status === "CONFIRMED");
  const past = appointments.filter(
    (apt) =>
      (apt.status === "COMPLETED" || apt.status === "CANCELLED") &&
      apt.scheduledAt < new Date(),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
          Mis citas
        </h1>
        <p className="text-oslo-gray-600 dark:text-oslo-gray-400 mt-2">
          Visualiza y gestiona tus citas de visualización
        </p>
      </div>

      {/* Pending Section */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white mb-4">
            Citas pendientes de confirmación ({pending.length})
          </h2>
          <AppointmentList
            appointments={pending}
            variant="user"
            emptyMessage="No tienes citas pendientes"
          />
        </section>
      )}

      {/* Confirmed Section */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white mb-4">
            Citas confirmadas ({confirmed.length})
          </h2>
          <AppointmentList
            appointments={confirmed}
            variant="user"
            emptyMessage="No tienes citas confirmadas"
          />
        </section>
      )}

      {/* Past Section */}
      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white mb-4">
            Historial de citas ({past.length})
          </h2>
          <AppointmentList
            appointments={past}
            variant="user"
            emptyMessage="No tienes historial de citas"
          />
        </section>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-12 bg-oslo-gray-50 dark:bg-oslo-gray-900 rounded-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-oslo-gray-600 dark:text-oslo-gray-400 mb-4">
            No tienes citas agendadas
          </p>
          <a
            href="/mapa"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explorar propiedades
          </a>
        </div>
      )}
    </div>
  );
}
