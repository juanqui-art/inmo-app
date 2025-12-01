"use client";

import { usePathname } from "next/navigation";
import { useIsSplitView } from "@/hooks/use-is-split-view";
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
  const isSplitView = useIsSplitView();

  // Hide footer on map page (legacy route)
  if (pathname === "/mapa") {
    return null;
  }

  // Hide footer on split view (/propiedades?view=map)
  // because footer is now rendered at end of list column in PropertySplitView
  if (isSplitView) {
    return null;
  }

  return <PublicFooter />;
}
