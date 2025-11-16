"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { PublicFooter } from "./public-footer";

/**
 * Conditional Footer Component
 *
 * Renders the footer only on routes where it should appear.
 * The footer is hidden on:
 * - Split view: /propiedades?view=map (footer rendered inside PropertySplitView)
 * - Map page: /mapa (legacy route)
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hide footer on map page (legacy route)
  if (pathname === "/mapa") {
    return null;
  }

  // Hide footer on split view (/propiedades?view=map)
  // because footer is now rendered at end of list column in PropertySplitView
  const view = searchParams.get("view");
  if (pathname === "/propiedades" && view === "map") {
    return null;
  }

  return <PublicFooter />;
}
