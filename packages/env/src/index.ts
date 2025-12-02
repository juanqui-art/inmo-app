/**
 * ENVIRONMENT VARIABLES VALIDATION
 *
 * Centralized system for type-safe environment variables across the monorepo.
 *
 * WHY?
 * - App fails at startup (not runtime) if variables are missing
 * - TypeScript autocomplete for all env vars across all packages
 * - Self-documenting: schema shows what's required
 * - Single source of truth for env vars
 * - Validation occurs once, used everywhere
 *
 * USAGE:
 * ```typescript
 * import { env } from '@repo/env'
 *
 * // ✅ Type-safe with autocomplete
 * const url = env.NEXT_PUBLIC_SUPABASE_URL
 *
 * // ❌ Don't use this anymore
 * const url = process.env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 *
 * ADDING NEW VARIABLES:
 * 1. Add to schema below (clientSchema or serverSchema)
 * 2. Add to .env.example in the root
 * 3. Add to .env.local with real values
 * 4. Restart the dev server: bun run dev
 */

import { z } from "zod";

/**
 * Client-side Environment Variables
 *
 * These are exposed to the browser (prefixed with NEXT_PUBLIC_)
 * Never put secrets here!
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .optional()
    .default("http://localhost:3000"),

  NEXT_PUBLIC_MAPBOX_TOKEN: z
    .string()
    .min(1, "NEXT_PUBLIC_MAPBOX_TOKEN is required")
    .startsWith(
      "pk.",
      "NEXT_PUBLIC_MAPBOX_TOKEN must be a valid MapBox public token (starts with 'pk.')",
    )
    .optional(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required")
    .startsWith(
      "pk_",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a valid Stripe publishable key",
    )
    .optional(),

  // Sentry (public DSN for client-side error tracking)
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url("NEXT_PUBLIC_SENTRY_DSN must be a valid Sentry DSN URL")
    .optional(),

  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z
    .string()
    .optional()
    .describe("Sentry environment (development, staging, production)"),

  NEXT_PUBLIC_SENTRY_ENABLED: z
    .string()
    .optional()
    .describe("Enable Sentry in development (true/false)"),
});

/**
 * Server-side Environment Variables
 *
 * These are ONLY available on the server
 * Safe to put secrets here
 */
const serverSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid connection string"),

  DIRECT_URL: z
    .string()
    .url("DIRECT_URL must be a valid database URL")
    .optional(),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required")
    .optional(),

  RESEND_API_KEY: z
    .string()
    .min(1, "RESEND_API_KEY is required for email notifications")
    .optional(),

  EMAIL_FROM_DOMAIN: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Verified domain for sending emails (e.g., 'inmoapp.com'). Leave empty for test mode.",
    ),

  // Stripe (for subscription payments)
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, "STRIPE_SECRET_KEY is required")
    .startsWith("sk_", "STRIPE_SECRET_KEY must be a valid Stripe secret key")
    .optional(),

  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, "STRIPE_WEBHOOK_SECRET is required")
    .startsWith(
      "whsec_",
      "STRIPE_WEBHOOK_SECRET must be a valid webhook secret",
    )
    .optional(),

  STRIPE_BASIC_PRICE_ID: z
    .string()
    .min(1, "STRIPE_BASIC_PRICE_ID is required")
    .startsWith(
      "price_",
      "STRIPE_BASIC_PRICE_ID must be a valid Stripe price ID",
    )
    .optional(),

  STRIPE_PRO_PRICE_ID: z
    .string()
    .min(1, "STRIPE_PRO_PRICE_ID is required")
    .startsWith("price_", "STRIPE_PRO_PRICE_ID must be a valid Stripe price ID")
    .optional(),

  // Sentry (server-side error tracking)
  SENTRY_DSN: z
    .string()
    .url("SENTRY_DSN must be a valid Sentry DSN URL")
    .optional(),

  SENTRY_ENVIRONMENT: z
    .string()
    .optional()
    .describe("Sentry environment (development, staging, production)"),

  SENTRY_ENABLED: z
    .string()
    .optional()
    .describe("Enable Sentry in development (true/false)"),

  SENTRY_AUTH_TOKEN: z
    .string()
    .optional()
    .describe("Sentry auth token for uploading source maps"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Combined schema for all environment variables
 */
const envSchema = clientSchema.merge(serverSchema);

/**
 * Validate environment variables
 *
 * This runs at module load time, so the app will fail to start
 * if any required variables are missing or invalid.
 */
const parseEnv = (): Env => {
  // Check if we're in the browser (Next.js client-side)
  const isBrowser = Boolean(
    typeof window !== "undefined" && typeof document !== "undefined",
  );

  if (isBrowser) {
    // In browser, only validate client vars (server vars aren't available)
    const result = clientSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });

    if (!result.success) {
      console.error("❌ Invalid client environment variables:");
      console.error(result.error.flatten().fieldErrors);
      throw new Error("Invalid environment variables");
    }

    // Merge with defaults for server vars
    return {
      ...result.data,
      DATABASE_URL: process.env.DATABASE_URL || "",
      DIRECT_URL: process.env.DIRECT_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_BASIC_PRICE_ID: process.env.STRIPE_BASIC_PRICE_ID,
      STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
      NODE_ENV: (process.env.NODE_ENV || "development") as
        | "development"
        | "production"
        | "test",
    };
  }

  // On server, validate all vars
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_BASIC_PRICE_ID: process.env.STRIPE_BASIC_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!result.success) {
    console.error("❌ Invalid server environment variables:");
    // Flatten errors for better readability
    const flatErrors = result.error.flatten();
    console.error(flatErrors.fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return result.data;
};

/**
 * Validated environment variables
 *
 * Import this instead of using process.env directly
 */
export const env = parseEnv();

/**
 * Type inference for better DX
 */
export type Env = z.infer<typeof envSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
