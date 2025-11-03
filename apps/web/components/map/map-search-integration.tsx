/**
 * Map Search Integration
 *
 * Client component that handles AI search integration with the map.
 * Processes ai_search query param and filters map results with smart viewport fitting.
 *
 * FLOW:
 * 1. User searches via navbar AISearchInline
 * 2. Redirects to /mapa?ai_search=...
 * 3. Server component passes ai_search param to this component
 * 4. This component shows search results on the map
 * 5. Auto-fits viewport based on number of results:
 *    - 0 results → default Cuenca view
 *    - 1 result → close-up street-level view
 *    - Multiple → fitted view showing all results
 *
 * ⚠️ DUPLICATE API CALL ISSUE (Oct 29, 2025):
 * This component calls aiSearchAction() for ai_search param.
 * HOWEVER: useInlineSearch hook in navbar ALREADY called aiSearchAction()
 * for the same query before redirecting here!
 *
 * This causes:
 * - 2x OpenAI API calls (wasteful)
 * - 2x latency (~1.2s total)
 * - 2x cost (~$0.0006 per search)
 *
 * REASON IT EXISTS:
 * - useInlineSearch stores result in local state
 * - State is lost when component unmounts during route navigation
 * - This component has no access to initial search result
 * - Only has access to URL param (ai_search=...)
 *
 * TODO (Session 3):
 * Pass search results from navbar to map via one of:
 * A) Router state: router.push('/mapa', { state: { aiSearchResult } })
 * B) SessionStorage: sessionStorage.setItem('ai_result', JSON.stringify(result))
 * C) URL params: /mapa?city=Cuenca&bedrooms=3&... (structured filters)
 *
 * Estimated fix time: 30-45 minutes
 * Savings: 50% OpenAI cost, ~450ms latency reduction
 *
 * See: ai-search-consolidated.md or use-inline-search.ts for details
 */

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import type { AISearchResult } from "@/app/actions/ai-search";
import { aiSearchAction } from "@/app/actions/ai-search";
import { getSmartViewport } from "@/lib/utils/map-bounds";
import type { MapViewport } from "@/lib/utils/url-helpers";
import { MapView, type MapProperty } from "./map-view";
import { MapSearchLoader } from "./ui/map-search-loader";
import { MapSearchEmptyState } from "./ui/map-search-empty-state";
import { FilterBar } from "./filters/filter-bar";

interface MapSearchIntegrationProps {
  properties: MapProperty[];
  initialCenter?: [number, number];
  initialZoom?: number;
  initialViewport?: MapViewport;
  initialBounds?: [[number, number], [number, number]];
  isAuthenticated?: boolean;
  priceRangeMin?: number;
  priceRangeMax?: number;
  priceDistribution?: { bucket: number; count: number }[];
}

export function MapSearchIntegration({
  properties,
  initialCenter,
  initialZoom,
  initialViewport,
  initialBounds,
  isAuthenticated = false,
  priceRangeMin,
  priceRangeMax,
  priceDistribution,
}: MapSearchIntegrationProps) {
  const searchParams = useSearchParams();
  const aiSearchQuery = searchParams.get("ai_search");

  const [searchResults, setSearchResults] = useState<AISearchResult | null>(
    null,
  );
  const [smartViewport, setSmartViewport] = useState<MapViewport | undefined>(
    initialViewport,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchStage, setSearchStage] = useState<
    "searching" | "moving" | "loading-markers" | "complete"
  >("searching");

  // Empty state management
  const [emptyStateType, setEmptyStateType] = useState<
    | "no-results"
    | "low-confidence"
    | "invalid-location"
    | "medium-confidence-warning"
    | null
  >(null);

  // Track last processed query to avoid re-fetching on bounds updates
  const lastProcessedQuery = React.useRef<string | null>(null);

  // Process AI search query from URL
  useEffect(() => {
    if (aiSearchQuery && aiSearchQuery !== lastProcessedQuery.current) {
      // New query detected
      lastProcessedQuery.current = aiSearchQuery;

      // Stage 1: Searching
      setIsSearching(true);
      setSearchStage("searching");

      // OPTIMIZATION: Check sessionStorage first to avoid duplicate API calls
      // If navbar just called aiSearchAction() with same query, use cached result
      const checkSessionCache = () => {
        try {
          const cached = sessionStorage.getItem("ai_search_result");
          if (cached) {
            const { data, timestamp, ttl } = JSON.parse(cached);
            // Verify cache is still valid (within TTL)
            if (Date.now() - timestamp < ttl) {
              logger.debug("✅ Using cached AI search result (saved 450ms + $0.0003)");
              sessionStorage.removeItem("ai_search_result"); // Clean up
              return data; // Return cached data
            } else {
              // Cache expired
              sessionStorage.removeItem("ai_search_result");
            }
          }
        } catch (e) {
          // Silently fail if sessionStorage is unavailable
          logger.debug("Could not read sessionStorage:", e);
        }
        return null; // No cached result
      };

      const cachedResult = checkSessionCache();

      if (cachedResult) {
        // Use cached result (avoid duplicate API call)
        setSearchResults(cachedResult);

        // Determine empty state type based on result
        if (!cachedResult.success) {
          if (
            cachedResult.locationValidation &&
            !cachedResult.locationValidation.isValid
          ) {
            setEmptyStateType("invalid-location");
          } else if (
            cachedResult.confidence !== undefined &&
            cachedResult.confidence < 30
          ) {
            setEmptyStateType("low-confidence");
          } else {
            setEmptyStateType("low-confidence");
          }
          setIsSearching(false);
        } else if (cachedResult.properties && cachedResult.properties.length === 0) {
          setEmptyStateType("no-results");
          setIsSearching(false);
        } else if (
          cachedResult.confidence !== undefined &&
          cachedResult.confidence < 50
        ) {
          setEmptyStateType("medium-confidence-warning");
          setSearchStage("moving");
        } else {
          setEmptyStateType(null);
          setSearchStage("moving");
        }
      } else {
        // No cache: Make API call (normal flow)
        aiSearchAction(aiSearchQuery)
          .then((result) => {
            logger.debug("🗺️ AI Search results received:", {
              count: result.properties?.length,
              query: result.query,
              filters: result.filterSummary,
              confidence: result.confidence,
              locationValidation: result.locationValidation,
            });
            setSearchResults(result);

          // Determine empty state type based on result
          if (!result.success) {
            // Failed search - check if it's due to invalid location or low confidence
            if (
              result.locationValidation &&
              !result.locationValidation.isValid
            ) {
              setEmptyStateType("invalid-location");
            } else if (
              result.confidence !== undefined &&
              result.confidence < 30
            ) {
              setEmptyStateType("low-confidence");
            } else {
              // Generic error - show low confidence
              setEmptyStateType("low-confidence");
            }
            setIsSearching(false); // Stop loading immediately for errors
          } else if (result.properties && result.properties.length === 0) {
            // No results found
            setEmptyStateType("no-results");
            setIsSearching(false); // Stop loading immediately for no results
          } else if (
            result.confidence !== undefined &&
            result.confidence < 50
          ) {
            // Medium confidence warning (30-50%)
            setEmptyStateType("medium-confidence-warning");
            // Continue with map movement - warning will show over results
            setSearchStage("moving");
          } else {
            // Success with good confidence
            setEmptyStateType(null);
            // Stage 2: Moving map (will be handled in next useEffect)
            setSearchStage("moving");
          }
        })
        .catch((error) => {
          console.error("❌ Error processing AI search:", error);
          setSearchResults({
            success: false,
            query: aiSearchQuery,
            error: "Error procesando la búsqueda",
          });
          setEmptyStateType("low-confidence"); // Show generic error state
          setIsSearching(false);
        });
    }
    // NOTE: Don't reset searchResults when ai_search is removed
    // This allows bounds updates to preserve the search filter
  }, [aiSearchQuery]);

  // Calculate smart viewport when search results change
  useEffect(() => {
    if (searchResults?.success && searchResults.properties) {
      const viewport = getSmartViewport(searchResults.properties);
      setSmartViewport({
        latitude: viewport.latitude,
        longitude: viewport.longitude,
        zoom: viewport.zoom,
      });

      logger.debug("📍 Smart viewport calculated:", {
        resultCount: searchResults.properties.length,
        zoom: viewport.zoom,
        center: [viewport.latitude, viewport.longitude],
      });

      // Stage 3: Loading markers
      // Give fitBounds animation time to start (600ms from map-view.tsx)
      setTimeout(() => {
        setSearchStage("loading-markers");

        // Stage 4: Complete
        // Wait for markers to render (additional 800ms)
        setTimeout(() => {
          setSearchStage("complete");
          // Hide loader after showing "complete" briefly
          setTimeout(() => {
            setIsSearching(false);
          }, 500);
        }, 800);
      }, 600);
    }
  }, [searchResults]);

  return (
    <>
      <FilterBar
        priceRangeMin={priceRangeMin}
        priceRangeMax={priceRangeMax}
        priceDistribution={priceDistribution}
      />
      <div className="relative w-full h-screen">
        {/* Filter Bar */}

        <MapView
          properties={properties}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          initialBounds={initialBounds}
          initialViewport={smartViewport || initialViewport}
          isAuthenticated={isAuthenticated}
          searchResults={searchResults?.properties}
        />

        {/* Search Loading Overlay */}
        <MapSearchLoader
          isLoading={isSearching}
          stage={searchStage}
          resultCount={
            searchResults?.success
              ? searchResults.properties?.length
              : undefined
          }
        />

        {/* Empty State / Error Overlay */}
        {emptyStateType && searchResults && (
          <MapSearchEmptyState
            type={emptyStateType}
            query={searchResults.query}
            confidence={searchResults.confidence}
            suggestions={searchResults.suggestions}
            availableCities={
              emptyStateType === "invalid-location"
                ? searchResults.locationValidation?.suggestedCities || [
                    "Cuenca",
                    "Gualaceo",
                    "Azogues",
                    "Paute",
                  ]
                : undefined
            }
            filterSummary={
              emptyStateType === "no-results"
                ? searchResults.filterSummary
                : undefined
            }
            onDismiss={() => setEmptyStateType(null)}
          />
        )}
      </div>
    </>
  );
}
