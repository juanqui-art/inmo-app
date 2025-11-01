"use client";

import { useEffect } from "react";

/**
 * React Scan Provider
 *
 * Initializes the React Scan performance monitoring tool.
 * Only active in development mode to detect:
 * - Unnecessary re-renders
 * - Performance bottlenecks
 * - Component render times
 *
 * Access the React Scan toolbar by pressing Ctrl+Shift+R (or Cmd+Shift+R on Mac)
 */
export function ReactScanProvider() {
  useEffect(() => {
    // Only initialize in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Dynamically import react-scan to avoid bundle bloat in production
    import("react-scan").then((module) => {
      module.scan();
    });
  }, []);

  return null;
}
