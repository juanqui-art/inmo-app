/**
 * PropertyCardCompact - Compact Property Card for Map List
 *
 * Horizontal card layout optimized for carousel view
 * Displays essential property info without images
 *
 * FEATURES:
 * - Compact horizontal layout
 * - Transaction type badge (SALE/RENT)
 * - Essential specs (bed, bath, area)
 * - Hover effects
 * - Click to view details
 *
 * USAGE:
 * <PropertyCardCompact
 *   property={property}
 *   onHover={() => highlightMarker(property.id)}
 *   onClick={() => viewDetails(property.id)}
 * />
 */

"use client";

import { Bed, Bath, Maximize2, MapPin } from "lucide-react";
import type { MapProperty } from "./map-view";

interface PropertyCardCompactProps {
	property: MapProperty;
	onHover?: () => void;
	onLeave?: () => void;
	onClick?: () => void;
}

export function PropertyCardCompact({
	property,
	onHover,
	onLeave,
	onClick,
}: PropertyCardCompactProps) {
	// Format price with currency
	const formattedPrice = new Intl.NumberFormat("es-EC", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(property.price);

	// Get transaction type badge color
	const badgeColor =
		property.transactionType === "SALE"
			? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
			: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

	const badgeLabel =
		property.transactionType === "SALE" ? "Venta" : "Arriendo";

	return (
		<div
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
			onClick={onClick}
			className="flex-shrink-0 w-[280px] h-full bg-white dark:bg-oslo-gray-900 border border-oslo-gray-300 dark:border-oslo-gray-700 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-black/20 hover:border-oslo-gray-400 dark:hover:border-oslo-gray-600 hover:-translate-y-0.5"
		>
			{/* Header: Price + Badge */}
			<div className="flex items-start justify-between mb-2">
				<div>
					<p className="text-lg font-bold text-oslo-gray-900 dark:text-oslo-gray-50">
						{formattedPrice}
					</p>
					<span
						className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md border ${badgeColor}`}
					>
						{badgeLabel}
					</span>
				</div>
			</div>

			{/* Title */}
			<h3 className="text-sm font-semibold text-oslo-gray-800 dark:text-oslo-gray-50 mb-2 line-clamp-2">
				{property.title}
			</h3>

			{/* Location */}
			<div className="flex items-center gap-1 text-xs text-oslo-gray-600 dark:text-oslo-gray-300 mb-3">
				<MapPin className="w-3 h-3" />
				<span className="truncate">
					{property.latitude?.toFixed(4)}, {property.longitude?.toFixed(4)}
				</span>
			</div>

			{/* Specs */}
			<div className="flex items-center gap-4 text-xs text-oslo-gray-600 dark:text-oslo-gray-300">
				<div className="flex items-center gap-1">
					<Bed className="w-4 h-4" />
					<span>3</span>
				</div>
				<div className="flex items-center gap-1">
					<Bath className="w-4 h-4" />
					<span>2</span>
				</div>
				<div className="flex items-center gap-1">
					<Maximize2 className="w-4 h-4" />
					<span>180 m²</span>
				</div>
			</div>
		</div>
	);
}
