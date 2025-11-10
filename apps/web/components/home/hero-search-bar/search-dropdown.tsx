/**
 * SearchDropdown - Dropdown container for suggestions, history, and quick categories
 *
 * RESPONSIBILITY: Orchestrate dropdown sections (city suggestions, history, quick categories)
 */

import type { CitySearchResult } from "@/app/actions/properties";
import { CitySuggestions } from "./city-suggestions";
import { RecentSearches } from "./recent-searches";
import { QuickCategories } from "./quick-categories";

interface City extends CitySearchResult {
  slug?: string;
}

interface SearchHistoryItem {
  query: string;
  type: string;
  timestamp: number;
}

interface SearchDropdownProps {
  query: string;
  suggestions: City[];
  selectedIndex: number;
  history: SearchHistoryItem[];
  quickCategories: Array<{ label: string; query: string }>;
  onCitySelect: (city: City) => void;
  onHistorySelect: (item: SearchHistoryItem) => void;
  onCategorySelect: (categoryQuery: string) => void;
  onClearHistory: () => void;
  getTimeAgo: (timestamp: number) => string;
}

export function SearchDropdown({
  query,
  suggestions,
  selectedIndex,
  history,
  quickCategories,
  onCitySelect,
  onHistorySelect,
  onCategorySelect,
  onClearHistory,
  getTimeAgo,
}: SearchDropdownProps) {
  // Only show dropdown when there are suggestions or when input is empty
  if (suggestions.length === 0 && query.length > 0) {
    return null;
  }

  return (
    <div
      id="search-suggestions"
      className="
        absolute top-full mt-2 w-full
        bg-white/40 rounded-xl sm:rounded-2xl
        shadow-2xl
        border border-white/30
        max-h-[70vh] sm:max-h-96 overflow-y-auto
        z-[100]
        animate-in fade-in slide-in-from-top-2 duration-200
      "
    >
      {/* Location Suggestions (when user types) */}
      {suggestions.length > 0 && (
        <CitySuggestions
          cities={suggestions}
          selectedIndex={selectedIndex}
          onSelect={onCitySelect}
        />
      )}

      {/* Recent Searches (when input is empty) */}
      {query.length === 0 && history.length > 0 && (
        <RecentSearches
          history={history}
          onSelect={onHistorySelect}
          onClearHistory={onClearHistory}
          getTimeAgo={getTimeAgo}
        />
      )}

      {/* Quick Search Categories (always visible when dropdown is open) */}
      {(query.length === 0 || suggestions.length > 0) && (
        <QuickCategories
          categories={quickCategories}
          onSelect={onCategorySelect}
        />
      )}
    </div>
  );
}
