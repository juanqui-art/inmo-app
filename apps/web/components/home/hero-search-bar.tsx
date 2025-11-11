/**
 * HeroSearchBar - Location Search with Autocomplete
 *
 * REFACTORED ARCHITECTURE:
 * - Separation of Concerns: Hooks + Components + Constants
 * - Reusable Hooks: useSearchAutocomplete, useKeyboardNavigation, useSearchInputAnimation
 * - Atomic Components: SearchInput, CitySuggestions, RecentSearches, QuickCategories
 *
 * WHY this approach?
 * - Maintainability: Each component has a single responsibility
 * - Testability: Logic isolated in hooks, UI in components
 * - Reusability: Hooks can be used in navbar, mobile search, etc.
 * - Clarity: Clear separation between data flow and presentation
 *
 * PREVIOUS: 535 lines in one file (8 responsibilities mixed)
 * NOW: ~150 lines in main component + modular pieces
 *
 * RESOURCES:
 * - https://web.dev/debounce-javascript-execution/
 * - https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */

"use client";

import { type FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUICK_SEARCH_CATEGORIES } from "./hero-search-bar/constants";
import { SearchDropdown } from "./hero-search-bar/search-dropdown";
import { SearchInput } from "./hero-search-bar/search-input";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { useSearchAutocomplete } from "@/hooks/use-search-autocomplete";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useSearchInputAnimation } from "@/hooks/use-search-input-animation";

export function HeroSearchBar() {
  const router = useRouter();
  const { history, addSearch, clearHistory, getTimeAgo } = useSearchHistory();

  // Hooks for search logic
  const { query, suggestions, isLoading, handleInputChange, clearSuggestions } =
    useSearchAutocomplete();

  // Keyboard navigation
  const { selectedIndex, handleKeyDown: handleKeyNavigation } =
    useKeyboardNavigation(suggestions.length);

  // Refs for animations
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Apply GSAP animations
  useSearchInputAnimation(inputRef, formRef);

  /**
   * Handle form submission (progressive enhancement)
   * Works even if JavaScript is disabled
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    // If a suggestion is selected, use it
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      navigateToCity(suggestions[selectedIndex]);
      return;
    }

    // Otherwise, search by text query
    router.push(`/mapa?q=${encodeURIComponent(query)}`);
  };

  /**
   * Navigate to map with selected city filter
   */
  const navigateToCity = (city: (typeof suggestions)[0]) => {
    router.push(`/mapa?city=${encodeURIComponent(city.name)}`);
    clearSuggestions();
  };

  /**
   * Unified keyboard navigation handler
   * Combines custom keyboard nav with Enter key submission
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        navigateToCity(suggestions[selectedIndex]);
        addSearch(suggestions[selectedIndex].name, "city");
      } else {
        handleSubmit(e);
      }
      return;
    }

    handleKeyNavigation(e);
  };

  /**
   * Handle city selection from suggestions
   */
  const handleCitySelect = (city: (typeof suggestions)[0]) => {
    navigateToCity(city);
    addSearch(city.name, "city");
  };

  /**
   * Handle history item click
   */
  const handleHistoryClick = (item: { query: string; type: string }) => {
    if (item.type === "city") {
      router.push(`/mapa?city=${encodeURIComponent(item.query)}`);
    } else {
      router.push(`/mapa?q=${encodeURIComponent(item.query)}`);
    }
    addSearch(item.query, item.type as "city" | "query");
  };

  /**
   * Handle quick search category click
   */
  const handleQuickSearchClick = (categoryQuery: string) => {
    router.push(`/mapa?${categoryQuery}`);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto"
    >
      <SearchInput
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        isLoading={isLoading}
      />

      <SearchDropdown
        query={query}
        suggestions={suggestions}
        selectedIndex={selectedIndex}
        history={history}
        quickCategories={QUICK_SEARCH_CATEGORIES}
        onCitySelect={handleCitySelect}
        onHistorySelect={handleHistoryClick}
        onCategorySelect={handleQuickSearchClick}
        onClearHistory={clearHistory}
        getTimeAgo={getTimeAgo}
      />
    </form>
  );
}
