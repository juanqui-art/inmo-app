/**
 * CitySuggestions - Displays city search results
 *
 * RESPONSIBILITY: Render location suggestions list
 */

import { MapPin } from "lucide-react";
import type { CitySearchResult } from "@/app/actions/properties";

interface City extends CitySearchResult {
  slug?: string;
}

interface CitySuggestionsProps {
  cities: City[];
  selectedIndex: number;
  onSelect: (city: City) => void;
}

export function CitySuggestions({
  cities,
  selectedIndex,
  onSelect,
}: CitySuggestionsProps) {
  return (
    <>
      <div className="sticky top-0 px-4 sm:px-5 py-3 border-b border-white/10 bg-white/5 backdrop-blur-sm z-10">
        <p className="text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wide">
          📍 Ubicaciones encontradas
        </p>
      </div>
      <ul className="py-2">
        {cities.map((city, index) => (
          <li
            key={city.id}
            className={`
              px-4 sm:px-5 py-3
              cursor-pointer
              flex items-center gap-3 sm:gap-4
              transition-all duration-150
              min-h-[56px]
              border-l-4
              ${
                index === selectedIndex
                  ? "bg-indigo-500/30 border-l-indigo-400 backdrop-blur-sm"
                  : "border-l-transparent hover:bg-white/10 active:bg-white/15"
              }
            `}
            onClick={() => onSelect(city)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSelect(city);
              }
            }}
            role="option"
            aria-selected={index === selectedIndex}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 ${
                index === selectedIndex ? "bg-indigo-500/40" : "bg-white/10"
              }`}
            >
              <MapPin
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  index === selectedIndex ? "text-indigo-300" : "text-white/60"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold truncate text-base sm:text-lg ${
                  index === selectedIndex ? "text-white" : "text-white/90"
                }`}
              >
                {city.name}, {city.state}
              </p>
              {city.propertyCount !== undefined && (
                <p className="text-sm sm:text-base text-white/60 mt-0.5">
                  {city.propertyCount.toLocaleString()} propiedades
                </p>
              )}
            </div>
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
        ))}
      </ul>
    </>
  );
}
