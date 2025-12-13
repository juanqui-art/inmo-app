import { withSentryConfig } from "@sentry/nextjs";
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
  serverExternalPackages: ["@prisma/client", "pino", "pino-pretty"],

  /**
   * Webpack Configuration
   * Exclude test files from dependencies to prevent build errors
   */
  webpack: (config) => {
    // Exclude test files from all node_modules
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      include: /node_modules/,
      use: 'null-loader',
    });

    return config;
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "pexsmszavuffgdamwrlj.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  /**
   * Experimental Features Configuration
   * 
   * Server Actions body size limit increased to support image uploads.
   * Default is 1MB, we increase to 10MB to allow multiple high-quality images.
   * 
   * RELATED: Property creation wizard (apps/web/app/actions/wizard.ts)
   */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  /**
   * Security Headers
   *
   * Environment-aware security configuration:
   * - Development: Permissive CSP to support Fast Refresh, HMR, and dev tools
   * - Production: Strict CSP with only whitelisted domains
   *
   * Headers configured:
   * - CSP: Content Security Policy prevents XSS attacks
   * - X-Frame-Options: Prevents clickjacking
   * - X-Content-Type-Options: Prevents MIME sniffing
   * - HSTS: Forces HTTPS connections (production only)
   * - Referrer-Policy: Controls referrer information
   * - Permissions-Policy: Restricts browser features
   *
   * RELATED: docs/technical-debt/01-INFRASTRUCTURE.md (Section 1.3)
   */
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    // Development CSP: Permissive to support Fast Refresh, HMR, and development tools
    const devCSP = [
      "default-src 'self'",
      // Allow unsafe-eval and unsafe-inline for Fast Refresh and HMR
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com https://accounts.google.com https://www.googletagmanager.com https://maps.googleapis.com https://*.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
      // Allow all HTTPS images for easier development
      "img-src 'self' data: blob: https://* https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://streetviewpixels-pa.googleapis.com https://lh3.googleusercontent.com https://*.ggpht.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // Allow all WebSocket and HTTP connections for HMR
      "connect-src 'self' ws: wss: http: https: https://maps.googleapis.com https://*.googleapis.com",
      "frame-src 'self' https://accounts.google.com https://www.google.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    // Production CSP: Strict whitelist of trusted domains only
    const prodCSP = [
      "default-src 'self'",
      // Scripts: Only from self, Vercel Analytics, Mapbox, and Google OAuth
      "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://api.mapbox.com https://accounts.google.com https://www.googletagmanager.com https://maps.googleapis.com https://*.googleapis.com",
      // Styles: Self, inline (Tailwind), and Mapbox
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com",
      // Images: Supabase storage, Mapbox tiles, Unsplash
      "img-src 'self' data: blob: https://*.supabase.co https://*.tiles.mapbox.com https://api.mapbox.com https://images.unsplash.com https://maps.gstatic.com https://maps.googleapis.com https://*.googleapis.com https://streetviewpixels-pa.googleapis.com https://lh3.googleusercontent.com https://*.ggpht.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // API connections: Supabase, Mapbox, OpenAI, Vercel Analytics, Google
      "connect-src 'self' https://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://api.openai.com https://vitals.vercel-insights.com https://accounts.google.com wss://*.supabase.co https://maps.googleapis.com https://*.googleapis.com",
      "frame-src 'self' https://accounts.google.com https://www.google.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    // Base security headers (applied in both dev and prod)
    const baseHeaders = [
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
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
        value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
      },
      {
        key: "Content-Security-Policy",
        value: isDev ? devCSP : prodCSP,
      },
    ];

    // Production-only headers (HSTS requires HTTPS)
    const prodOnlyHeaders = isDev
      ? []
      : [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ];

    return [
      {
        source: "/:path*",
        headers: [...baseHeaders, ...prodOnlyHeaders],
      },
    ];
  },
};

/**
 * Sentry Configuration Options
 *
 * Configure source maps upload and other Sentry features.
 * Only enabled in production builds.
 */
const sentryOptions = {
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options

	// Only upload source maps in production
	disableServerWebpackPlugin: process.env.NODE_ENV !== "production",
	disableClientWebpackPlugin: process.env.NODE_ENV !== "production",

	// Suppresses source map uploading logs during build
	silent: true,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Hides source maps from generated client bundles
	hideSourceMaps: true,

	// Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

	// Automatically annotate React components for better errors
	reactComponentAnnotation: {
		enabled: true,
	},
};

// Wrap the config with Sentry
export default withSentryConfig(nextConfig, sentryOptions);
