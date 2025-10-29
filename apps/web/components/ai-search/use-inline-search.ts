"use client";

/**
 * USE INLINE SEARCH HOOK
 *
 * Manages state for inline expander search bar:
 * - Expanded/collapsed state
 * - Query input
 * - Suggestions visibility
 * - Outside click detection
 * - AI search with Server Action
 *
 * ARCHITECTURE NOTE (Oct 29, 2025):
 * ⚠️ DUPLICATE API CALL ISSUE IDENTIFIED
 *
 * Current flow:
 * 1. User searches → handleSearch() calls aiSearchAction() [FIRST CALL]
 * 2. Result stored in local state (setSearchResult)
 * 3. Router redirects: router.push(`/mapa?ai_search=${query}`)
 * 4. Component unmounts → state lost
 * 5. MapSearchIntegration reads URL param → calls aiSearchAction() [SECOND CALL]
 *
 * Impact: 2x OpenAI cost (~$0.0006 per search), 2x latency (~1.2s)
 *
 * SOLUTION REQUIRED:
 * Pass search results to MapSearchIntegration via:
 * - Option A: Router state (router.push with state object)
 * - Option B: SessionStorage cache (cache results with TTL)
 * - Option C: URL structured filters (/mapa?city=Cuenca&bedrooms=3&...)
 *
 * See AI-SEARCH-CONSOLIDATED.md section 3 for detailed comparison.
 */

import { useState, useRef, useEffect } from "react";
import { aiSearchAction, type AISearchResult } from "@/app/actions/ai-search";

interface UseInlineSearchReturn {
  isFocused: boolean;
  query: string;
  showSuggestions: boolean;
  isLoading: boolean;
  searchResult?: AISearchResult;
  error?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setQuery: (query: string) => void;
  setIsFocused: (focused: boolean) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleClear: () => void;
  handleSearch: (searchQuery: string) => Promise<void>;
}

export function useInlineSearch(): UseInlineSearchReturn {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<AISearchResult | undefined>();
  const [error, setError] = useState<string | undefined>();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setShowSuggestions(false);
      }
    };

    if (isFocused) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay blur to allow suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleClear = () => {
    setQuery("");
    setSearchResult(undefined);
    setError(undefined);
  };

  const handleSearch = async (searchQuery: string) => {
    // Trim and validate
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setError("Por favor ingresa una búsqueda");
      return;
    }

    setQuery(trimmedQuery);
    setIsLoading(true);
    setError(undefined);
    setSearchResult(undefined);

    try {
      console.log("🔍 Starting AI search:", trimmedQuery);
      const result = await aiSearchAction(trimmedQuery);

      if (result.success) {
        console.log("✅ Search successful:", result);
        setSearchResult(result);
        // Close suggestions after successful search
        setTimeout(() => {
          setShowSuggestions(false);
        }, 300);
      } else {
        console.error("❌ Search failed:", result.error);
        setError(result.error || "Error en la búsqueda");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      console.error("❌ Exception during search:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFocused,
    query,
    showSuggestions,
    isLoading,
    searchResult,
    error,
    containerRef,
    setQuery,
    setIsFocused,
    handleFocus,
    handleBlur,
    handleClear,
    handleSearch,
  };
}
