/**
 * TESTS - createPropertyAction
 *
 * Tests for the createPropertyAction Server Action
 */

// Import mocked modules to get access to their mocked functions
import { propertyRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockFormData,
  createMockUser,
  createValidPropertyData,
} from "@/__tests__/utils/test-helpers";
import { requireRole } from "@/lib/auth";
import { createPropertyAction } from "../properties";

// Get mocked functions
const mockPropertyRepositoryCreate = vi.mocked(propertyRepository.create);
const mockRequireRole = vi.mocked(requireRole);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockRedirect = vi.mocked(redirect);

describe("createPropertyAction", () => {
  const mockUser = createMockUser({ role: "AGENT" });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default behavior: user is authenticated as AGENT
    mockRequireRole.mockResolvedValue(mockUser);
  });

  describe("Authentication & Authorization", () => {
    it("should require AGENT or ADMIN role", async () => {
      const formData = createMockFormData(createValidPropertyData());

      await expect(async () => {
        await createPropertyAction(null, formData);
      }).rejects.toThrow();

      expect(mockRequireRole).toHaveBeenCalledWith(["AGENT", "ADMIN"]);
    });

    it("should reject requests from CLIENT role", async () => {
      mockRequireRole.mockRejectedValue(new Error("NEXT_REDIRECT: /perfil"));

      const formData = createMockFormData(createValidPropertyData());

      await expect(async () => {
        await createPropertyAction(null, formData);
      }).rejects.toThrow();
    });
  });

  describe("Validation", () => {
    it("should reject invalid data - missing required fields", async () => {
      const formData = createMockFormData({
        title: "Short", // Too short
        description: "Also short", // Too short
        price: 100,
        transactionType: "SALE",
        category: "HOUSE",
      });

      const result = await createPropertyAction(null, formData);

      expect(result).toHaveProperty("error");
      expect(result.error).toBeDefined();
      expect(mockPropertyRepositoryCreate).not.toHaveBeenCalled();
    });

    it("should reject negative prices", async () => {
      const formData = createMockFormData(
        createValidPropertyData({ price: -100 }),
      );

      const result = await createPropertyAction(null, formData);

      expect(result).toHaveProperty("error");
      expect(mockPropertyRepositoryCreate).not.toHaveBeenCalled();
    });

    it("should reject invalid category", async () => {
      const formData = createMockFormData(
        createValidPropertyData({ category: "INVALID_CATEGORY" }),
      );

      const result = await createPropertyAction(null, formData);

      expect(result).toHaveProperty("error");
      expect(mockPropertyRepositoryCreate).not.toHaveBeenCalled();
    });

    it("should reject extremely high prices", async () => {
      const formData = createMockFormData(
        createValidPropertyData({ price: 2000000000 }), // 2 billion
      );

      const result = await createPropertyAction(null, formData);

      expect(result).toHaveProperty("error");
      expect(mockPropertyRepositoryCreate).not.toHaveBeenCalled();
    });
  });

  describe("Successful Creation", () => {
    it("should create property with valid data", async () => {
      const propertyData = createValidPropertyData();
      const formData = createMockFormData(propertyData);

      const mockCreatedProperty = {
        id: "new-property-id",
        slug: "casa-en-venta-con-jardin",
        agentId: mockUser.id,
        ...propertyData,
        status: "AVAILABLE" as const,
        price: 250000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropertyRepositoryCreate.mockResolvedValue(
        mockCreatedProperty as any,
      );

      try {
        await createPropertyAction(null, formData);
      } catch (error) {
        // Expect redirect to throw
        expect((error as Error).message).toContain("NEXT_REDIRECT");
      }

      expect(mockPropertyRepositoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: propertyData.title,
          description: propertyData.description,
          price: propertyData.price,
          transactionType: propertyData.transactionType,
          category: propertyData.category,
        }),
        mockUser.id,
      );
    });

    it("should revalidate cache after successful creation", async () => {
      const formData = createMockFormData(createValidPropertyData());

      mockPropertyRepositoryCreate.mockResolvedValue({
        id: "new-property-id",
        slug: "test-property",
      } as any);

      try {
        await createPropertyAction(null, formData);
      } catch (_error) {
        // Expect redirect to throw
      }

      expect(mockRevalidatePath).toHaveBeenCalledWith("/mapa");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard/propiedades");
    });

    it("should redirect to dashboard after successful creation", async () => {
      const formData = createMockFormData(createValidPropertyData());

      mockPropertyRepositoryCreate.mockResolvedValue({
        id: "new-property-id",
      } as any);

      try {
        await createPropertyAction(null, formData);
      } catch (error) {
        expect((error as Error).message).toContain("/dashboard/propiedades");
      }

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard/propiedades");
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const formData = createMockFormData(createValidPropertyData());

      mockPropertyRepositoryCreate.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const result = await createPropertyAction(null, formData);

      expect(result).toEqual({
        error: {
          general: "Database connection failed",
        },
      });
    });

    it("should handle unknown errors", async () => {
      const formData = createMockFormData(createValidPropertyData());

      mockPropertyRepositoryCreate.mockRejectedValue("Unknown error");

      const result = await createPropertyAction(null, formData);

      expect(result).toEqual({
        error: {
          general: "Error al crear la propiedad",
        },
      });
    });
  });

  describe("Optional Fields", () => {
    it("should accept property without optional fields", async () => {
      const formData = createMockFormData({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      mockPropertyRepositoryCreate.mockResolvedValue({
        id: "new-property-id",
      } as any);

      try {
        await createPropertyAction(null, formData);
      } catch (_error) {
        // Expect redirect
      }

      expect(mockPropertyRepositoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Casa en venta",
          bedrooms: undefined,
          bathrooms: undefined,
          area: undefined,
        }),
        mockUser.id,
      );
    });

    it("should include optional fields when provided", async () => {
      const propertyData = createValidPropertyData({
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
      });

      const formData = createMockFormData(propertyData);

      mockPropertyRepositoryCreate.mockResolvedValue({
        id: "new-property-id",
      } as any);

      try {
        await createPropertyAction(null, formData);
      } catch (_error) {
        // Expect redirect
      }

      expect(mockPropertyRepositoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          bedrooms: 4,
          bathrooms: 3,
          area: 200,
        }),
        mockUser.id,
      );
    });
  });

  describe("Transaction Types", () => {
    it("should accept SALE transaction type", async () => {
      const formData = createMockFormData(
        createValidPropertyData({ transactionType: "SALE" }),
      );

      mockPropertyRepositoryCreate.mockResolvedValue({
        id: "new-property-id",
      } as any);

      try {
        await createPropertyAction(null, formData);
      } catch (_error) {
        // Expect redirect
      }

      expect(mockPropertyRepositoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: "SALE",
        }),
        mockUser.id,
      );
    });

    it("should accept RENT transaction type", async () => {
      const formData = createMockFormData(
        createValidPropertyData({ transactionType: "RENT", price: 1500 }),
      );

      mockPropertyRepositoryCreate.mockResolvedValue({
        id: "new-property-id",
      } as any);

      try {
        await createPropertyAction(null, formData);
      } catch (_error) {
        // Expect redirect
      }

      expect(mockPropertyRepositoryCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: "RENT",
          price: 1500,
        }),
        mockUser.id,
      );
    });
  });
});
