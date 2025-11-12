"use client";

/**
 * Grid City Filter
 *
 * Simple dropdown to filter by city
 * Updates URL parameter directly without Zustand
 * Uses FilterDropdown base component for consistent styling
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { getCitiesAction, type CitySearchResult } from "@/app/actions/properties";
import { Spinner } from "@/components/common";
import { FilterDropdown } from "@/components/map/filters/filter-dropdown";

export function GridCityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<CitySearchResult[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const selectedCity = searchParams.get("city");

  // Load cities when dropdown opens
  useEffect(() => {
    if (isOpen && cities.length === 0) {
      const loadCities = async () => {
        setIsLoadingCities(true);
        try {
          const result = await getCitiesAction();
          if (result.cities) {
            setCities(result.cities);
          }
        } catch (error) {
          console.error("Error loading cities:", error);
        } finally {
          setIsLoadingCities(false);
        }
      };
      void loadCities();
    }
  }, [isOpen, cities.length]);

  const handleSelectCity = useCallback(
    (cityName: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("city", cityName);
      params.delete("page"); // Reset to page 1 when filtering
      router.push(`/propiedades?${params.toString()}`);
      setIsOpen(false);
    },
    [searchParams, router]
  );

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("city");
    params.delete("page");
    router.push(`/propiedades?${params.toString()}`);
    setIsOpen(false);
  }, [searchParams, router]);

  return (
    <FilterDropdown
      label="Ubicación"
      value={selectedCity || undefined}
      icon={<MapPin className="h-4 w-4" />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      isActive={!!selectedCity}
      onClear={handleClear}
    >
      {/* Header with "Listo" button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
        <h3 className="text-sm font-semibold text-oslo-gray-50">
          Seleccionar Ubicación
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900 disabled:bg-oslo-gray-700 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Listo
        </button>
      </div>

      {/* Cities List */}
      {isLoadingCities ? (
        <div className="flex justify-center py-4">
          <Spinner size="6" color="text-oslo-gray-400" />
        </div>
      ) : cities.length > 0 ? (
        <div className="space-y-1">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleSelectCity(city.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                selectedCity === city.name
                  ? "bg-indigo-600 text-white"
                  : "text-oslo-gray-200 hover:bg-oslo-gray-800"
              }`}
            >
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{city.name}</p>
                <p className="text-xs opacity-75">
                  {city.propertyCount} propiedades
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 text-center text-oslo-gray-400 text-sm">
          No hay ciudades disponibles
        </div>
      )}
    </FilterDropdown>
  );
}
