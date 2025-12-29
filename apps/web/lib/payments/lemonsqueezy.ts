/**
 * Lemon Squeezy SDK Configuration
 *
 * Provides SDK setup, variant-to-tier mapping, and helper utilities
 * for payment processing.
 */

import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "@repo/env";

let isConfigured = false;

/**
 * Configure Lemon Squeezy SDK
 *
 * Must be called before using any Lemon Squeezy API methods.
 * Safe to call multiple times (only configures once).
 */
export function configureLemonSqueezy() {
	if (isConfigured) return;

	lemonSqueezySetup({
		apiKey: env.LEMONSQUEEZY_API_KEY!,
		onError: (error) => {
			console.error("[LemonSqueezy] API Error:", error);
			throw error;
		},
	});

	isConfigured = true;
}

/**
 * Variant ID to Tier mapping
 *
 * Maps Lemon Squeezy variant IDs to our internal subscription tiers.
 */
export const VARIANT_TO_TIER = {
	[env.LEMONSQUEEZY_PLUS_VARIANT_ID!]: "PLUS",
	[env.LEMONSQUEEZY_BUSINESS_VARIANT_ID!]: "BUSINESS",
	[env.LEMONSQUEEZY_PRO_VARIANT_ID!]: "PRO",
} as const;

/**
 * Tier to Variant ID mapping
 *
 * Maps our internal subscription tiers to Lemon Squeezy variant IDs.
 */
export const TIER_TO_VARIANT = {
	PLUS: env.LEMONSQUEEZY_PLUS_VARIANT_ID!,
	BUSINESS: env.LEMONSQUEEZY_BUSINESS_VARIANT_ID!,
	PRO: env.LEMONSQUEEZY_PRO_VARIANT_ID!,
} as const;

/**
 * Subscription tier type
 */
export type SubscriptionTier = keyof typeof TIER_TO_VARIANT;

/**
 * Get variant ID for a tier
 *
 * @param tier - The subscription tier (PLUS, BUSINESS, PRO)
 * @returns The Lemon Squeezy variant ID
 * @throws Error if tier is not found
 */
export function getVariantIdForTier(tier: SubscriptionTier): string {
	const variantId = TIER_TO_VARIANT[tier];

	if (!variantId) {
		throw new Error(`No variant ID found for tier: ${tier}`);
	}

	return variantId;
}

/**
 * Get tier for a variant ID
 *
 * @param variantId - The Lemon Squeezy variant ID
 * @returns The subscription tier or "FREE" if not found
 */
export function getTierForVariantId(variantId: string): string {
	return VARIANT_TO_TIER[variantId] || "FREE";
}
