/**
 * MapLoadingState - Loading UI Component
 *
 * Displays loading message during hydration
 * Prevents theme flash and hydration mismatches
 * Pure presentational component with no business logic
 *
 * USAGE:
 * <MapLoadingState />
 *
 * RESPONSIBILITY:
 * - Display loading UI
 * - Prevent FOUC (Flash of Unstyled Content)
 */

export function MapLoadingState() {
	return (
		<div className="w-full h-screen flex items-center justify-center bg-oslo-gray-100 dark:bg-oslo-gray-900">
			<div className="text-oslo-gray-600 dark:text-oslo-gray-400">
				Cargando mapa...
			</div>
		</div>
	);
}
