/**
 * Subscription Server Actions
 *
 * Handles subscription checkout and customer portal access
 * using Lemon Squeezy.
 */

"use server";

import { createCheckout, getCustomer } from "@lemonsqueezy/lemonsqueezy.js";
import { redirect } from "next/navigation";
import { db } from "@repo/database";
import { env } from "@repo/env";
import { getCurrentUser } from "@/lib/auth";
import {
	configureLemonSqueezy,
	getVariantIdForTier,
	type SubscriptionTier,
} from "@/lib/payments/lemonsqueezy";

/**
 * Create a subscription checkout session
 *
 * Redirects the user to Lemon Squeezy hosted checkout.
 * Only available for users with AGENT role.
 *
 * @param tier - The subscription tier (PLUS, BUSINESS, PRO)
 * @throws Error if user is not authenticated or not an agent
 */
export async function createSubscriptionCheckout(tier: SubscriptionTier) {
	// 1. Verify authentication
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login?redirect=/pricing");
	}

	// 2. Verify user is an agent
	if (user.role !== "AGENT") {
		throw new Error("Only agents can subscribe to paid plans");
	}

	// 3. Configure Lemon Squeezy SDK
	configureLemonSqueezy();

	// 4. Get variant ID for tier
	const variantId = getVariantIdForTier(tier);

	// 5. Create checkout session
	const checkout = await createCheckout(
		Number(env.LEMONSQUEEZY_STORE_ID!),
		Number(variantId),
		{
			checkoutData: {
				email: user.email,
				name: user.name || undefined,
				custom: {
					user_id: user.id,
				},
			},
			checkoutOptions: {
				embed: false,
				media: false,
				logo: true,
			},
			expiresAt: null,
			preview: false,
			testMode: true, // TODO: Change to false in production
			productOptions: {
				enabledVariants: [Number(variantId)],
				redirectUrl: `${env.NEXT_PUBLIC_SITE_URL}/dashboard/suscripcion?success=true`,
			},
		},
	);

	// 6. Get checkout URL
	const checkoutUrl = checkout.data?.data.attributes.url;

	if (!checkoutUrl) {
		throw new Error("Failed to create checkout session");
	}

	// 7. Redirect to checkout
	redirect(checkoutUrl);
}

/**
 * Get customer portal URL
 *
 * Returns the URL to Lemon Squeezy customer portal where users can
 * manage their subscription (update payment method, cancel, etc.)
 *
 * @returns The customer portal URL or null if no subscription exists
 * @throws Error if user is not authenticated
 */
export async function getCustomerPortalUrl(): Promise<string | null> {
	// 1. Verify authentication
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	// 2. Get subscription with customer ID
	const subscription = await db.subscription.findUnique({
		where: { userId: user.id },
	});

	if (!subscription?.providerCustomerId) {
		return null;
	}

	// 3. Configure Lemon Squeezy SDK
	configureLemonSqueezy();

	// 4. Get customer data
	const customer = await getCustomer(subscription.providerCustomerId);

	// 5. Return customer portal URL
	return customer.data?.data.attributes.urls.customer_portal || null;
}

/**
 * Cancel subscription
 *
 * Cancels the user's subscription at the end of the current billing period.
 * The subscription will remain active until the period ends.
 *
 * @throws Error if user is not authenticated or has no subscription
 */
export async function cancelSubscription() {
	// 1. Verify authentication
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	// 2. Get customer portal URL
	const portalUrl = await getCustomerPortalUrl();

	if (!portalUrl) {
		throw new Error("No active subscription found");
	}

	// 3. Redirect to customer portal where they can cancel
	// (Lemon Squeezy doesn't have a direct cancel API - must be done via portal)
	redirect(portalUrl);
}
