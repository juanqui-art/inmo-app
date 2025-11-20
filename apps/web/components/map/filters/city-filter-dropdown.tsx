/**
 * City Filter Dropdown (Map FilterBar) - SIMPLIFIED VERSION
 *
 * Simple dropdown list of available cities
 * - No autocomplete/search
 * - Loads all cities on first open
 * - Follows Zustand draft/committed filter pattern
 * - Auto-closes when filtering completes
 */

"use client";

import { MapPin } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type CitySearchResult,
  getCitiesAction,
} from "@/app/actions/properties";
import { Spinner } from "@/components/common";
import { useMapStore } from "@/stores/map-store";
import { FilterDropdown } from "./filter-dropdown";

export function CityFilterDropdown() {
  // =========================================================================
  // STORE SELECTORS
  // =========================================================================
  const committedCity = useMapStore((state) => state.filters.city);
  const draftCity = useMapStore((state) => state.draftFilters.city);
  const isLoading = useMapStore((state) => state.isLoading);
  const setIsLoading = useMapStore((state) => state.setIsLoading);
  const setDraftFilter = useMapStore((state) => state.setDraftFilter);
  const commitDraftFilters = useMapStore((state) => state.commitDraftFilters);
  const clearDraftFilters = useMapStore((state) => state.clearDraftFilters);
  const updateFilter = useMapStore((state) => state.updateFilter);

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<CitySearchResult[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const wasLoadingRef = useRef(false);

  // =========================================================================
  // EFFECTS
  // =========================================================================

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

  // Close dropdown automatically when filtering finishes
  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      setIsOpen(false);
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const selectedCity = draftCity ?? committedCity;

  const displayValue = selectedCity ? selectedCity : "Ubicación";

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Prevent closing while loading
      if (isLoading && !open) return;

      setIsOpen(open);
      if (open) {
        clearDraftFilters();
      }
    },
    [isLoading, clearDraftFilters],
  );

  const handleCitySelect = useCallback(
    (cityName: string) => {
      // Only update draft - don't commit yet
      setDraftFilter("city", cityName);
    },
    [setDraftFilter],
  );

  const handleClear = useCallback(() => {
    updateFilter("city", undefined);
    setIsOpen(false);
  }, [updateFilter]);

  const handleDone = useCallback(() => {
    if (!selectedCity?.trim()) {
      updateFilter("city", undefined);
    } else {
      commitDraftFilters();
    }
    setIsLoading(true);
    // Auto-close happens via useEffect when isLoading becomes false
  }, [selectedCity, commitDraftFilters, setIsLoading, updateFilter]);

  return (
    <FilterDropdown
      label="Ubicación"
      value={displayValue}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isActive={!!selectedCity}
      onClear={handleClear}
    >
      <div className="w-72 m-0 p-0 space-y-3 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-oslo-gray-900/70 flex items-center justify-center z-40 rounded-lg">
            <Spinner
              size="8"
              color="text-white"
              ariaLabel="Cargando propiedades por ubicación..."
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-oslo-gray-800">
          <h3 className="text-sm font-semibold text-oslo-gray-50">
            Seleccionar Ubicación
          </h3>
        </div>

        {/* Cities List */}
        <div className="max-h-64 overflow-y-auto px-2">
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
                  onClick={() => handleCitySelect(city.name)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${
                    selectedCity === city.name
                      ? "bg-indigo-600 text-white"
                      : "text-oslo-gray-200 hover:bg-oslo-gray-800 disabled:opacity-50"
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

        {/* Footer - Done Button */}
        {!isLoadingCities && cities.length > 0 && (
          <div className="px-4 py-3 border-t border-oslo-gray-800">
            <button
              type="button"
              onClick={handleDone}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-oslo-gray-900 disabled:bg-oslo-gray-700 disabled:cursor-not-allowed"
            >
              Listo
            </button>
          </div>
        )}
      </div>
    </FilterDropdown>
  );
}
