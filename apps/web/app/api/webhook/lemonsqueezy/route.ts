/**
 * Lemon Squeezy Webhook Handler
 *
 * Processes subscription events from Lemon Squeezy and syncs them
 * to our database.
 *
 * Events handled:
 * - subscription_created
 * - subscription_updated
 * - subscription_resumed
 * - subscription_cancelled
 * - subscription_expired
 * - subscription_payment_success
 * - subscription_payment_failed
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@repo/database";
import { env } from "@repo/env";
import { getTierForVariantId } from "@/lib/payments/lemonsqueezy";
import { logger } from "@/lib/utils/logger";

// Webhook event types
type WebhookEventName =
	| "subscription_created"
	| "subscription_updated"
	| "subscription_cancelled"
	| "subscription_resumed"
	| "subscription_expired"
	| "subscription_payment_success"
	| "subscription_payment_failed";

// Lemon Squeezy subscription status
type LemonSqueezyStatus =
	| "on_trial"
	| "active"
	| "paused"
	| "past_due"
	| "unpaid"
	| "cancelled"
	| "expired";

// Webhook payload structure
interface WebhookPayload {
	meta: {
		event_name: WebhookEventName;
		custom_data?: {
			user_id: string;
		};
	};
	data: {
		id: string;
		type: string;
		attributes: {
			store_id: number;
			customer_id: number;
			order_id: number;
			product_id: number;
			variant_id: number;
			status: LemonSqueezyStatus;
			card_brand: string | null;
			card_last_four: string | null;
			renews_at: string | null;
			ends_at: string | null;
			trial_ends_at: string | null;
			created_at: string;
			updated_at: string;
		};
	};
}

export async function POST(request: NextRequest) {
	try {
		const rawBody = await request.text();
		const signature = request.headers.get("X-Signature");

		logger.info("[Webhook] Received Lemon Squeezy webhook");

		// 1. Verify signature
		if (!signature || !verifySignature(rawBody, signature)) {
			logger.error("[Webhook] Invalid signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// 2. Parse payload
		const payload: WebhookPayload = JSON.parse(rawBody);
		const { event_name, custom_data } = payload.meta;
		const { attributes, id: subscriptionId } = payload.data;

		logger.info({
			event: event_name,
			subscriptionId,
			userId: custom_data?.user_id,
		});

		// 3. Get user_id from custom_data
		const userId = custom_data?.user_id;
		if (!userId) {
			logger.error("[Webhook] Missing user_id in custom_data");
			return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
		}

		// 4. Process event
		switch (event_name) {
			case "subscription_created":
				await handleSubscriptionCreated(userId, subscriptionId, attributes);
				break;

			case "subscription_updated":
			case "subscription_resumed":
				await handleSubscriptionActive(userId, subscriptionId, attributes);
				break;

			case "subscription_cancelled":
			case "subscription_expired":
				await handleSubscriptionInactive(userId, subscriptionId, attributes);
				break;

			case "subscription_payment_failed":
				await handlePaymentFailed(userId, subscriptionId, attributes);
				break;

			case "subscription_payment_success":
				logger.info(`[Webhook] Payment success for user ${userId}`);
				break;

			default:
				logger.warn(`[Webhook] Unhandled event: ${event_name}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		logger.error({ err: error }, "[Webhook] Error processing webhook");
		return NextResponse.json({ error: "Webhook error" }, { status: 500 });
	}
}

/**
 * Verify webhook signature
 *
 * Uses HMAC-SHA256 to verify the webhook is from Lemon Squeezy.
 */
function verifySignature(rawBody: string, signature: string): boolean {
	const hmac = crypto
		.createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET!)
		.update(rawBody)
		.digest("hex");

	try {
		return crypto.timingSafeEqual(
			Buffer.from(hmac, "hex"),
			Buffer.from(signature, "hex"),
		);
	} catch {
		return false;
	}
}

/**
 * Map Lemon Squeezy status to our internal status
 */
function mapStatus(lsStatus: LemonSqueezyStatus): string {
	const statusMap: Record<LemonSqueezyStatus, string> = {
		on_trial: "TRIALING",
		active: "ACTIVE",
		paused: "PAUSED",
		past_due: "PAST_DUE",
		unpaid: "PAST_DUE",
		cancelled: "CANCELLED",
		expired: "EXPIRED",
	};
	return statusMap[lsStatus] || "ACTIVE";
}

/**
 * Handle subscription_created event
 *
 * Creates a new subscription record in our database.
 */
async function handleSubscriptionCreated(
	userId: string,
	subscriptionId: string,
	attributes: WebhookPayload["data"]["attributes"],
): Promise<void> {
	const tier = getTierForVariantId(String(attributes.variant_id));

	await db.subscription.upsert({
		where: { userId },
		create: {
			userId,
			tier: tier as any,
			status: mapStatus(attributes.status) as any,
			provider: "lemonsqueezy",
			providerCustomerId: String(attributes.customer_id),
			providerSubscriptionId: subscriptionId,
			providerProductId: String(attributes.product_id),
			providerVariantId: String(attributes.variant_id),
			currentPeriodEnd: attributes.renews_at
				? new Date(attributes.renews_at)
				: null,
			trialEndsAt: attributes.trial_ends_at
				? new Date(attributes.trial_ends_at)
				: null,
			cardBrand: attributes.card_brand,
			cardLastFour: attributes.card_last_four,
		},
		update: {
			tier: tier as any,
			status: mapStatus(attributes.status) as any,
			providerSubscriptionId: subscriptionId,
			currentPeriodEnd: attributes.renews_at
				? new Date(attributes.renews_at)
				: null,
			cardBrand: attributes.card_brand,
			cardLastFour: attributes.card_last_four,
		},
	});

	logger.info(`[Webhook] Subscription created for user ${userId}: ${tier}`);
}

/**
 * Handle subscription_updated/resumed events
 *
 * Updates an existing subscription in our database.
 */
async function handleSubscriptionActive(
	userId: string,
	_subscriptionId: string,
	attributes: WebhookPayload["data"]["attributes"],
): Promise<void> {
	const tier = getTierForVariantId(String(attributes.variant_id));

	await db.subscription.update({
		where: { userId },
		data: {
			tier: tier as any,
			status: mapStatus(attributes.status) as any,
			currentPeriodEnd: attributes.renews_at
				? new Date(attributes.renews_at)
				: null,
			cardBrand: attributes.card_brand,
			cardLastFour: attributes.card_last_four,
			cancelledAt: null, // Clear if resumed
		},
	});

	logger.info(`[Webhook] Subscription active for user ${userId}: ${tier}`);
}

/**
 * Handle subscription_cancelled/expired events
 *
 * Marks subscription as cancelled and downgrades to FREE tier.
 */
async function handleSubscriptionInactive(
	userId: string,
	_subscriptionId: string,
	attributes: WebhookPayload["data"]["attributes"],
): Promise<void> {
	await db.subscription.update({
		where: { userId },
		data: {
			tier: "FREE",
			status: mapStatus(attributes.status) as any,
			currentPeriodEnd: attributes.ends_at ? new Date(attributes.ends_at) : null,
			cancelledAt: new Date(),
		},
	});

	logger.info(`[Webhook] Subscription inactive for user ${userId}`);
}

/**
 * Handle subscription_payment_failed event
 *
 * Marks subscription as past due.
 */
async function handlePaymentFailed(
	userId: string,
	_subscriptionId: string,
	_attributes: WebhookPayload["data"]["attributes"],
): Promise<void> {
	await db.subscription.update({
		where: { userId },
		data: {
			status: "PAST_DUE",
		},
	});

	logger.warn(`[Webhook] Payment failed for user ${userId}`);

	// TODO: Send email notification to user
}
