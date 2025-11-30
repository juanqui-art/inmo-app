/**
 * PROPERTY REPOSITORY TESTS
 *
 * Tests for create, update, and delete operations with authorization
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database client BEFORE importing anything that uses it
vi.mock("../client", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    property: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { db } from "../client";
// Now import modules that depend on db
import { PropertyRepository, propertySelect } from "../repositories/properties";
import {
  mockProperty,
  mockPropertyWithRelations,
  mockUsers,
  validPropertyData,
  validUpdateData,
} from "./helpers/fixtures";

describe("PropertyRepository", () => {
  let repository: PropertyRepository;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a fresh repository instance
    repository = new PropertyRepository();
  });

  describe("create()", () => {
    it("should create a property when user is an AGENT", async () => {
      // Arrange: Setup mocks
      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.agent),
        },
        property: {
          create: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
      };

      // Mock the transaction
      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act: Create property
      const result = await repository.create(
        validPropertyData,
        mockUsers.agent.id,
      );

      // Assert: Verify user authorization check
      expect(mockTx.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUsers.agent.id },
        select: { role: true },
      });

      // Assert: Verify property creation with agent ID
      expect(mockTx.property.create).toHaveBeenCalledWith({
        data: {
          ...validPropertyData,
          agentId: mockUsers.agent.id,
        },
        select: propertySelect,
      });

      // Assert: Verify result
      expect(result).toEqual(mockPropertyWithRelations);
    });

    it("should create a property when user is an ADMIN", async () => {
      // Arrange: Setup mocks for admin user
      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.admin),
        },
        property: {
          create: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act: Create property as admin
      const result = await repository.create(
        validPropertyData,
        mockUsers.admin.id,
      );

      // Assert: Verify creation succeeded
      expect(mockTx.property.create).toHaveBeenCalled();
      expect(result).toEqual(mockPropertyWithRelations);
    });

    it("should reject creation when user is a CLIENT", async () => {
      // Arrange: Setup mocks for client user
      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.client),
        },
        property: {
          create: vi.fn(),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.create(validPropertyData, mockUsers.client.id),
      ).rejects.toThrow("Unauthorized: Only agents can create properties");

      // Assert: Verify property was not created
      expect(mockTx.property.create).not.toHaveBeenCalled();
    });

    it("should reject creation when user does not exist", async () => {
      // Arrange: Setup mocks for non-existent user
      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
        property: {
          create: vi.fn(),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.create(validPropertyData, "nonexistent-user-id"),
      ).rejects.toThrow("Unauthorized: Only agents can create properties");

      // Assert: Verify property was not created
      expect(mockTx.property.create).not.toHaveBeenCalled();
    });

    it("should ensure agentId is set to current user (not spoofable)", async () => {
      // Arrange: Try to create property with different agentId in data
      const mockTx = {
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.agent),
        },
        property: {
          create: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      const maliciousData = {
        ...validPropertyData,
        agentId: "attacker-agent-id", // Try to spoof another agent
      };

      // Act: Create property
      await repository.create(maliciousData as any, mockUsers.agent.id);

      // Assert: Verify agentId was overridden with current user
      expect(mockTx.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          agentId: mockUsers.agent.id, // Should be current user, not spoofed ID
        }),
        select: propertySelect,
      });
    });
  });

  describe("update()", () => {
    it("should update property when user is the owner", async () => {
      // Arrange: Setup mocks for property owner
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          update: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.agent),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act: Update property
      const result = await repository.update(
        mockProperty.id,
        validUpdateData,
        mockUsers.agent.id,
      );

      // Assert: Verify property lookup
      expect(mockTx.property.findUnique).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        select: { agentId: true },
      });

      // Assert: Verify update was called
      expect(mockTx.property.update).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        data: validUpdateData,
        select: propertySelect,
      });

      // Assert: Verify result
      expect(result).toEqual(mockPropertyWithRelations);
    });

    it("should update property when user is an ADMIN (even if not owner)", async () => {
      // Arrange: Setup mocks for admin updating another agent's property
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          update: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.admin),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act: Update property as admin
      const result = await repository.update(
        mockProperty.id,
        validUpdateData,
        mockUsers.admin.id,
      );

      // Assert: Verify update succeeded
      expect(mockTx.property.update).toHaveBeenCalled();
      expect(result).toEqual(mockPropertyWithRelations);
    });

    it("should reject update when user is not the owner and not admin", async () => {
      // Arrange: Setup mocks for different agent
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          update: vi.fn(),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.anotherAgent),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.update(
          mockProperty.id,
          validUpdateData,
          mockUsers.anotherAgent.id,
        ),
      ).rejects.toThrow(
        "Unauthorized: Only the property owner or admins can update",
      );

      // Assert: Verify update was not called
      expect(mockTx.property.update).not.toHaveBeenCalled();
    });

    it("should reject update when user is a CLIENT", async () => {
      // Arrange: Setup mocks for client user
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          update: vi.fn(),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.client),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.update(
          mockProperty.id,
          validUpdateData,
          mockUsers.client.id,
        ),
      ).rejects.toThrow(
        "Unauthorized: Only the property owner or admins can update",
      );

      // Assert: Verify update was not called
      expect(mockTx.property.update).not.toHaveBeenCalled();
    });

    it("should reject update when property does not exist", async () => {
      // Arrange: Setup mocks for non-existent property
      const mockTx = {
        property: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        user: {
          findUnique: vi.fn(),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.update(
          "nonexistent-id",
          validUpdateData,
          mockUsers.agent.id,
        ),
      ).rejects.toThrow("Property not found");

      // Assert: Verify update was not called
      expect(mockTx.property.update).not.toHaveBeenCalled();
      // Assert: User lookup was not called (fail fast)
      expect(mockTx.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("delete()", () => {
    it("should delete property when user is the owner", async () => {
      // Arrange: Setup mocks for property owner
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          delete: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.agent),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act: Delete property
      const result = await repository.delete(
        mockProperty.id,
        mockUsers.agent.id,
      );

      // Assert: Verify property lookup
      expect(mockTx.property.findUnique).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        select: { agentId: true },
      });

      // Assert: Verify delete was called
      expect(mockTx.property.delete).toHaveBeenCalledWith({
        where: { id: mockProperty.id },
        select: propertySelect,
      });

      // Assert: Verify result
      expect(result).toEqual(mockPropertyWithRelations);
    });

    it("should delete property when user is an ADMIN (even if not owner)", async () => {
      // Arrange: Setup mocks for admin deleting another agent's property
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          delete: vi.fn().mockResolvedValue(mockPropertyWithRelations),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.admin),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act: Delete property as admin
      const result = await repository.delete(
        mockProperty.id,
        mockUsers.admin.id,
      );

      // Assert: Verify delete succeeded
      expect(mockTx.property.delete).toHaveBeenCalled();
      expect(result).toEqual(mockPropertyWithRelations);
    });

    it("should reject delete when user is not the owner and not admin", async () => {
      // Arrange: Setup mocks for different agent
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          delete: vi.fn(),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.anotherAgent),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.delete(mockProperty.id, mockUsers.anotherAgent.id),
      ).rejects.toThrow(
        "Unauthorized: Only the property owner or admins can delete",
      );

      // Assert: Verify delete was not called
      expect(mockTx.property.delete).not.toHaveBeenCalled();
    });

    it("should reject delete when user is a CLIENT", async () => {
      // Arrange: Setup mocks for client user
      const mockTx = {
        property: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ agentId: mockUsers.agent.id }),
          delete: vi.fn(),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue(mockUsers.client),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.delete(mockProperty.id, mockUsers.client.id),
      ).rejects.toThrow(
        "Unauthorized: Only the property owner or admins can delete",
      );

      // Assert: Verify delete was not called
      expect(mockTx.property.delete).not.toHaveBeenCalled();
    });

    it("should reject delete when property does not exist", async () => {
      // Arrange: Setup mocks for non-existent property
      const mockTx = {
        property: {
          findUnique: vi.fn().mockResolvedValue(null),
          delete: vi.fn(),
        },
        user: {
          findUnique: vi.fn(),
        },
      };

      (db.$transaction as any).mockImplementation(async (callback: any) => {
        return callback(mockTx);
      });

      // Act & Assert: Expect error
      await expect(
        repository.delete("nonexistent-id", mockUsers.agent.id),
      ).rejects.toThrow("Property not found");

      // Assert: Verify delete was not called
      expect(mockTx.property.delete).not.toHaveBeenCalled();
      // Assert: User lookup was not called (fail fast)
      expect(mockTx.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
