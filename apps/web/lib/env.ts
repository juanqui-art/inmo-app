/**
 * ENVIRONMENT VARIABLES VALIDATION
 *
 * Type-safe access to environment variables with runtime validation.
 *
 * WHY?
 * - App fails at startup (not runtime) if variables are missing
 * - TypeScript autocomplete for all env vars
 * - Self-documenting: schema shows what's required
 * - Single source of truth for env vars
 *
 * USAGE:
 * ```typescript
 * import { env } from '@/lib/env'
 *
 * // ✅ Type-safe with autocomplete
 * const url = env.NEXT_PUBLIC_SUPABASE_URL
 *
 * // ❌ Don't use this anymore
 * const url = process.env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 *
 * ADDING NEW VARIABLES:
 * 1. Add to schema below
 * 2. Add to .env.example
 * 3. Add to Vercel/deployment environment
 */

import {z} from "zod";

/**
 * Client-side Environment Variables
 *
 * These are exposed to the browser (prefixed with NEXT_PUBLIC_)
 * Never put secrets here!
 */
const clientSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),

    NEXT_PUBLIC_SUPABASE_ANON_KEY: z
        .string()
        .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

    NEXT_PUBLIC_SITE_URL: z
        .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
        .optional()
        .default("http://localhost:3000"),

    NEXT_PUBLIC_MAPBOX_TOKEN: z
        .string()
        .min(1, "NEXT_PUBLIC_MAPBOX_TOKEN is required")
        .startsWith("pk.", "NEXT_PUBLIC_MAPBOX_TOKEN must be a valid MapBox public token (starts with 'pk.')")
        .optional(), // Optional: only needed for /mapa page
});

/**
 * Server-side Environment Variables
 *
 * These are ONLY available on the server
 * Safe to put secrets here
 */
const serverSchema = z.object({
    DATABASE_URL: z.url("DATABASE_URL must be a valid database connection string"),

    SUPABASE_SERVICE_ROLE_KEY: z
        .string()
        .min(1, "SUPABASE_SERVICE_ROLE_KEY is required")
        .optional(), // Optional because not all operations need it

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
const parseEnv = () => {
    // In browser, only validate client vars (server vars aren't available)
    const isBrowser = typeof window !== "undefined";

    if (isBrowser) {
        const result = clientSchema.safeParse({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
            NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        });

        if (!result.success) {
            console.error("❌ Invalid client environment variables:");
            console.error(result.error.flatten().fieldErrors);
            throw new Error("Invalid environment variables");
        }

        return result.data;
    }

    // On server, validate all vars
    const result = envSchema.safeParse({
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
        DATABASE_URL: process.env.DATABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV,
    });

    if (!result.success) {
        console.error("❌ Invalid server environment variables:");
        console.error(z.treeifyError(result.error));
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
