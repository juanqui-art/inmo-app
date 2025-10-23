import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Enable Cache Components for data caching
   *
   * WHY? Allows cacheTag() and updateTag() for intelligent cache invalidation
   * on map property queries. Prevents renderization loops by deduplicating
   * identical requests in the same render.
   *
   * STATUS: Experimental in Next.js 16.0.0
   * Available by default in canary versions
   */
  experimental: {
    cacheComponents: true,
  },

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
