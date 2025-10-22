/**
 * ENVIRONMENT VARIABLES RE-EXPORT
 *
 * This file re-exports environment variables from @repo/env for backward compatibility.
 * The actual validation and schema is now centralized in the @repo/env package.
 *
 * USAGE:
 * ```typescript
 * import { env } from '@/lib/env'
 *
 * // ✅ Type-safe with autocomplete
 * const url = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 *
 * To modify environment variables:
 * 1. Edit the schema in packages/env/src/index.ts
 * 2. Add to .env.example in the root
 * 3. Add to .env.local with real values
 * 4. Restart: bun run dev
 */

export { env, type Env, type ClientEnv, type ServerEnv } from "@repo/env"
