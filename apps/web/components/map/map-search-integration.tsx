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

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AISearchResult } from "@/app/actions/ai-search";
import { aiSearchAction } from "@/app/actions/ai-search";
import { getSmartViewport } from "@/lib/utils/map-bounds";
import type { MapViewport } from "@/lib/utils/url-helpers";
import { MapView, type MapProperty } from "./map-view";

interface MapSearchIntegrationProps {
  properties: MapProperty[];
  initialCenter?: [number, number];
  initialZoom?: number;
  initialViewport?: MapViewport;
  isAuthenticated?: boolean;
}

export function MapSearchIntegration({
  properties,
  initialCenter,
  initialZoom,
  initialViewport,
  isAuthenticated = false,
}: MapSearchIntegrationProps) {
  const searchParams = useSearchParams();
  const aiSearchQuery = searchParams.get("ai_search");

  const [searchResults, setSearchResults] = useState<AISearchResult | null>(
    null
  );
  const [smartViewport, setSmartViewport] = useState<MapViewport | undefined>(
    initialViewport
  );

  // Process AI search query from URL
  useEffect(() => {
    if (aiSearchQuery) {
      aiSearchAction(aiSearchQuery)
        .then((result) => {
          console.log("🗺️ AI Search results received:", {
            count: result.properties?.length,
            query: result.query,
            filters: result.filterSummary,
          });
          setSearchResults(result);
        })
        .catch((error) => {
          console.error("❌ Error processing AI search:", error);
          setSearchResults({
            success: false,
            query: aiSearchQuery,
            error: "Error procesando la búsqueda",
          });
        });
    }
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

      console.log("📍 Smart viewport calculated:", {
        resultCount: searchResults.properties.length,
        zoom: viewport.zoom,
        center: [viewport.latitude, viewport.longitude],
      });
    }
  }, [searchResults]);

  return (
    <MapView
      properties={properties}
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      initialViewport={smartViewport || initialViewport}
      isAuthenticated={isAuthenticated}
      searchResults={searchResults?.properties}
    />
  );
}
