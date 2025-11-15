/**
 * REDIRECT: /mapa → /propiedades?view=map
 *
 * This route now redirects to the unified properties page with map view.
 * All existing query parameters are preserved during the redirect.
 *
 * Migration: Part of the split view unification (Nov 2025)
 * - Old pattern: Separate routes (/mapa and /propiedades)
 * - New pattern: Single route with view parameter (?view=map|list)
 * - Rationale: Follows industry best practices (Booking.com, Hotels.com)
 */

import { redirect } from "next/navigation";

interface MapPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MapPage(props: MapPageProps) {
  const searchParams = await props.searchParams;

  // Build query string from existing search params
  const params = new URLSearchParams();

  // Preserve all existing filters
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        params.append(key, v);
      }
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  // Add view=map parameter
  params.set("view", "map");

  // Redirect to unified route with all parameters preserved
  const queryString = params.toString();
  redirect(`/propiedades?${queryString}`);
}
