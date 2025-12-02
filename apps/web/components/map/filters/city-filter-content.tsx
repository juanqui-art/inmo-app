"use client";

/**
 * CityFilterContent - City selector for mobile filter sheet
 *
 * Simplified version without dropdown wrapper
 * Used inside MobileFilterSheet
 */

import {
    type CitySearchResult,
    getCitiesAction,
} from "@/app/actions/properties";
import { Spinner } from "@/components/common";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface CityFilterContentProps {
  selected?: string;
  onChange: (city?: string) => void;
}

export function CityFilterContent({
  selected,
  onChange,
}: CityFilterContentProps) {
  const [cities, setCities] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      setIsLoading(true);
      try {
        const result = await getCitiesAction();
        if (result.cities) {
          setCities(result.cities);
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCities();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-oslo-gray-300 uppercase tracking-wide">
        📍 Ubicación
      </label>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner size="6" color="text-oslo-gray-400" />
        </div>
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => onChange(selected === city.name ? undefined : city.name)}
              className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                selected === city.name
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-oslo-gray-900/50 text-oslo-gray-200 border border-oslo-gray-800 hover:bg-oslo-gray-800/70"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium text-sm truncate">{city.name}</span>
              </div>
              <span className="text-xs opacity-75">
                {city.propertyCount} props
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 text-center text-oslo-gray-400 text-sm">
          No hay ciudades disponibles
        </div>
      )}
    </div>
  );
}
