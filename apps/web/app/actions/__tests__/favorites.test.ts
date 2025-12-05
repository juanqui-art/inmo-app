/**
 * TESTS - toggleFavoriteAction
 *
 * Tests for the toggleFavoriteAction Server Action
 */

// Import mocked modules
import { FavoriteRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockUser } from "@/__tests__/utils/test-helpers";
import { getCurrentUser } from "@/lib/auth";
import { toggleFavoriteAction } from "../favorites";

// Get mocked functions
const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockRevalidatePath = vi.mocked(revalidatePath);

// Cast FavoriteRepository to any to access vi.fn() methods
const MockFavoriteRepository = FavoriteRepository as any;

describe("toggleFavoriteAction", () => {
  const mockUser = createMockUser({ role: "CLIENT" });
  const validPropertyId = "123e4567-e89b-12d3-a456-426614174000";

  let mockToggleFavorite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock for toggleFavorite (must be created before clearAllMocks)
    mockToggleFavorite = vi.fn();

    // Reset mocks AFTER creating toggleFavorite
    vi.clearAllMocks();

    // Re-create mockToggleFavorite after clear since clearAllMocks wipes it
    mockToggleFavorite = vi.fn();

    // Use the existing mock from vitest.setup.ts but override with new implementation
    // IMPORTANT: mockImplementation needs a FUNCTION (not arrow function returning object)
    // This function becomes the constructor, so "this" refers to the new instance
    MockFavoriteRepository.mockImplementation(function() {
      return {
        toggleFavorite: mockToggleFavorite,
        getUserFavorites: vi.fn(),
        isFavorite: vi.fn(),
      };
    });

    // Default behavior: user is authenticated
    mockGetCurrentUser.mockResolvedValue(mockUser);
  });

  describe("Authentication", () => {
    it("should require authentication", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result).toEqual({
        success: false,
        error: "Authentication required to manage favorites",
      });
      expect(mockToggleFavorite).not.toHaveBeenCalled();
    });

    it("should work with authenticated user", async () => {
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result).toEqual({
        success: true,
        isFavorite: true,
      });
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("should reject invalid UUID format", async () => {
      const invalidId = "not-a-valid-uuid";

      const result = await toggleFavoriteAction(invalidId);

      expect(result).toEqual({
        success: false,
        error: "Invalid property ID",
      });
      expect(mockToggleFavorite).not.toHaveBeenCalled();
    });

    it("should accept valid UUID", async () => {
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result.success).toBe(true);
      expect(mockToggleFavorite).toHaveBeenCalledWith(
        mockUser.id,
        validPropertyId,
      );
    });

    it("should handle different valid UUID formats", async () => {
      const uuids = [
        "123e4567-e89b-12d3-a456-426614174000",
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "550e8400-e29b-41d4-a716-446655440000",
      ];

      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      for (const uuid of uuids) {
        const result = await toggleFavoriteAction(uuid);
        expect(result.success).toBe(true);
      }

      expect(mockToggleFavorite).toHaveBeenCalledTimes(uuids.length);
    });
  });

  describe("Toggle Functionality", () => {
    it("should add favorite when not already favorited", async () => {
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result).toEqual({
        success: true,
        isFavorite: true,
      });
      expect(mockToggleFavorite).toHaveBeenCalledWith(
        mockUser.id,
        validPropertyId,
      );
    });

    it("should remove favorite when already favorited", async () => {
      mockToggleFavorite.mockResolvedValue({ isFavorite: false });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result).toEqual({
        success: true,
        isFavorite: false,
      });
      expect(mockToggleFavorite).toHaveBeenCalledWith(
        mockUser.id,
        validPropertyId,
      );
    });

    it("should call repository with correct user ID and property ID", async () => {
      const customUser = createMockUser({ id: "custom-user-123" });
      const customPropertyId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

      mockGetCurrentUser.mockResolvedValue(customUser);
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      await toggleFavoriteAction(customPropertyId);

      expect(mockToggleFavorite).toHaveBeenCalledWith(
        "custom-user-123",
        customPropertyId,
      );
    });
  });

  describe("Cache Revalidation", () => {
    it("should revalidate cache after successful toggle", async () => {
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      await toggleFavoriteAction(validPropertyId);

      expect(mockRevalidatePath).toHaveBeenCalledWith("/mapa");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/favoritos");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/perfil/favoritos");
      expect(mockRevalidatePath).toHaveBeenCalledTimes(3);
    });

    it("should not revalidate cache on validation error", async () => {
      const invalidId = "not-a-uuid";

      await toggleFavoriteAction(invalidId);

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });

    it("should not revalidate cache when user not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      await toggleFavoriteAction(validPropertyId);

      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockToggleFavorite.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result).toEqual({
        success: false,
        error: "Database connection failed",
      });
    });

    it("should handle unknown errors", async () => {
      mockToggleFavorite.mockRejectedValue("Unknown error");

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result).toEqual({
        success: false,
        error: "Failed to toggle favorite",
      });
    });

    it("should handle errors gracefully", async () => {
      // Note: We now use structured logger instead of console.error
      // The important behavior is that errors are caught and returned gracefully
      mockToggleFavorite.mockRejectedValue(new Error("Database error"));

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("Different User Roles", () => {
    it("should work for CLIENT role", async () => {
      const clientUser = createMockUser({ role: "CLIENT" });
      mockGetCurrentUser.mockResolvedValue(clientUser);
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result.success).toBe(true);
    });

    it("should work for AGENT role", async () => {
      const agentUser = createMockUser({ role: "AGENT" });
      mockGetCurrentUser.mockResolvedValue(agentUser);
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result.success).toBe(true);
    });

    it("should work for ADMIN role", async () => {
      const adminUser = createMockUser({ role: "ADMIN" });
      mockGetCurrentUser.mockResolvedValue(adminUser);
      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      const result = await toggleFavoriteAction(validPropertyId);

      expect(result.success).toBe(true);
    });
  });

  describe("Multiple Operations", () => {
    it("should handle multiple toggle operations in sequence", async () => {
      // First toggle: add favorite
      mockToggleFavorite.mockResolvedValueOnce({ isFavorite: true });
      const result1 = await toggleFavoriteAction(validPropertyId);
      expect(result1.isFavorite).toBe(true);

      // Second toggle: remove favorite
      mockToggleFavorite.mockResolvedValueOnce({ isFavorite: false });
      const result2 = await toggleFavoriteAction(validPropertyId);
      expect(result2.isFavorite).toBe(false);

      // Third toggle: add favorite again
      mockToggleFavorite.mockResolvedValueOnce({ isFavorite: true });
      const result3 = await toggleFavoriteAction(validPropertyId);
      expect(result3.isFavorite).toBe(true);

      expect(mockToggleFavorite).toHaveBeenCalledTimes(3);
    });

    it("should handle toggling different properties", async () => {
      const property1 = "123e4567-e89b-12d3-a456-426614174000";
      const property2 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

      mockToggleFavorite.mockResolvedValue({ isFavorite: true });

      await toggleFavoriteAction(property1);
      await toggleFavoriteAction(property2);

      expect(mockToggleFavorite).toHaveBeenNthCalledWith(
        1,
        mockUser.id,
        property1,
      );
      expect(mockToggleFavorite).toHaveBeenNthCalledWith(
        2,
        mockUser.id,
        property2,
      );
    });
  });
});
