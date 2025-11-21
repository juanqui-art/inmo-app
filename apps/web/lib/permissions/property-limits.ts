/**
 * Property Limits and Permissions - Freemium Model
 *
 * Helpers to enforce subscription tier limits for properties, images, and features.
 * Used in Server Actions to validate user permissions before operations.
 */

import { db } from '@repo/database'
import type { SubscriptionTier, User } from '@repo/database'

/**
 * Get maximum properties allowed for a subscription tier
 */
export function getPropertyLimit(tier: SubscriptionTier): number {
	switch (tier) {
		case 'FREE':
			return 1
		case 'BASIC':
			return 3
		case 'PRO':
			return 10
		default:
			return 1 // Fallback to most restrictive
	}
}

/**
 * Get maximum images per property for a subscription tier
 */
export function getImageLimit(tier: SubscriptionTier): number {
	switch (tier) {
		case 'FREE':
			return 5
		case 'BASIC':
			return 10
		case 'PRO':
			return 20
		default:
			return 5 // Fallback to most restrictive
	}
}

/**
 * Get featured properties limit per month
 * @returns Number of featured slots, or null for unlimited
 */
export function getFeaturedLimit(tier: SubscriptionTier): number | null {
	switch (tier) {
		case 'FREE':
			return 0 // No featured properties
		case 'BASIC':
			return 3 // 3 featured per month
		case 'PRO':
			return null // Unlimited
		default:
			return 0
	}
}

/**
 * Check if user can create a new property
 * @returns Object with permission status, reason, and limits
 */
export async function canCreateProperty(
	userId: string
): Promise<{ allowed: boolean; reason?: string; limit?: number }> {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { subscriptionTier: true }
	})

	if (!user) {
		return { allowed: false, reason: 'User not found' }
	}

	const limit = getPropertyLimit(user.subscriptionTier)

	const currentCount = await db.property.count({
		where: { agentId: userId }
	})

	if (currentCount >= limit) {
		return {
			allowed: false,
			reason: `Has alcanzado el límite de ${limit} ${limit === 1 ? 'propiedad' : 'propiedades'}. Actualiza tu plan para publicar más.`,
			limit
		}
	}

	return { allowed: true, limit }
}

/**
 * Check if user can upload more images to a property
 * @returns Object with permission status, reason, and limit
 */
export function canUploadImage(
	tier: SubscriptionTier,
	currentImageCount: number
): { allowed: boolean; reason?: string; limit: number } {
	const limit = getImageLimit(tier)

	if (currentImageCount >= limit) {
		return {
			allowed: false,
			reason: `Has alcanzado el límite de ${limit} imágenes. Actualiza tu plan para agregar más.`,
			limit
		}
	}

	return { allowed: true, limit }
}

/**
 * Get tier display name for UI (Spanish)
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
	switch (tier) {
		case 'FREE':
			return 'Gratuito'
		case 'BASIC':
			return 'Básico'
		case 'PRO':
			return 'Pro'
		default:
			return 'Gratuito'
	}
}

/**
 * Get all tier features for display in pricing page or upgrade modals
 */
export function getTierFeatures(tier: SubscriptionTier) {
	const featuredLimit = getFeaturedLimit(tier)

	return {
		tier,
		displayName: getTierDisplayName(tier),
		propertyLimit: getPropertyLimit(tier),
		imageLimit: getImageLimit(tier),
		featuredLimit,
		hasFeatured: featuredLimit !== 0,
		hasUnlimitedFeatured: featuredLimit === null,
		hasAnalytics: tier !== 'FREE',
		support:
			tier === 'PRO'
				? 'WhatsApp (12h)'
				: tier === 'BASIC'
					? 'Email (24h)'
					: 'Email (72h)'
	}
}

/**
 * Get pricing information for each tier
 */
export function getTierPricing(tier: SubscriptionTier): {
	price: number
	currency: string
	period: string
} {
	const prices: Record<SubscriptionTier, number> = {
		FREE: 0,
		BASIC: 4.99,
		PRO: 14.99
	}

	return {
		price: prices[tier],
		currency: 'USD',
		period: 'mes'
	}
}
