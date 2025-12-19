/**
 * TESTS - Subscription Server Actions
 *
 * Tests for subscription upgrade flow:
 * - Plan validation (PLUS/BUSINESS/PRO accepted, others rejected)
 * - Role promotion (CLIENT → AGENT on subscription)
 * - Role preservation (AGENT stays AGENT, ADMIN stays ADMIN)
 * - Error handling (DB failures)
 * - Path revalidation
 *
 * NOTE: Currently blocked by pre-existing test infrastructure issue
 * where @repo/env validation runs before vitest mocks are applied.
 * See: vitest.setup.ts for attempted fix.
 */

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "@/lib/auth";
import { upgradeSubscriptionAction } from "../subscription";

// Get mocked functions - cast nested mocks properly
const mockRequireAuth = vi.mocked(requireAuth);
const mockDbUserUpdate = db.user.update as ReturnType<typeof vi.fn>;
const mockRevalidatePath = vi.mocked(revalidatePath);

// Test helpers
function createUpgradeFormData(plan: string): FormData {
  const formData = new FormData();
  formData.set("plan", plan);
  return formData;
}

function createMockUser(overrides?: {
  id?: string;
  email?: string;
  role?: "CLIENT" | "AGENT" | "ADMIN";
  subscriptionTier?: "FREE" | "PLUS" | "BUSINESS" | "PRO";
}) {
  return {
    id: overrides?.id || "user-123",
    email: overrides?.email || "user@example.com",
    role: overrides?.role || "CLIENT",
    subscriptionTier: overrides?.subscriptionTier || "FREE",
    name: "Test User",
    phone: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
  };
}

describe("upgradeSubscriptionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock timer for payment simulation delay
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Valid Plans", () => {
    it("should accept PLUS plan and upgrade FREE user", async () => {
      const mockUser = createMockUser({
        role: "CLIENT",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PLUS",
        role: "AGENT", // CLIENT promoted to AGENT
      });

      const formData = createUpgradeFormData("PLUS");

      // Start action (it has a 1s delay)
      const resultPromise = upgradeSubscriptionAction(formData);

      // Fast-forward timers
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "PLUS",
          role: "AGENT", // CLIENT → AGENT promotion
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should accept BUSINESS plan and upgrade FREE user", async () => {
      const mockUser = createMockUser({
        role: "CLIENT",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "BUSINESS",
        role: "AGENT",
      });

      const formData = createUpgradeFormData("BUSINESS");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "BUSINESS",
          role: "AGENT",
        },
      });
    });

    it("should accept PRO plan and upgrade FREE user", async () => {
      const mockUser = createMockUser({
        role: "CLIENT",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PRO",
        role: "AGENT",
      });

      const formData = createUpgradeFormData("PRO");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "PRO",
          role: "AGENT",
        },
      });
    });
  });

  describe("Invalid Plans", () => {
    it("should reject FREE plan", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);

      const formData = createUpgradeFormData("FREE");
      const result = await upgradeSubscriptionAction(formData);

      expect(result.error).toBe("Plan inválido");
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });

    it("should reject BASIC plan (non-existent tier)", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);

      const formData = createUpgradeFormData("BASIC");
      const result = await upgradeSubscriptionAction(formData);

      expect(result.error).toBe("Plan inválido");
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });

    it("should reject random string plan", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);

      const formData = createUpgradeFormData("INVALID_PLAN");
      const result = await upgradeSubscriptionAction(formData);

      expect(result.error).toBe("Plan inválido");
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });

    it("should reject empty plan", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);

      const formData = new FormData(); // No plan set
      const result = await upgradeSubscriptionAction(formData);

      expect(result.error).toBe("Plan inválido");
      expect(mockDbUserUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Role Promotion Logic", () => {
    it("should promote CLIENT to AGENT when subscribing to PLUS", async () => {
      const mockUser = createMockUser({
        role: "CLIENT",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PLUS",
        role: "AGENT",
      });

      const formData = createUpgradeFormData("PLUS");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();

      await resultPromise;

      // Verify CLIENT → AGENT promotion
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "PLUS",
          role: "AGENT", // Promoted from CLIENT
        },
      });
    });

    it("should promote CLIENT to AGENT when subscribing to BUSINESS tier", async () => {
      const mockUser = createMockUser({
        role: "CLIENT",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "BUSINESS",
        role: "AGENT",
      });

      const formData = createUpgradeFormData("BUSINESS");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();

      await resultPromise;

      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "BUSINESS",
          role: "AGENT",
        },
      });
    });

    it("should promote CLIENT to AGENT when subscribing to PRO", async () => {
      const mockUser = createMockUser({
        role: "CLIENT",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PRO",
        role: "AGENT",
      });

      const formData = createUpgradeFormData("PRO");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();

      await resultPromise;

      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "PRO",
          role: "AGENT",
        },
      });
    });

    it("should NOT change AGENT role when upgrading to PRO", async () => {
      const mockUser = createMockUser({
        role: "AGENT",
        subscriptionTier: "BUSINESS",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PRO",
        role: "AGENT", // Stays AGENT
      });

      const formData = createUpgradeFormData("PRO");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();

      await resultPromise;

      // Verify AGENT role is preserved (only tier changes)
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "PRO",
        },
      });
    });

    it("should NOT change ADMIN role when subscribing", async () => {
      const mockUser = createMockUser({
        role: "ADMIN",
        subscriptionTier: "FREE",
      });

      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PRO",
        role: "ADMIN", // Stays ADMIN
      });

      const formData = createUpgradeFormData("PRO");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();

      await resultPromise;

      // Verify only tier changes (ADMIN role is preserved by not being updated)
      expect(mockDbUserUpdate).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          subscriptionTier: "PRO",
        },
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);

      // Simulate DB error
      const dbError = new Error("Database connection failed");
      mockDbUserUpdate.mockRejectedValue(dbError);

      const formData = createUpgradeFormData("PLUS");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.error).toBe("Error al procesar la suscripción");
      expect(result.success).toBeUndefined();
    });

    it("should NOT revalidate path when database fails", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);

      mockDbUserUpdate.mockRejectedValue(new Error("DB Error"));

      const formData = createUpgradeFormData("BUSINESS");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("Path Revalidation", () => {
    it("should revalidate /dashboard on successful upgrade", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PLUS",
      });

      const formData = createUpgradeFormData("PLUS");
      const resultPromise = upgradeSubscriptionAction(formData);
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledTimes(1);
    });
  });

  describe("Payment Simulation", () => {
    it("should simulate 1 second payment delay", async () => {
      const mockUser = createMockUser();
      mockRequireAuth.mockResolvedValue(mockUser);
      mockDbUserUpdate.mockResolvedValue({
        ...mockUser,
        subscriptionTier: "PLUS",
      });

      const formData = createUpgradeFormData("PLUS");

      // Start the action
      const resultPromise = upgradeSubscriptionAction(formData);

      // DB update should NOT have been called yet (waiting for payment)
      expect(mockDbUserUpdate).not.toHaveBeenCalled();

      // Fast-forward past 1 second
      await vi.runAllTimersAsync();

      await resultPromise;

      // Now DB update should have been called
      expect(mockDbUserUpdate).toHaveBeenCalled();
    });
  });
});
