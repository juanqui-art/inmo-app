"use client";

import { usePathname } from "next/navigation";
import { PublicFooter } from "./public-footer";

/**
 * Conditional Footer Component
 *
 * Renders the footer only on routes where it should appear.
 * The footer is hidden on the /mapa route.
 */
export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on map page
  if (pathname === "/mapa") {
    return null;
  }

  return <PublicFooter />;
}
