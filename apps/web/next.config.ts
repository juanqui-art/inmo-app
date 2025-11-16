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

  /**
   * Security Headers
   *
   * Comprehensive security headers to protect against common web vulnerabilities:
   * - CSP: Content Security Policy prevents XSS attacks
   * - X-Frame-Options: Prevents clickjacking
   * - X-Content-Type-Options: Prevents MIME sniffing
   * - HSTS: Forces HTTPS connections
   * - Referrer-Policy: Controls referrer information
   * - Permissions-Policy: Restricts browser features
   *
   * RELATED: docs/technical-debt/01-INFRASTRUCTURE.md (Section 1.3)
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              // Default: Only allow resources from same origin
              "default-src 'self'",
              // Scripts: Allow self, Next.js chunks, Mapbox, Google OAuth, and unsafe-eval for development
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com https://accounts.google.com https://www.googletagmanager.com",
              // Styles: Allow self, unsafe-inline for Tailwind, and Mapbox styles
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
              // Images: Allow self, data URIs, Supabase storage, Mapbox tiles
              "img-src 'self' data: blob: https://*.supabase.co https://*.tiles.mapbox.com https://api.mapbox.com",
              // Fonts: Allow self and data URIs
              "font-src 'self' data:",
              // Connect: Allow API calls to Supabase, Mapbox, Google
              "connect-src 'self' https://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://accounts.google.com wss://*.supabase.co",
              // Frames: Allow Google OAuth iframe
              "frame-src 'self' https://accounts.google.com",
              // Workers: Allow self and blob for map workers
              "worker-src 'self' blob:",
              // Child sources: For web workers
              "child-src 'self' blob:",
              // Object/embed: Block all
              "object-src 'none'",
              // Base URI: Restrict to self
              "base-uri 'self'",
              // Form actions: Only allow self
              "form-action 'self'",
              // Frame ancestors: Deny embedding (redundant with X-Frame-Options but good defense-in-depth)
              "frame-ancestors 'none'",
              // Upgrade insecure requests in production
              process.env.NODE_ENV === "production"
                ? "upgrade-insecure-requests"
                : "",
            ]
              .filter(Boolean)
              .join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
