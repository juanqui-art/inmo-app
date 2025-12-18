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

import { db } from "@repo/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canCreateProperty,
  canUploadImage,
  getFeaturedLimit,
  getImageLimit,
  getPropertyLimit,
  getTierDisplayName,
  getTierFeatures,
  getTierPricing,
} from "../permissions/property-limits";

// Unmock property-limits to test real implementation
vi.unmock("@/lib/permissions/property-limits");

// Note: db is already mocked globally in vitest.setup.ts
const mockUserFindUnique = db.user.findUnique as any;
const mockPropertyCount = db.property.count as any;

describe("Property Limits - Freemium Model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPropertyLimit", () => {
    it("should return 1 for FREE tier", () => {
      expect(getPropertyLimit("FREE")).toBe(1);
    });

    it("should return 3 for PLUS tier", () => {
      expect(getPropertyLimit("PLUS")).toBe(3);
    });

    it("should return 10 for AGENT tier", () => {
      expect(getPropertyLimit("AGENT")).toBe(10);
    });

    it("should return 20 for PRO tier", () => {
      expect(getPropertyLimit("PRO")).toBe(20);
    });
  });

  describe("getImageLimit", () => {
    it("should return 6 for FREE tier", () => {
      expect(getImageLimit("FREE")).toBe(6);
    });

    it("should return 10 for PLUS tier", () => {
      expect(getImageLimit("PLUS")).toBe(10);
    });

    it("should return 15 for AGENT tier", () => {
      expect(getImageLimit("AGENT")).toBe(15);
    });

    it("should return 20 for PRO tier", () => {
      expect(getImageLimit("PRO")).toBe(20);
    });
  });

  describe("getFeaturedLimit", () => {
    it("should return 0 for FREE tier (no featured)", () => {
      expect(getFeaturedLimit("FREE")).toBe(0);
    });

    it("should return 1 for PLUS tier", () => {
      expect(getFeaturedLimit("PLUS")).toBe(1);
    });

    it("should return 5 for AGENT tier", () => {
      expect(getFeaturedLimit("AGENT")).toBe(5);
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

    it("should allow creation when under PLUS limit (2/3)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-123",
        subscriptionTier: "PLUS",
      } as any);

      mockPropertyCount.mockResolvedValue(2);

      const result = await canCreateProperty("user-123");

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(3);
    });

    it("should block creation when at PLUS limit (3/3)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-123",
        subscriptionTier: "PLUS",
      } as any);

      mockPropertyCount.mockResolvedValue(3);

      const result = await canCreateProperty("user-123");

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(3);
    });

    it("should allow creation when under AGENT limit (9/10)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-123",
        subscriptionTier: "AGENT",
      } as any);

      mockPropertyCount.mockResolvedValue(9);

      const result = await canCreateProperty("user-123");

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
    });

    it("should block creation when at AGENT limit (10/10)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-123",
        subscriptionTier: "AGENT",
      } as any);

      mockPropertyCount.mockResolvedValue(10);

      const result = await canCreateProperty("user-123");

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(10);
    });

    it("should allow creation when under PRO limit (19/20)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-123",
        subscriptionTier: "PRO",
      } as any);

      mockPropertyCount.mockResolvedValue(19);

      const result = await canCreateProperty("user-123");

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(20);
    });

    it("should block creation when at PRO limit (20/20)", async () => {
      mockUserFindUnique.mockResolvedValue({
        id: "user-123",
        subscriptionTier: "PRO",
      } as any);

      mockPropertyCount.mockResolvedValue(20);

      const result = await canCreateProperty("user-123");

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(20);
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
    it("should allow upload when under FREE limit (5/6)", () => {
      const result = canUploadImage("FREE", 5);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(6);
    });

    it("should block upload when at FREE limit (6/6)", () => {
      const result = canUploadImage("FREE", 6);

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(6);
      expect(result.reason).toContain("límite");
    });

    it("should allow upload when under PLUS limit (9/10)", () => {
      const result = canUploadImage("PLUS", 9);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
    });

    it("should block upload when at PLUS limit (10/10)", () => {
      const result = canUploadImage("PLUS", 10);

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(10);
    });

    it("should allow upload when under AGENT limit (14/15)", () => {
      const result = canUploadImage("AGENT", 14);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(15);
    });

    it("should block upload when at AGENT limit (15/15)", () => {
      const result = canUploadImage("AGENT", 15);

      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(15);
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

    it("should return 'Plus' for PLUS", () => {
      expect(getTierDisplayName("PLUS")).toBe("Plus");
    });

    it("should return 'Agente' for AGENT", () => {
      expect(getTierDisplayName("AGENT")).toBe("Agente");
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
        imageLimit: 6,
        featuredLimit: 0,
        hasFeatured: false,
        hasUnlimitedFeatured: false,
        hasAnalytics: false,
        hasCRM: false,
        hasCRMFull: false,
        support: "Email (72h)",
      });
    });

    it("should return correct features for PLUS tier", () => {
      const features = getTierFeatures("PLUS");

      expect(features).toEqual({
        tier: "PLUS",
        displayName: "Plus",
        propertyLimit: 3,
        imageLimit: 10,
        featuredLimit: 1,
        hasFeatured: true,
        hasUnlimitedFeatured: false,
        hasAnalytics: true,
        hasCRM: false,
        hasCRMFull: false,
        support: "Email (48h)",
      });
    });

    it("should return correct features for AGENT tier", () => {
      const features = getTierFeatures("AGENT");

      expect(features).toEqual({
        tier: "AGENT",
        displayName: "Agente",
        propertyLimit: 10,
        imageLimit: 15,
        featuredLimit: 5,
        hasFeatured: true,
        hasUnlimitedFeatured: false,
        hasAnalytics: true,
        hasCRM: true,
        hasCRMFull: false,
        support: "Email (24h)",
      });
    });

    it("should return correct features for PRO tier", () => {
      const features = getTierFeatures("PRO");

      expect(features).toEqual({
        tier: "PRO",
        displayName: "Pro",
        propertyLimit: 20,
        imageLimit: 20,
        featuredLimit: null,
        hasFeatured: true,
        hasUnlimitedFeatured: true,
        hasAnalytics: true,
        hasCRM: true,
        hasCRMFull: true,
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

    it("should return $9.99 for PLUS tier", () => {
      const pricing = getTierPricing("PLUS");

      expect(pricing).toEqual({
        price: 9.99,
        currency: "USD",
        period: "mes",
      });
    });

    it("should return $29.99 for AGENT tier", () => {
      const pricing = getTierPricing("AGENT");

      expect(pricing).toEqual({
        price: 29.99,
        currency: "USD",
        period: "mes",
      });
    });

    it("should return $59.99 for PRO tier", () => {
      const pricing = getTierPricing("PRO");

      expect(pricing).toEqual({
        price: 59.99,
        currency: "USD",
        period: "mes",
      });
    });
  });
});
