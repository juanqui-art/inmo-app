/**
 * USER REPOSITORY TESTS
 *
 * Tests for user operations: CRUD, permissions, search
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@prisma/client";

// Mock the database client BEFORE importing anything that uses it
vi.mock("../client", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from "../client";
// Now import modules that depend on db
import { UserRepository, userSelect, type SafeUser } from "../repositories/users";

// Mock data
const mockClientUser: SafeUser = {
  id: "user-client-123",
  email: "client@example.com",
  name: "Juan Cliente",
  role: "CLIENT" as UserRole,
  phone: "+593999123456",
  avatar: null,
  subscriptionTier: "FREE",
  createdAt: new Date("2025-12-01T10:00:00Z"),
  updatedAt: new Date("2025-12-01T10:00:00Z"),
};

const mockAgentUser: SafeUser = {
  id: "user-agent-456",
  email: "agent@example.com",
  name: "María Agente",
  role: "AGENT" as UserRole,
  phone: "+593999654321",
  avatar: null,
  subscriptionTier: "PRO",
  createdAt: new Date("2025-12-01T10:00:00Z"),
  updatedAt: new Date("2025-12-01T10:00:00Z"),
};

const mockAdminUser: SafeUser = {
  id: "user-admin-789",
  email: "admin@example.com",
  name: "Pedro Admin",
  role: "ADMIN" as UserRole,
  phone: "+593999987654",
  avatar: null,
  subscriptionTier: "PRO",
  createdAt: new Date("2025-12-01T10:00:00Z"),
  updatedAt: new Date("2025-12-01T10:00:00Z"),
};

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a fresh repository instance
    repository = new UserRepository();
  });

  describe("findById()", () => {
    it("should return user by ID with safe fields only", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(mockClientUser);

      // Act
      const result = await repository.findById(mockClientUser.id);

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockClientUser.id },
        select: userSelect,
      });
      expect(result).toEqual(mockClientUser);
      expect(result?.id).toBe(mockClientUser.id);
      expect(result?.email).toBe("client@example.com");
    });

    it("should return null if user doesn't exist", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });

    it("should not include sensitive fields (safe select)", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(mockClientUser);

      // Act
      await repository.findById(mockClientUser.id);

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: userSelect,
        })
      );
      // Verify userSelect doesn't include sensitive fields like password
      expect(userSelect).not.toHaveProperty("password");
    });
  });

  describe("findByEmail()", () => {
    it("should return user by email", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(mockClientUser);

      // Act
      const result = await repository.findByEmail("client@example.com");

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: "client@example.com" },
        select: userSelect,
      });
      expect(result).toEqual(mockClientUser);
      expect(result?.email).toBe("client@example.com");
    });

    it("should return null if email doesn't exist", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      // Act
      const result = await repository.findByEmail("nonexistent@example.com");

      // Assert
      expect(result).toBeNull();
    });

    it("should be case-sensitive for email", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      // Act
      await repository.findByEmail("CLIENT@EXAMPLE.COM");

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { email: "CLIENT@EXAMPLE.COM" },
        select: userSelect,
      });
    });
  });

  describe("create()", () => {
    it("should create a new user", async () => {
      // Arrange
      const newUserData = {
        email: "newuser@example.com",
        name: "New User",
        role: "CLIENT" as UserRole,
        phone: "+593999111222",
      };
      const createdUser = { ...mockClientUser, ...newUserData };
      vi.mocked(db.user.create).mockResolvedValue(createdUser);

      // Act
      const result = await repository.create(newUserData);

      // Assert
      expect(db.user.create).toHaveBeenCalledWith({
        data: newUserData,
        select: userSelect,
      });
      expect(result).toEqual(createdUser);
      expect(result.email).toBe("newuser@example.com");
    });

    it("should create user with default subscription tier", async () => {
      // Arrange
      const newUserData = {
        email: "newuser@example.com",
        name: "New User",
        role: "CLIENT" as UserRole,
      };
      vi.mocked(db.user.create).mockResolvedValue(mockClientUser);

      // Act
      await repository.create(newUserData);

      // Assert
      expect(db.user.create).toHaveBeenCalledWith({
        data: newUserData,
        select: userSelect,
      });
    });

    it("should handle database errors", async () => {
      // Arrange
      const error = new Error("Unique constraint failed: email");
      vi.mocked(db.user.create).mockRejectedValue(error);

      // Act & Assert
      await expect(
        repository.create({
          email: "duplicate@example.com",
          name: "User",
          role: "CLIENT",
        })
      ).rejects.toThrow("Unique constraint failed");
    });
  });

  describe("update()", () => {
    it("should allow user to update their own profile", async () => {
      // Arrange
      const updateData = { name: "Juan Updated" };
      const updatedUser = { ...mockClientUser, name: "Juan Updated" };

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockClientUser.id,
        role: mockClientUser.role,
      } as any);
      vi.mocked(db.user.update).mockResolvedValue(updatedUser);

      // Act
      const result = await repository.update(
        mockClientUser.id,
        updateData,
        mockClientUser.id // Same user
      );

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockClientUser.id },
        select: { id: true, role: true },
      });
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: mockClientUser.id },
        data: updateData,
        select: userSelect,
      });
      expect(result.name).toBe("Juan Updated");
    });

    it("should allow admin to update any user", async () => {
      // Arrange
      const updateData = { name: "Updated by Admin" };
      const updatedUser = { ...mockClientUser, name: "Updated by Admin" };

      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockAdminUser.id,
        role: mockAdminUser.role,
      } as any);
      vi.mocked(db.user.update).mockResolvedValue(updatedUser);

      // Act
      const result = await repository.update(
        mockClientUser.id,
        updateData,
        mockAdminUser.id // Admin user
      );

      // Assert
      expect(result.name).toBe("Updated by Admin");
    });

    it("should throw error if user tries to update another user", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockClientUser.id,
        role: "CLIENT",
      } as any);

      // Act & Assert
      await expect(
        repository.update(
          "other-user-id",
          { name: "Hacked" },
          mockClientUser.id
        )
      ).rejects.toThrow("Unauthorized: Cannot update other users");
    });

    it("should throw error if current user not found", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        repository.update(
          mockClientUser.id,
          { name: "Update" },
          "non-existent-user"
        )
      ).rejects.toThrow("Current user not found");
    });

    it("should allow AGENT to update their own profile", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: mockAgentUser.id,
        role: "AGENT",
      } as any);
      vi.mocked(db.user.update).mockResolvedValue(mockAgentUser);

      // Act
      const result = await repository.update(
        mockAgentUser.id,
        { phone: "+593999999999" },
        mockAgentUser.id
      );

      // Assert
      expect(result).toEqual(mockAgentUser);
    });
  });

  describe("delete()", () => {
    it("should allow admin to delete users", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue({
        role: "ADMIN",
      } as any);
      vi.mocked(db.user.delete).mockResolvedValue(mockClientUser);

      // Act
      const result = await repository.delete(
        mockClientUser.id,
        mockAdminUser.id
      );

      // Assert
      expect(db.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockAdminUser.id },
        select: { role: true },
      });
      expect(db.user.delete).toHaveBeenCalledWith({
        where: { id: mockClientUser.id },
        select: userSelect,
      });
      expect(result).toEqual(mockClientUser);
    });

    it("should throw error if non-admin tries to delete", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue({
        role: "CLIENT",
      } as any);

      // Act & Assert
      await expect(
        repository.delete(mockClientUser.id, "non-admin-user")
      ).rejects.toThrow("Unauthorized: Only admins can delete users");
    });

    it("should throw error if current user not found", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        repository.delete(mockClientUser.id, "non-existent-user")
      ).rejects.toThrow("Unauthorized: Only admins can delete users");
    });

    it("should not allow AGENT to delete users", async () => {
      // Arrange
      vi.mocked(db.user.findUnique).mockResolvedValue({
        role: "AGENT",
      } as any);

      // Act & Assert
      await expect(
        repository.delete(mockClientUser.id, mockAgentUser.id)
      ).rejects.toThrow("Unauthorized: Only admins can delete users");
    });
  });

  describe("list()", () => {
    it("should list all users with pagination", async () => {
      // Arrange
      const mockUsers = [mockClientUser, mockAgentUser];
      vi.mocked(db.user.findMany).mockResolvedValue(mockUsers);
      vi.mocked(db.user.count).mockResolvedValue(2);

      // Act
      const result = await repository.list({ skip: 0, take: 20 });

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith({
        where: {},
        select: userSelect,
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
      expect(db.user.count).toHaveBeenCalledWith({ where: {} });
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
    });

    it("should filter by role", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([mockAgentUser]);
      vi.mocked(db.user.count).mockResolvedValue(1);

      // Act
      const result = await repository.list({ role: "AGENT" });

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: "AGENT" },
        })
      );
      expect(result.users).toEqual([mockAgentUser]);
      expect(result.total).toBe(1);
    });

    it("should search by name or email (case insensitive)", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([mockClientUser]);
      vi.mocked(db.user.count).mockResolvedValue(1);

      // Act
      const result = await repository.list({ search: "juan" });

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: "juan", mode: "insensitive" } },
              { email: { contains: "juan", mode: "insensitive" } },
            ],
          },
        })
      );
      expect(result.users).toEqual([mockClientUser]);
    });

    it("should combine role filter and search", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([mockAgentUser]);
      vi.mocked(db.user.count).mockResolvedValue(1);

      // Act
      await repository.list({ role: "AGENT", search: "maria" });

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            role: "AGENT",
            OR: [
              { name: { contains: "maria", mode: "insensitive" } },
              { email: { contains: "maria", mode: "insensitive" } },
            ],
          },
        })
      );
    });

    it("should order by createdAt desc (newest first)", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([]);
      vi.mocked(db.user.count).mockResolvedValue(0);

      // Act
      await repository.list({});

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        })
      );
    });

    it("should return empty array if no users match", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([]);
      vi.mocked(db.user.count).mockResolvedValue(0);

      // Act
      const result = await repository.list({ search: "nonexistent" });

      // Assert
      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("should use default pagination values", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([]);
      vi.mocked(db.user.count).mockResolvedValue(0);

      // Act
      await repository.list({});

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        })
      );
    });
  });

  describe("getAgents()", () => {
    it("should return all agents ordered by name", async () => {
      // Arrange
      const mockAgents = [
        mockAgentUser,
        { ...mockAgentUser, id: "agent-2", name: "Ana Agente" },
      ];
      vi.mocked(db.user.findMany).mockResolvedValue(mockAgents);

      // Act
      const result = await repository.getAgents();

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith({
        where: { role: "AGENT" },
        select: userSelect,
        orderBy: { name: "asc" },
      });
      expect(result).toEqual(mockAgents);
      expect(result.length).toBe(2);
    });

    it("should return empty array if no agents exist", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([]);

      // Act
      const result = await repository.getAgents();

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should only return users with AGENT role", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([mockAgentUser]);

      // Act
      await repository.getAgents();

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: "AGENT" },
        })
      );
    });

    it("should order agents alphabetically by name", async () => {
      // Arrange
      vi.mocked(db.user.findMany).mockResolvedValue([]);

      // Act
      await repository.getAgents();

      // Assert
      expect(db.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: "asc" },
        })
      );
    });
  });
});
