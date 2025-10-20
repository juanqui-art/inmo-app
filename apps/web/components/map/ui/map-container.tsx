/**
 * MapContainer - MapBox GL Wrapper Component
 *
 * Handles rendering of the MapBox GL map with:
 * - Map configuration and controls
 * - Property markers
 * - Navigation controls
 * - Scale control
 * - Property list drawer
 *
 * USAGE:
 * <MapContainer
 *   viewState={viewState}
 *   onMove={handleMove}
 *   mapStyle={mapStyle}
 *   mapboxToken={mapboxToken}
 *   properties={properties}
 * />
 *
 * RESPONSIBILITY:
 * - Render MapBox GL component
 * - Render map controls (navigation, scale)
 * - Render property markers
 * - Render property list drawer
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Map, {
	NavigationControl,
	ScaleControl,
	type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import { DEFAULT_MAP_CONFIG } from "@/lib/types/map";
import { PropertyMarker } from "../property-marker";
import { PropertyListDrawer } from "../property-list-drawer";
import { PropertyPopup } from "../property-popup";
import type { MapProperty } from "../map-view";

// Import MapBox GL CSS
import "mapbox-gl/dist/mapbox-gl.css";

interface ViewState {
	longitude: number;
	latitude: number;
	zoom: number;
	pitch: number;
	bearing: number;
	transitionDuration: number;
}

interface MapContainerProps {
	/** Current viewport state */
	viewState: ViewState;
	/** Handler for map movement */
	onMove: (evt: ViewStateChangeEvent) => void;
	/** MapBox style URL (light/dark) */
	mapStyle: string;
	/** MapBox access token */
	mapboxToken: string;
	/** Properties to display as markers */
	properties: MapProperty[];
}

export function MapContainer({
	viewState,
	onMove,
	mapStyle,
	mapboxToken,
	properties,
}: MapContainerProps) {
	const router = useRouter();

	// State for highlighted property (on hover)
	const [highlightedPropertyId, setHighlightedPropertyId] = useState<
		string | null
	>(null);

	// State for selected property popup
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
		null
	);

	// Get selected property for popup
	const selectedProperty = selectedPropertyId
		? properties.find((p) => p.id === selectedPropertyId)
		: null;

	// Handle marker click - show popup
	const handleMarkerClick = (property: MapProperty) => {
		setSelectedPropertyId(property.id);
	};

	// Handle drawer property click - navigate to details
	const handleDrawerPropertyClick = (propertyId: string) => {
		router.push(`/propiedades/${propertyId}`);
	};

	return (
		<div className="relative w-full h-screen">
			{/* Search Bar - Floating Top Left */}
			{/*<MapSearchBar onLocationSelect={flyToLocation} />*/}

			{/* Filters - Floating Top Right */}
			{/*<MapFilters />*/}

			<Map
				{...viewState}
				onMove={onMove}
				mapStyle={mapStyle}
				mapboxAccessToken={mapboxToken}
				style={{ width: "100%", height: "100%" }}
				minZoom={DEFAULT_MAP_CONFIG.MIN_ZOOM}
				maxZoom={DEFAULT_MAP_CONFIG.MAX_ZOOM}
				attributionControl={false}
				reuseMaps
			>
				{/* Navigation Controls (Zoom +/-) */}
				{/*<NavigationControl*/}
				{/*	position="bottom-right"*/}
				{/*	showCompass={true}*/}
				{/*	showZoom={true}*/}
				{/*	visualizePitch={true}*/}
				{/*/>*/}

				{/* Scale Control (Distance) */}
				{/*<ScaleControl position="bottom-left" unit="metric" />*/}

				{/* Property Markers */}
				{properties.map((property) => {
					// Skip properties without coordinates
					if (!property.latitude || !property.longitude) return null;

					return (
						<PropertyMarker
							key={property.id}
							latitude={property.latitude}
							longitude={property.longitude}
							price={property.price}
							transactionType={property.transactionType}
							isHighlighted={highlightedPropertyId === property.id}
							onClick={() => handleMarkerClick(property)}
						/>
					);
				})}

				{/* Property Popup on Marker Click */}
				{selectedProperty && selectedProperty.latitude && selectedProperty.longitude && (
					<PropertyPopup
						property={selectedProperty}
						onClose={() => setSelectedPropertyId(null)}
						onViewDetails={() => {
							setSelectedPropertyId(null);
							handleDrawerPropertyClick(selectedProperty.id);
						}}
					/>
				)}
			</Map>

			{/* Property List Drawer */}
			<PropertyListDrawer
				properties={properties}
				onPropertyHover={setHighlightedPropertyId}
				onPropertyClick={handleDrawerPropertyClick}
			/>

			{/* Properties Count Badge */}
			{/*<div className="absolute top-20 left-4 z-10 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800">*/}
			{/*  <p className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-50">*/}
			{/*    {properties.length} propiedades disponibles*/}
			{/*  </p>*/}
			{/*</div>*/}

			{/* Attribution (moved to bottom-right) */}
			{/*<div className="absolute bottom-0 right-0 z-10 bg-white/90 dark:bg-oslo-gray-900/90 px-2 py-1 text-[10px] text-oslo-gray-600 dark:text-oslo-gray-400">*/}
			{/*  © MapBox © OpenStreetMap*/}
			{/*</div>*/}
		</div>
	);
}
