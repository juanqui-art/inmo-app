/**
 * FAVORITE REPOSITORY TESTS
 *
 * Tests for favorite operations: add, remove, toggle, list
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client BEFORE importing anything that uses it
vi.mock("../client", () => ({
  db: {
    favorite: {
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { db } from "../client";
// Now import modules that depend on db
import { FavoriteRepository, favoriteSelect } from "../repositories/favorites";

// Mock data
const mockUserId = "user-123";
const mockPropertyId = "prop-456";
const mockFavoriteId = "fav-789";

const mockFavorite = {
  id: mockFavoriteId,
  userId: mockUserId,
  propertyId: mockPropertyId,
  createdAt: new Date("2025-12-01T10:00:00Z"),
};

const mockFavoriteWithProperty = {
  id: mockFavoriteId,
  userId: mockUserId,
  propertyId: mockPropertyId,
  createdAt: new Date("2025-12-01T10:00:00Z"),
  property: {
    id: mockPropertyId,
    title: "Casa en venta",
    price: 150000,
    transactionType: "SALE" as const,
    category: "HOUSE" as const,
    city: "Cuenca",
    images: [
      {
        url: "https://example.com/image1.jpg",
        alt: "Casa frente",
      },
    ],
  },
};

describe("FavoriteRepository", () => {
  let repository: FavoriteRepository;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a fresh repository instance
    repository = new FavoriteRepository();
  });

  describe("addFavorite()", () => {
    it("should create a new favorite successfully", async () => {
      // Arrange
      vi.mocked(db.favorite.create).mockResolvedValue(mockFavorite);

      // Act
      const result = await repository.addFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(db.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          propertyId: mockPropertyId,
        },
        select: favoriteSelect,
      });
      expect(result).toEqual(mockFavorite);
      expect(result.userId).toBe(mockUserId);
      expect(result.propertyId).toBe(mockPropertyId);
    });

    it("should throw error if favorite already exists (unique constraint)", async () => {
      // Arrange
      const error = new Error("Unique constraint failed on the fields: (`userId`,`propertyId`)");
      vi.mocked(db.favorite.create).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.addFavorite(mockUserId, mockPropertyId)
      ).rejects.toThrow("Unique constraint failed");
    });

    it("should handle database connection errors", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      vi.mocked(db.favorite.create).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.addFavorite(mockUserId, mockPropertyId)
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("removeFavorite()", () => {
    it("should delete a favorite successfully", async () => {
      // Arrange
      vi.mocked(db.favorite.deleteMany).mockResolvedValue({ count: 1 });

      // Act
      const result = await repository.removeFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(db.favorite.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          propertyId: mockPropertyId,
        },
      });
      expect(result.count).toBe(1);
    });

    it("should return count 0 if favorite doesn't exist", async () => {
      // Arrange
      vi.mocked(db.favorite.deleteMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await repository.removeFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(result.count).toBe(0);
    });

    it("should handle multiple deletions correctly", async () => {
      // Arrange (edge case: shouldn't happen with unique constraint, but testing deleteMany)
      vi.mocked(db.favorite.deleteMany).mockResolvedValue({ count: 2 });

      // Act
      const result = await repository.removeFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(result.count).toBe(2);
    });
  });

  describe("toggleFavorite()", () => {
    it("should add favorite if it doesn't exist", async () => {
      // Arrange: Favorite doesn't exist
      vi.mocked(db.favorite.findUnique).mockResolvedValue(null);
      vi.mocked(db.favorite.create).mockResolvedValue(mockFavorite);

      // Act
      const result = await repository.toggleFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(db.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_propertyId: {
            userId: mockUserId,
            propertyId: mockPropertyId,
          },
        },
      });
      expect(db.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          propertyId: mockPropertyId,
        },
      });
      expect(result.isFavorite).toBe(true);
    });

    it("should remove favorite if it exists", async () => {
      // Arrange: Favorite exists
      vi.mocked(db.favorite.findUnique).mockResolvedValue(mockFavorite);
      vi.mocked(db.favorite.delete).mockResolvedValue(mockFavorite);

      // Act
      const result = await repository.toggleFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(db.favorite.findUnique).toHaveBeenCalled();
      expect(db.favorite.delete).toHaveBeenCalledWith({
        where: {
          id: mockFavoriteId,
        },
      });
      expect(db.favorite.create).not.toHaveBeenCalled();
      expect(result.isFavorite).toBe(false);
    });

    it("should handle toggle when favorite exists with different ID", async () => {
      // Arrange
      const differentFavorite = { ...mockFavorite, id: "different-id" };
      vi.mocked(db.favorite.findUnique).mockResolvedValue(differentFavorite);
      vi.mocked(db.favorite.delete).mockResolvedValue(differentFavorite);

      // Act
      const result = await repository.toggleFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(db.favorite.delete).toHaveBeenCalledWith({
        where: { id: "different-id" },
      });
      expect(result.isFavorite).toBe(false);
    });
  });

  describe("isFavorite()", () => {
    it("should return true if favorite exists", async () => {
      // Arrange
      vi.mocked(db.favorite.findUnique).mockResolvedValue(mockFavorite);

      // Act
      const result = await repository.isFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(db.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_propertyId: {
            userId: mockUserId,
            propertyId: mockPropertyId,
          },
        },
      });
      expect(result).toBe(true);
    });

    it("should return false if favorite doesn't exist", async () => {
      // Arrange
      vi.mocked(db.favorite.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.isFavorite(mockUserId, mockPropertyId);

      // Assert
      expect(result).toBe(false);
    });

    it("should handle different user-property combinations", async () => {
      // Arrange
      const otherUserId = "user-999";
      vi.mocked(db.favorite.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.isFavorite(otherUserId, mockPropertyId);

      // Assert
      expect(db.favorite.findUnique).toHaveBeenCalledWith({
        where: {
          userId_propertyId: {
            userId: otherUserId,
            propertyId: mockPropertyId,
          },
        },
      });
      expect(result).toBe(false);
    });
  });

  describe("getUserFavorites()", () => {
    it("should return user favorites with property data", async () => {
      // Arrange
      const mockFavorites = [mockFavoriteWithProperty];
      vi.mocked(db.favorite.findMany).mockResolvedValue(mockFavorites as any);

      // Act
      const result = await repository.getUserFavorites(mockUserId);

      // Assert
      expect(db.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              transactionType: true,
              category: true,
              city: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: undefined,
        take: undefined,
      });
      expect(result).toEqual(mockFavorites);
      expect(result[0].property.title).toBe("Casa en venta");
    });

    it("should support pagination with skip and take", async () => {
      // Arrange
      vi.mocked(db.favorite.findMany).mockResolvedValue([]);

      // Act
      await repository.getUserFavorites(mockUserId, {
        skip: 10,
        take: 20,
      });

      // Assert
      expect(db.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 20,
        })
      );
    });

    it("should return empty array if user has no favorites", async () => {
      // Arrange
      vi.mocked(db.favorite.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.getUserFavorites(mockUserId);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should order favorites by createdAt desc (newest first)", async () => {
      // Arrange
      const favorite1 = {
        ...mockFavoriteWithProperty,
        id: "fav-1",
        createdAt: new Date("2025-12-01T10:00:00Z"),
      };
      const favorite2 = {
        ...mockFavoriteWithProperty,
        id: "fav-2",
        createdAt: new Date("2025-12-02T10:00:00Z"),
      };
      vi.mocked(db.favorite.findMany).mockResolvedValue([favorite2, favorite1] as any);

      // Act
      const result = await repository.getUserFavorites(mockUserId);

      // Assert
      expect(db.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        })
      );
      // Verify order (newest first)
      expect(result[0].id).toBe("fav-2");
      expect(result[1].id).toBe("fav-1");
    });
  });

  describe("getFavoriteCount()", () => {
    it("should return the count of favorites for a property", async () => {
      // Arrange
      vi.mocked(db.favorite.count).mockResolvedValue(24);

      // Act
      const result = await repository.getFavoriteCount(mockPropertyId);

      // Assert
      expect(db.favorite.count).toHaveBeenCalledWith({
        where: { propertyId: mockPropertyId },
      });
      expect(result).toBe(24);
    });

    it("should return 0 if property has no favorites", async () => {
      // Arrange
      vi.mocked(db.favorite.count).mockResolvedValue(0);

      // Act
      const result = await repository.getFavoriteCount(mockPropertyId);

      // Assert
      expect(result).toBe(0);
    });

    it("should handle high favorite counts", async () => {
      // Arrange
      vi.mocked(db.favorite.count).mockResolvedValue(9999);

      // Act
      const result = await repository.getFavoriteCount(mockPropertyId);

      // Assert
      expect(result).toBe(9999);
    });
  });

  describe("getFavoriteCountBatch()", () => {
    it("should return counts for multiple properties", async () => {
      // Arrange
      const propertyIds = ["prop-1", "prop-2", "prop-3"];
      const mockGroupByResult = [
        { propertyId: "prop-1", _count: 5 },
        { propertyId: "prop-2", _count: 10 },
        { propertyId: "prop-3", _count: 0 },
      ];
      vi.mocked(db.favorite.groupBy).mockResolvedValue(mockGroupByResult as any);

      // Act
      const result = await repository.getFavoriteCountBatch(propertyIds);

      // Assert
      expect(db.favorite.groupBy).toHaveBeenCalledWith({
        by: ["propertyId"],
        where: {
          propertyId: {
            in: propertyIds,
          },
        },
        _count: true,
      });
      expect(result).toEqual({
        "prop-1": 5,
        "prop-2": 10,
        "prop-3": 0,
      });
    });

    it("should return 0 for properties with no favorites", async () => {
      // Arrange
      const propertyIds = ["prop-1", "prop-2"];
      vi.mocked(db.favorite.groupBy).mockResolvedValue([
        { propertyId: "prop-1", _count: 5 },
        // prop-2 has no results from groupBy
      ] as any);

      // Act
      const result = await repository.getFavoriteCountBatch(propertyIds);

      // Assert
      expect(result["prop-1"]).toBe(5);
      expect(result["prop-2"]).toBe(0); // Should default to 0
    });

    it("should handle empty property list", async () => {
      // Arrange
      vi.mocked(db.favorite.groupBy).mockResolvedValue([]);

      // Act
      const result = await repository.getFavoriteCountBatch([]);

      // Assert
      expect(result).toEqual({});
    });

    it("should handle single property in batch", async () => {
      // Arrange
      vi.mocked(db.favorite.groupBy).mockResolvedValue([
        { propertyId: "prop-1", _count: 3 },
      ] as any);

      // Act
      const result = await repository.getFavoriteCountBatch(["prop-1"]);

      // Assert
      expect(result).toEqual({ "prop-1": 3 });
    });
  });

  describe("clearUserFavorites()", () => {
    it("should delete all favorites for a user", async () => {
      // Arrange
      vi.mocked(db.favorite.deleteMany).mockResolvedValue({ count: 5 });

      // Act
      const result = await repository.clearUserFavorites(mockUserId);

      // Assert
      expect(db.favorite.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result.count).toBe(5);
    });

    it("should return count 0 if user has no favorites", async () => {
      // Arrange
      vi.mocked(db.favorite.deleteMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await repository.clearUserFavorites(mockUserId);

      // Assert
      expect(result.count).toBe(0);
    });

    it("should handle clearing favorites for user with many favorites", async () => {
      // Arrange
      vi.mocked(db.favorite.deleteMany).mockResolvedValue({ count: 100 });

      // Act
      const result = await repository.clearUserFavorites(mockUserId);

      // Assert
      expect(result.count).toBe(100);
    });
  });
});
