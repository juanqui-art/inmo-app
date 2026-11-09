"use client";

/**
 * UTM Capture Provider
 *
 * Captures UTM parameters from URL on initial page load.
 * Place in layout to ensure UTM capture happens on any entry page.
 */

import { useEffect } from "react";
import { captureUTMFromURL } from "@/lib/utils/utm-tracking";

export function UTMCaptureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Capture UTM params on mount
    captureUTMFromURL();
  }, []);

  return <>{children}</>;
}
