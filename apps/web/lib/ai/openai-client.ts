/**
 * OpenAI Client Lazy Loader
 *
 * Dynamically imports OpenAI SDK only when needed.
 * This prevents the ~400KB OpenAI SDK from being included in the main bundle.
 *
 * PERFORMANCE IMPACT:
 * - Reduces main bundle size by ~400KB
 * - Only loads when AI search is actually used
 * - First AI search will have ~100-200ms additional latency (one-time SDK load)
 *
 * USAGE:
 * ```typescript
 * import { getOpenAIClient } from "@/lib/ai/openai-client";
 *
 * const openai = await getOpenAIClient();
 * const response = await openai.chat.completions.create({...});
 * ```
 */

import type OpenAI from "openai";
import { env } from "@repo/env";

// Cache the OpenAI client after first load
let cachedClient: OpenAI | null = null;

/**
 * Get OpenAI client (lazy loads SDK on first call)
 *
 * @returns OpenAI client instance
 * @throws Error if OPENAI_API_KEY not configured
 */
export async function getOpenAIClient(): Promise<OpenAI> {
  // Return cached client if available
  if (cachedClient) {
    return cachedClient;
  }

  // Validate API key
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is required for AI search"
    );
  }

  // Dynamically import OpenAI SDK
  const { default: OpenAI } = await import("openai");

  // Create and cache client
  cachedClient = new OpenAI({ apiKey });

  return cachedClient;
}

/**
 * Clear cached OpenAI client (useful for testing)
 */
export function clearOpenAICache(): void {
  cachedClient = null;
}
