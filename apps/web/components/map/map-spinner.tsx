/**
 * MapSpinner - Loading Indicator for Map
 *
 * Displays a centered spinner overlay while the map is loading.
 */

export function MapSpinner() {
  return (
    <div className="absolute inset-0 bg-oslo-gray-100/50 dark:bg-oslo-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm">
      <div
        className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-indigo-500 border-t-transparent"
        role="status"
        aria-label="Cargando mapa..."
      />
    </div>
  );
}
