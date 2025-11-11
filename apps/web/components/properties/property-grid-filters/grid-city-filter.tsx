"use client";

/**
 * Grid City Filter
 *
 * Simple dropdown to filter by city
 * Updates URL parameter directly without Zustand
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, ChevronDown } from "lucide-react";
import { getCitiesAction, type CitySearchResult } from "@/app/actions/properties";
import { Spinner } from "@/components/common";

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-oslo-gray-800 border border-oslo-gray-700 text-oslo-gray-200 hover:text-oslo-gray-50 transition-colors text-sm"
      >
        <MapPin className="w-4 h-4" />
        <span>{selectedCity || "Ubicación"}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-oslo-gray-900 border border-oslo-gray-700 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
            <h3 className="text-sm font-semibold text-oslo-gray-50">
              Seleccionar Ubicación
            </h3>
          </div>

          {/* Cities List */}
          <div className="max-h-64 overflow-y-auto px-2 py-2">
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
          </div>

          {/* Footer */}
          {!isLoadingCities && cities.length > 0 && selectedCity && (
            <div className="px-4 py-3 border-t border-oslo-gray-800">
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-4 py-2 rounded-lg border border-oslo-gray-700 text-oslo-gray-300 font-semibold text-sm hover:bg-oslo-gray-800 transition-colors"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
