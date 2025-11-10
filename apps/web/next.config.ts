import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cache Components Disabled (Incompatible with ISR)
   *
   * STATUS: Experimental in Next.js 16.0.0
   * ISSUE: 'use cache' + cacheComponents: true is incompatible with revalidate in routes
   *        (ERROR: Route segment config "revalidate" is not compatible with cacheComponents)
   *
   * SOLUTION: Use React.cache() instead
   *           - Stable API (React 18+)
   *           - Request-level deduplication only (no need for cacheComponents)
   *           - Compatible with existing ISR strategy (revalidate + revalidatePath)
   *
   * PILOT: PropertyRepository.getPropertiesList() uses React.cache() wrapper
   *        (see packages/database/src/repositories/properties.ts)
   *
   * FUTURE: Revisit 'use cache' when Next.js 16.1+ improves experimental API
   *         or when auth can be refactored to avoid cookies() in cached functions
   *
   * RELATED: docs/caching/CACHE_STATUS.md
   */

  transpilePackages: [
    "@repo/env",
    "@repo/database",
    "@repo/ui",
    "@repo/supabase",
    "react-map-gl",
    "mapbox-gl",
  ],
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
