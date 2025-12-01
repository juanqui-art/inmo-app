"use client";

import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook to determine if the current view is the "Split View" (Map + List).
 * Currently defined as: /propiedades?view=map
 */
export function useIsSplitView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view");
  return pathname === "/propiedades" && view === "map";
}
