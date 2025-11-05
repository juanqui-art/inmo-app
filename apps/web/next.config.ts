import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cache Components Disabled (Temporarily)
   *
   * STATUS: Experimental in Next.js 16.0.0
   * ISSUE: cacheTag() + updateTag() require all data access to be cached
   *        (including cookies() in getCurrentUser). This breaks routes that
   *        need uncached data access.
   *
   * SOLUTION: We implement caching at the function level instead using
   *           React.cache() without cacheTag/updateTag. This provides:
   *           ✅ Request deduplication (same benefits)
   *           ❌ Manual invalidation via revalidateTag() (workaround: full page revalidation)
   *
   * STATUS: Next.js team is improving this for next releases
   * WHEN TO RE-ENABLE: Next.js 16.1+ (expected improvement in experimental API)
   */

  transpilePackages: [
    "@repo/env",
    "@repo/database",
    "@repo/shared",
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
