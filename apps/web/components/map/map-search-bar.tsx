/**
 * MapSearchBar - Floating Search Input for Map
 *
 * PATTERN: Functional Search with City Selection
 *
 * PURPOSE:
 * - Search cities in Azuay region
 * - Animate map to selected city
 * - Simple dropdown with predefined cities
 */

"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";

interface MapSearchBarProps {
  onLocationSelect: (longitude: number, latitude: number, zoom: number) => void;
}

// Predefined cities in Azuay with coordinates
const CITIES = [
  { name: "Cuenca", latitude: -2.8995, longitude: -79.0044, zoom: 13 },
  { name: "Gualaceo", latitude: -2.8942, longitude: -78.7808, zoom: 14 },
  { name: "Chordeleg", latitude: -2.9711, longitude: -78.7614, zoom: 14 },
  { name: "Paute", latitude: -2.7761, longitude: -78.7533, zoom: 14 },
] as const;

export function MapSearchBar({ onLocationSelect }: MapSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter cities based on search term
  const filteredCities = CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCitySelect = (city: (typeof CITIES)[number]) => {
    onLocationSelect(city.longitude, city.latitude, city.zoom);
    setSearchTerm(city.name);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-18 left-4 z-20 w-full max-w-md">
      <div className="relative">
        {/* Search Input */}
        <div className="flex items-center gap-3 bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-full px-5 py-3 shadow-lg border border-oslo-gray-200 dark:border-oslo-gray-800">
          <Search className="h-5 w-5 text-oslo-gray-500 dark:text-oslo-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por ciudad..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-oslo-gray-900 dark:text-oslo-gray-50 placeholder:text-oslo-gray-500 dark:placeholder:text-oslo-gray-400"
          />
        </div>

        {/* Dropdown */}
        {isOpen && filteredCities.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white/95 dark:bg-oslo-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-oslo-gray-200 dark:border-oslo-gray-800 overflow-hidden">
            {filteredCities.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCitySelect(city)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-800 transition-colors text-left"
              >
                <MapPin className="h-4 w-4 text-oslo-gray-500 dark:text-oslo-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-oslo-gray-900 dark:text-oslo-gray-50">
                  {city.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
