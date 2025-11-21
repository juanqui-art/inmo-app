/**
 * TESTS - Property Limits (Freemium Model)
 *
 * Unit tests for subscription tier permission helpers:
 * - getPropertyLimit: Get property limit for a tier
 * - getImageLimit: Get image limit for a tier
 * - getFeaturedLimit: Get featured limit for a tier
 * - canCreateProperty: Check if user can create more properties
 * - canUploadImage: Check if user can upload more images
 * - getTierDisplayName: Get tier name in Spanish
 * - getTierFeatures: Get all features for a tier
 * - getTierPricing: Get pricing info for a tier
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@repo/database";
import type { SubscriptionTier } from "@repo/database";
import {
	getPropertyLimit,
	getImageLimit,
	getFeaturedLimit,
	canCreateProperty,
	canUploadImage,
	getTierDisplayName,
	getTierFeatures,
	getTierPricing,
} from "../permissions/property-limits";

// Mock the database
vi.mock("@repo/database", () => ({
	db: {
		user: {
			findUnique: vi.fn(),
		},
		property: {
			count: vi.fn(),
		},
	},
}));

const mockUserFindUnique = vi.mocked(db.user.findUnique);
const mockPropertyCount = vi.mocked(db.property.count);

describe("Property Limits - Freemium Model", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getPropertyLimit", () => {
		it("should return 1 for FREE tier", () => {
			expect(getPropertyLimit("FREE")).toBe(1);
		});

		it("should return 3 for BASIC tier", () => {
			expect(getPropertyLimit("BASIC")).toBe(3);
		});

		it("should return 10 for PRO tier", () => {
			expect(getPropertyLimit("PRO")).toBe(10);
		});
	});

	describe("getImageLimit", () => {
		it("should return 5 for FREE tier", () => {
			expect(getImageLimit("FREE")).toBe(5);
		});

		it("should return 10 for BASIC tier", () => {
			expect(getImageLimit("BASIC")).toBe(10);
		});

		it("should return 20 for PRO tier", () => {
			expect(getImageLimit("PRO")).toBe(20);
		});
	});

	describe("getFeaturedLimit", () => {
		it("should return 0 for FREE tier (no featured)", () => {
			expect(getFeaturedLimit("FREE")).toBe(0);
		});

		it("should return 3 for BASIC tier", () => {
			expect(getFeaturedLimit("BASIC")).toBe(3);
		});

		it("should return null for PRO tier (unlimited)", () => {
			expect(getFeaturedLimit("PRO")).toBeNull();
		});
	});

	describe("canCreateProperty", () => {
		it("should allow creation when under FREE limit (0/1)", async () => {
			mockUserFindUnique.mockResolvedValue({
				id: "user-123",
				subscriptionTier: "FREE",
			} as any);

			mockPropertyCount.mockResolvedValue(0);

			const result = await canCreateProperty("user-123");

			expect(result.allowed).toBe(true);
			expect(result.limit).toBe(1);
			expect(mockPropertyCount).toHaveBeenCalledWith({
				where: { agentId: "user-123" },
			});
		});

		it("should block creation when at FREE limit (1/1)", async () => {
			mockUserFindUnique.mockResolvedValue({
				id: "user-123",
				subscriptionTier: "FREE",
			} as any);

			mockPropertyCount.mockResolvedValue(1);

			const result = await canCreateProperty("user-123");

			expect(result.allowed).toBe(false);
			expect(result.limit).toBe(1);
			expect(result.reason).toContain("límite");
		});

		it("should allow creation when under BASIC limit (2/3)", async () => {
			mockUserFindUnique.mockResolvedValue({
				id: "user-123",
				subscriptionTier: "BASIC",
			} as any);

			mockPropertyCount.mockResolvedValue(2);

			const result = await canCreateProperty("user-123");

			expect(result.allowed).toBe(true);
			expect(result.limit).toBe(3);
		});

		it("should block creation when at BASIC limit (3/3)", async () => {
			mockUserFindUnique.mockResolvedValue({
				id: "user-123",
				subscriptionTier: "BASIC",
			} as any);

			mockPropertyCount.mockResolvedValue(3);

			const result = await canCreateProperty("user-123");

			expect(result.allowed).toBe(false);
			expect(result.limit).toBe(3);
		});

		it("should allow creation when under PRO limit (9/10)", async () => {
			mockUserFindUnique.mockResolvedValue({
				id: "user-123",
				subscriptionTier: "PRO",
			} as any);

			mockPropertyCount.mockResolvedValue(9);

			const result = await canCreateProperty("user-123");

			expect(result.allowed).toBe(true);
			expect(result.limit).toBe(10);
		});

		it("should block creation when at PRO limit (10/10)", async () => {
			mockUserFindUnique.mockResolvedValue({
				id: "user-123",
				subscriptionTier: "PRO",
			} as any);

			mockPropertyCount.mockResolvedValue(10);

			const result = await canCreateProperty("user-123");

			expect(result.allowed).toBe(false);
			expect(result.limit).toBe(10);
		});

		it("should return error when user not found", async () => {
			mockUserFindUnique.mockResolvedValue(null);

			const result = await canCreateProperty("nonexistent-user");

			expect(result.allowed).toBe(false);
			expect(result.reason).toBe("User not found");
			expect(mockPropertyCount).not.toHaveBeenCalled();
		});
	});

	describe("canUploadImage", () => {
		it("should allow upload when under FREE limit (4/5)", () => {
			const result = canUploadImage("FREE", 4);

			expect(result.allowed).toBe(true);
			expect(result.limit).toBe(5);
		});

		it("should block upload when at FREE limit (5/5)", () => {
			const result = canUploadImage("FREE", 5);

			expect(result.allowed).toBe(false);
			expect(result.limit).toBe(5);
			expect(result.reason).toContain("límite");
		});

		it("should allow upload when under BASIC limit (9/10)", () => {
			const result = canUploadImage("BASIC", 9);

			expect(result.allowed).toBe(true);
			expect(result.limit).toBe(10);
		});

		it("should block upload when at BASIC limit (10/10)", () => {
			const result = canUploadImage("BASIC", 10);

			expect(result.allowed).toBe(false);
			expect(result.limit).toBe(10);
		});

		it("should allow upload when under PRO limit (19/20)", () => {
			const result = canUploadImage("PRO", 19);

			expect(result.allowed).toBe(true);
			expect(result.limit).toBe(20);
		});

		it("should block upload when at PRO limit (20/20)", () => {
			const result = canUploadImage("PRO", 20);

			expect(result.allowed).toBe(false);
			expect(result.limit).toBe(20);
		});
	});

	describe("getTierDisplayName", () => {
		it("should return 'Gratuito' for FREE", () => {
			expect(getTierDisplayName("FREE")).toBe("Gratuito");
		});

		it("should return 'Básico' for BASIC", () => {
			expect(getTierDisplayName("BASIC")).toBe("Básico");
		});

		it("should return 'Pro' for PRO", () => {
			expect(getTierDisplayName("PRO")).toBe("Pro");
		});
	});

	describe("getTierFeatures", () => {
		it("should return correct features for FREE tier", () => {
			const features = getTierFeatures("FREE");

			expect(features).toEqual({
				tier: "FREE",
				displayName: "Gratuito",
				propertyLimit: 1,
				imageLimit: 5,
				featuredLimit: 0,
				hasFeatured: false,
				hasUnlimitedFeatured: false,
				hasAnalytics: false,
				support: "Email (72h)",
			});
		});

		it("should return correct features for BASIC tier", () => {
			const features = getTierFeatures("BASIC");

			expect(features).toEqual({
				tier: "BASIC",
				displayName: "Básico",
				propertyLimit: 3,
				imageLimit: 10,
				featuredLimit: 3,
				hasFeatured: true,
				hasUnlimitedFeatured: false,
				hasAnalytics: true,
				support: "Email (24h)",
			});
		});

		it("should return correct features for PRO tier", () => {
			const features = getTierFeatures("PRO");

			expect(features).toEqual({
				tier: "PRO",
				displayName: "Pro",
				propertyLimit: 10,
				imageLimit: 20,
				featuredLimit: null,
				hasFeatured: true,
				hasUnlimitedFeatured: true,
				hasAnalytics: true,
				support: "WhatsApp (12h)",
			});
		});
	});

	describe("getTierPricing", () => {
		it("should return $0 for FREE tier", () => {
			const pricing = getTierPricing("FREE");

			expect(pricing).toEqual({
				price: 0,
				currency: "USD",
				period: "mes",
			});
		});

		it("should return $4.99 for BASIC tier", () => {
			const pricing = getTierPricing("BASIC");

			expect(pricing).toEqual({
				price: 4.99,
				currency: "USD",
				period: "mes",
			});
		});

		it("should return $14.99 for PRO tier", () => {
			const pricing = getTierPricing("PRO");

			expect(pricing).toEqual({
				price: 14.99,
				currency: "USD",
				period: "mes",
			});
		});
	});
});
