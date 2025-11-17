"use client";

/**
 * AI SEARCH INLINE
 *
 * Main component that orchestrates inline search bar
 * - Uses useInlineSearch hook for state
 * - Renders search bar + suggestions
 * - Handles focus/blur/click outside
 * - Mobile responsive layout
 */

import { useEffect } from "react";
import { AISearchInlineBar } from "./ai-search-inline-bar";
import { AISearchInlineSuggestions } from "./ai-search-inline-suggestions";
import { useInlineSearch } from "./use-inline-search";

interface AISearchInlineProps {
  onSearch?: (query: string) => void;
  onSearchResults?: (result: any) => void; // Callback when search completes
}

export function AISearchInline({
  onSearch,
  onSearchResults,
}: AISearchInlineProps) {
  const {
    isFocused,
    query,
    showSuggestions,
    isLoading,
    searchResult,
    containerRef,
    setQuery,
    handleFocus,
    handleBlur,
    handleClear,
    handleSearch,
  } = useInlineSearch();

  // Notify parent when search results arrive (success or failure)
  // The map will handle empty states for failed searches
  useEffect(() => {
    if (searchResult && onSearchResults) {
      onSearchResults(searchResult);
    }
  }, [searchResult, onSearchResults]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
    onSearch?.(suggestion);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl ">
      <AISearchInlineBar
        isFocused={isFocused}
        query={query}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClear={handleClear}
        onChange={setQuery}
        onSearch={(q) => {
          handleSearch(q);
          onSearch?.(q);
        }}
        isLoading={isLoading}
      />

      {/* Suggestions Dropdown */}
      <AISearchInlineSuggestions
        isOpen={showSuggestions}
        onSuggestionClick={handleSuggestionClick}
      />
    </div>
  );
}
