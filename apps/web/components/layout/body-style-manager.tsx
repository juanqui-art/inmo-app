"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function BodyStyleManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const view = searchParams.get("view");
    const isSplitView = pathname === "/propiedades" && view === "map";

    if (isSplitView) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [pathname, searchParams]);

  return null;
}
