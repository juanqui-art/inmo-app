/**
 * DASHBOARD - CITAS PAGE
 *
 * DISABLED: Appointments functionality temporarily disabled to fix Turbopack SSR build issue
 * Related to: Radix UI createContext error during build
 * To re-enable: Restore the original implementation
 *
 * Panel de citas para agentes
 * Muestra todas las citas pendientes y confirmadas
 * Permite confirmar o cancelar citas
 */

export default function DashboardCitasPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Funcionalidad de citas</h1>
      <p className="text-oslo-gray-600 dark:text-oslo-gray-400">
        Funcionalidad de citas temporalmente deshabilitada
      </p>
    </div>
  );
}
