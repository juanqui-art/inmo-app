/**
 * useSearchAutocomplete - Autocomplete search logic with debouncing
 *
 * PATTERN: Custom Hook for Debounced API Calls
 *
 * WHY this approach?
 * - Reusable: Use in navbar, mobile search, etc.
 * - Testable: Logic isolated from component
 * - Cancellable: Aborts in-flight requests on unmount
 * - Performant: Debounce prevents API spam
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type CitySearchResult,
  searchCitiesAction,
} from "@/app/actions/properties";
import { debounce } from "@/lib/utils/debounce";

interface City extends CitySearchResult {
  slug?: string;
}

export function useSearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  /**
   * Debounced city search function (300ms)
   *
   * useMemo: Prevent recreating on every render
   * debounce: Wait 300ms after user stops typing
   */
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        // Don't search for very short queries
        if (searchQuery.length < 2) {
          setSuggestions([]);
          return;
        }

        // Cancel previous request if still pending
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);

        try {
          // Call the Server Action to search cities in Supabase
          const result = await searchCitiesAction(searchQuery);

          if (result.error) {
            console.error("Search failed:", result.error);
            setSuggestions([]);
            return;
          }

          // Map the results and add slug for navigation
          const citiesWithSlug: City[] = result.cities.map((city) => ({
            ...city,
            slug: city.id, // Use the id as slug (lowercase-state format)
          }));

          setSuggestions(citiesWithSlug);
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Search failed:", error);
            setSuggestions([]);
          }
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [],
  );

  /**
   * Cleanup on unmount
   * CRITICAL: Prevent memory leaks and race conditions
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  /**
   * Handle input change
   * Trigger search as user types
   */
  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  /**
   * Clear suggestions
   */
  const clearSuggestions = () => {
    setSuggestions([]);
    setQuery("");
  };

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
    handleInputChange,
    clearSuggestions,
  };
}
