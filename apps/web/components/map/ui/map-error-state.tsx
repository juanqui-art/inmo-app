/**
 * MapErrorState - Error UI Component
 *
 * Displays error message when MapBox token is missing
 * Pure presentational component with no business logic
 *
 * USAGE:
 * <MapErrorState />
 *
 * RESPONSIBILITY:
 * - Display error UI
 * - Provide instructions to fix
 * - Link to MapBox account
 */

export function MapErrorState() {
	return (
		<div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-oslo-gray-100 dark:bg-oslo-gray-900">
			<div className="text-center max-w-md p-6">
				<h2 className="text-2xl font-bold text-oslo-gray-900 dark:text-oslo-gray-50 mb-2">
					MapBox Token Missing
				</h2>
				<p className="text-oslo-gray-600 dark:text-oslo-gray-400 mb-4">
					Para ver el mapa, necesitas agregar tu token de MapBox a las
					variables de entorno.
				</p>
				<div className="bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-lg p-4 text-left mb-4">
					<p className="text-sm font-mono text-oslo-gray-900 dark:text-oslo-gray-50 mb-2">
						.env.local
					</p>
					<code className="text-xs text-oslo-gray-700 dark:text-oslo-gray-300">
						NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-token-here"
					</code>
				</div>
				<p className="text-sm text-oslo-gray-500 dark:text-oslo-gray-500">
					Obtén tu token gratis en:{" "}
					<a
						href="https://account.mapbox.com/access-tokens/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 dark:text-blue-400 hover:underline"
					>
						account.mapbox.com
					</a>
				</p>
			</div>
		</div>
	);
}
