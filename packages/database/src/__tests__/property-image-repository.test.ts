/**
 * PROPERTY IMAGE REPOSITORY TESTS
 *
 * Tests for property image operations: create, update, delete, query
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client BEFORE importing anything that uses it
vi.mock("../client", () => ({
  db: {
    propertyImage: {
      create: vi.fn(),
      createMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { db } from "../client";
// Now import modules that depend on db
import {
  PropertyImageRepository,
  type CreatePropertyImageInput,
} from "../repositories/property-images";

// Mock data
const mockPropertyId = "prop-123";
const mockImageId = "img-001";

const mockImage = {
  id: mockImageId,
  url: "https://example.com/image1.jpg",
  alt: "Vista frontal",
  order: 0,
  propertyId: mockPropertyId,
  createdAt: new Date("2025-12-01T10:00:00Z"),
  updatedAt: new Date("2025-12-01T10:00:00Z"),
};

const mockImageInput: CreatePropertyImageInput = {
  url: "https://example.com/image1.jpg",
  alt: "Vista frontal",
  order: 0,
  propertyId: mockPropertyId,
};

describe("PropertyImageRepository", () => {
  let repository: PropertyImageRepository;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a fresh repository instance
    repository = new PropertyImageRepository();
  });

  describe("create()", () => {
    it("should create a new image with all fields", async () => {
      // Arrange
      vi.mocked(db.propertyImage.create).mockResolvedValue(mockImage);

      // Act
      const result = await repository.create(mockImageInput);

      // Assert
      expect(db.propertyImage.create).toHaveBeenCalledWith({
        data: mockImageInput,
      });
      expect(result).toEqual(mockImage);
      expect(result.url).toBe("https://example.com/image1.jpg");
      expect(result.alt).toBe("Vista frontal");
      expect(result.order).toBe(0);
    });

    it("should create image without alt text", async () => {
      // Arrange
      const imageWithoutAlt = {
        url: "https://example.com/image2.jpg",
        order: 1,
        propertyId: mockPropertyId,
      };
      const mockResult = { ...mockImage, alt: null, order: 1 };
      vi.mocked(db.propertyImage.create).mockResolvedValue(mockResult);

      // Act
      const result = await repository.create(imageWithoutAlt);

      // Assert
      expect(db.propertyImage.create).toHaveBeenCalledWith({
        data: imageWithoutAlt,
      });
      expect(result.alt).toBeNull();
    });

    it("should handle database errors", async () => {
      // Arrange
      const error = new Error("Database connection failed");
      vi.mocked(db.propertyImage.create).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.create(mockImageInput)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("createMany()", () => {
    it("should create multiple images at once", async () => {
      // Arrange
      const images: CreatePropertyImageInput[] = [
        {
          url: "https://example.com/image1.jpg",
          alt: "Vista 1",
          order: 0,
          propertyId: mockPropertyId,
        },
        {
          url: "https://example.com/image2.jpg",
          alt: "Vista 2",
          order: 1,
          propertyId: mockPropertyId,
        },
        {
          url: "https://example.com/image3.jpg",
          order: 2,
          propertyId: mockPropertyId,
        },
      ];
      const mockResult = { count: 3 };
      vi.mocked(db.propertyImage.createMany).mockResolvedValue(mockResult);

      // Act
      const result = await repository.createMany(images);

      // Assert
      expect(db.propertyImage.createMany).toHaveBeenCalledWith({
        data: images,
      });
      expect(result.count).toBe(3);
    });

    it("should handle empty array", async () => {
      // Arrange
      vi.mocked(db.propertyImage.createMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await repository.createMany([]);

      // Assert
      expect(result.count).toBe(0);
    });

    it("should create images with sequential order", async () => {
      // Arrange
      const images = [
        { url: "img1.jpg", order: 0, propertyId: mockPropertyId },
        { url: "img2.jpg", order: 1, propertyId: mockPropertyId },
        { url: "img3.jpg", order: 2, propertyId: mockPropertyId },
      ];
      vi.mocked(db.propertyImage.createMany).mockResolvedValue({ count: 3 });

      // Act
      await repository.createMany(images);

      // Assert
      expect(db.propertyImage.createMany).toHaveBeenCalledWith({
        data: images,
      });
      // Verify order sequence
      expect(images[0].order).toBe(0);
      expect(images[1].order).toBe(1);
      expect(images[2].order).toBe(2);
    });
  });

  describe("findByProperty()", () => {
    it("should return all images for a property ordered by order field", async () => {
      // Arrange
      const mockImages = [
        { ...mockImage, id: "img-1", order: 0 },
        { ...mockImage, id: "img-2", order: 1 },
        { ...mockImage, id: "img-3", order: 2 },
      ];
      vi.mocked(db.propertyImage.findMany).mockResolvedValue(mockImages);

      // Act
      const result = await repository.findByProperty(mockPropertyId);

      // Assert
      expect(db.propertyImage.findMany).toHaveBeenCalledWith({
        where: { propertyId: mockPropertyId },
        orderBy: { order: "asc" },
      });
      expect(result).toEqual(mockImages);
      expect(result.length).toBe(3);
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });

    it("should return empty array if property has no images", async () => {
      // Arrange
      vi.mocked(db.propertyImage.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.findByProperty(mockPropertyId);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should order images by order field ascending", async () => {
      // Arrange
      vi.mocked(db.propertyImage.findMany).mockResolvedValue([]);

      // Act
      await repository.findByProperty(mockPropertyId);

      // Assert
      expect(db.propertyImage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { order: "asc" },
        })
      );
    });
  });

  describe("findById()", () => {
    it("should return image by ID", async () => {
      // Arrange
      vi.mocked(db.propertyImage.findUnique).mockResolvedValue(mockImage);

      // Act
      const result = await repository.findById(mockImageId);

      // Assert
      expect(db.propertyImage.findUnique).toHaveBeenCalledWith({
        where: { id: mockImageId },
      });
      expect(result).toEqual(mockImage);
      expect(result?.id).toBe(mockImageId);
    });

    it("should return null if image doesn't exist", async () => {
      // Arrange
      vi.mocked(db.propertyImage.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete()", () => {
    it("should delete an image by ID", async () => {
      // Arrange
      vi.mocked(db.propertyImage.delete).mockResolvedValue(mockImage);

      // Act
      const result = await repository.delete(mockImageId);

      // Assert
      expect(db.propertyImage.delete).toHaveBeenCalledWith({
        where: { id: mockImageId },
      });
      expect(result).toEqual(mockImage);
    });

    it("should throw error if image doesn't exist", async () => {
      // Arrange
      const error = new Error("Record not found");
      vi.mocked(db.propertyImage.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.delete("non-existent-id")).rejects.toThrow(
        "Record not found"
      );
    });
  });

  describe("updateOrder()", () => {
    it("should update image order", async () => {
      // Arrange
      const newOrder = 5;
      const updatedImage = { ...mockImage, order: newOrder };
      vi.mocked(db.propertyImage.update).mockResolvedValue(updatedImage);

      // Act
      const result = await repository.updateOrder(mockImageId, newOrder);

      // Assert
      expect(db.propertyImage.update).toHaveBeenCalledWith({
        where: { id: mockImageId },
        data: { order: newOrder },
      });
      expect(result.order).toBe(newOrder);
    });

    it("should update order to 0 (first position)", async () => {
      // Arrange
      const updatedImage = { ...mockImage, order: 0 };
      vi.mocked(db.propertyImage.update).mockResolvedValue(updatedImage);

      // Act
      const result = await repository.updateOrder(mockImageId, 0);

      // Assert
      expect(result.order).toBe(0);
    });

    it("should handle large order numbers", async () => {
      // Arrange
      const largeOrder = 999;
      const updatedImage = { ...mockImage, order: largeOrder };
      vi.mocked(db.propertyImage.update).mockResolvedValue(updatedImage);

      // Act
      const result = await repository.updateOrder(mockImageId, largeOrder);

      // Assert
      expect(result.order).toBe(largeOrder);
    });
  });

  describe("updateManyOrders()", () => {
    it("should update multiple image orders in a transaction", async () => {
      // Arrange
      const updates = [
        { id: "img-1", order: 2 },
        { id: "img-2", order: 0 },
        { id: "img-3", order: 1 },
      ];
      const mockUpdatedImages = updates.map((update) => ({
        ...mockImage,
        id: update.id,
        order: update.order,
      }));
      vi.mocked(db.$transaction).mockResolvedValue(mockUpdatedImages);

      // Act
      const result = await repository.updateManyOrders(updates);

      // Assert
      expect(db.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedImages);
      expect(result[0].order).toBe(2);
      expect(result[1].order).toBe(0);
      expect(result[2].order).toBe(1);
    });

    it("should handle single image order update via transaction", async () => {
      // Arrange
      const updates = [{ id: "img-1", order: 5 }];
      const mockResult = [{ ...mockImage, id: "img-1", order: 5 }];
      vi.mocked(db.$transaction).mockResolvedValue(mockResult);

      // Act
      const result = await repository.updateManyOrders(updates);

      // Assert
      expect(db.$transaction).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].order).toBe(5);
    });

    it("should handle empty updates array", async () => {
      // Arrange
      vi.mocked(db.$transaction).mockResolvedValue([]);

      // Act
      const result = await repository.updateManyOrders([]);

      // Assert
      expect(db.$transaction).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should rollback all updates if one fails", async () => {
      // Arrange
      const updates = [
        { id: "img-1", order: 0 },
        { id: "non-existent", order: 1 },
      ];
      const error = new Error("Transaction failed: Record not found");
      vi.mocked(db.$transaction).mockRejectedValue(error);

      // Act & Assert
      await expect(repository.updateManyOrders(updates)).rejects.toThrow(
        "Transaction failed"
      );
    });
  });

  describe("deleteByProperty()", () => {
    it("should delete all images for a property", async () => {
      // Arrange
      vi.mocked(db.propertyImage.deleteMany).mockResolvedValue({ count: 5 });

      // Act
      const result = await repository.deleteByProperty(mockPropertyId);

      // Assert
      expect(db.propertyImage.deleteMany).toHaveBeenCalledWith({
        where: { propertyId: mockPropertyId },
      });
      expect(result.count).toBe(5);
    });

    it("should return count 0 if property has no images", async () => {
      // Arrange
      vi.mocked(db.propertyImage.deleteMany).mockResolvedValue({ count: 0 });

      // Act
      const result = await repository.deleteByProperty(mockPropertyId);

      // Assert
      expect(result.count).toBe(0);
    });

    it("should handle deleting many images", async () => {
      // Arrange
      vi.mocked(db.propertyImage.deleteMany).mockResolvedValue({ count: 20 });

      // Act
      const result = await repository.deleteByProperty(mockPropertyId);

      // Assert
      expect(result.count).toBe(20);
    });
  });

  describe("countByProperty()", () => {
    it("should return count of images for a property", async () => {
      // Arrange
      vi.mocked(db.propertyImage.count).mockResolvedValue(8);

      // Act
      const result = await repository.countByProperty(mockPropertyId);

      // Assert
      expect(db.propertyImage.count).toHaveBeenCalledWith({
        where: { propertyId: mockPropertyId },
      });
      expect(result).toBe(8);
    });

    it("should return 0 if property has no images", async () => {
      // Arrange
      vi.mocked(db.propertyImage.count).mockResolvedValue(0);

      // Act
      const result = await repository.countByProperty(mockPropertyId);

      // Assert
      expect(result).toBe(0);
    });

    it("should handle large image counts", async () => {
      // Arrange
      vi.mocked(db.propertyImage.count).mockResolvedValue(100);

      // Act
      const result = await repository.countByProperty(mockPropertyId);

      // Assert
      expect(result).toBe(100);
    });
  });
});
