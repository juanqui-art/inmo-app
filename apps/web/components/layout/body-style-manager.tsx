"use client";

import { useEffect } from "react";
import { useIsSplitView } from "@/hooks/use-is-split-view";

export function BodyStyleManager() {
  const isSplitView = useIsSplitView();

  useEffect(() => {
    if (isSplitView) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSplitView]);

  return null;
}
