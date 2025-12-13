/**
 * TESTS - Admin Server Actions
 *
 * Comprehensive tests for admin functionality:
 * - User management (getUsersAction, updateUserRoleAction, deleteUserAction)
 * - Property management (getAllPropertiesAction, deletePropertyAction)
 * - Analytics (getAdminStatsAction, getAdminMetricsByPeriodAction)
 * - CSRF protection on critical operations
 * - Admin-only access control
 * - Self-modification prevention
 * - Search, filtering, and pagination
 */

import { db, userRepository, propertyRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireRole } from "@/lib/auth";
import { validateCSRFToken } from "@/lib/csrf";
import {
  getUsersAction,
  getUserByIdAction,
  updateUserRoleAction,
  updateUserTierAction,
  deleteUserAction,
  getAllPropertiesAction,
  updatePropertyStatusAction,
  deletePropertyAction,
  getAdminStatsAction,
  getAdminMetricsByPeriodAction,
} from "../admin";

// Get mocked functions
const mockRequireRole = vi.mocked(requireRole);
const mockRevalidatePath = vi.mocked(revalidatePath);
const mockValidateCSRFToken = vi.mocked(validateCSRFToken);

// Cast nested db mocks
const mockDbUserFindMany = db.user.findMany as ReturnType<typeof vi.fn>;
const mockDbUserCount = db.user.count as ReturnType<typeof vi.fn>;
const mockDbUserFindUnique = db.user.findUnique as ReturnType<typeof vi.fn>;
const mockDbPropertyFindMany = db.property.findMany as ReturnType<typeof vi.fn>;
const mockDbPropertyCount = db.property.count as ReturnType<typeof vi.fn>;

// Repository mocks
const mockUserRepositoryUpdate = vi.mocked(userRepository.update);
const mockUserRepositoryDelete = vi.mocked(userRepository.delete);
const mockPropertyRepositoryUpdate = vi.mocked(propertyRepository.update);
const mockPropertyRepositoryDelete = vi.mocked(propertyRepository.delete);

// Test helpers
function createMockAdmin() {
  return {
    id: "admin-123",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN" as const,
    subscriptionTier: "PRO" as const,
    phone: null,
    avatar: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
  };
}

function createMockUser(overrides?: {
  id?: string;
  email?: string;
  role?: "CLIENT" | "AGENT" | "ADMIN";
  subscriptionTier?: "FREE" | "PLUS" | "AGENT" | "PRO";
}) {
  return {
    id: overrides?.id || "user-123",
    email: overrides?.email || "user@example.com",
    name: "Test User",
    role: overrides?.role || "CLIENT",
    subscriptionTier: overrides?.subscriptionTier || "FREE",
    phone: null,
    avatar: null,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    _count: {
      properties: 0,
      favorites: 0,
      appointments: 0,
    },
  };
}

function createMockProperty(overrides?: {
  id?: string;
  title?: string;
  status?: "AVAILABLE" | "PENDING" | "SOLD" | "RENTED";
}) {
  return {
    id: overrides?.id || "prop-123",
    title: overrides?.title || "Test Property",
    price: 150000,
    transactionType: "SALE",
    category: "HOUSE",
    status: overrides?.status || "AVAILABLE",
    city: "Cuenca",
    state: "Azuay",
    createdAt: new Date("2024-06-01"),
    agent: {
      id: "agent-123",
      name: "Agent Name",
      email: "agent@example.com",
    },
    _count: {
      favorites: 5,
      appointments: 2,
    },
  };
}

describe("Admin Server Actions", () => {
  const mockAdmin = createMockAdmin();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue(mockAdmin);
  });

  // ==================== USER MANAGEMENT ====================

  describe("getUsersAction", () => {
    it("should return paginated users with counts (admin only)", async () => {
      const mockUsers = [createMockUser(), createMockUser({ id: "user-456" })];

      mockDbUserFindMany.mockResolvedValue(mockUsers);
      mockDbUserCount.mockResolvedValue(2);

      const result = await getUsersAction({ skip: 0, take: 20 });

      expect(mockRequireRole).toHaveBeenCalledWith(["ADMIN"]);
      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(mockDbUserFindMany).toHaveBeenCalledWith({
        where: {},
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          role: true,
        }),
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter users by role", async () => {
      const mockAgents = [createMockUser({ role: "AGENT" })];

      mockDbUserFindMany.mockResolvedValue(mockAgents);
      mockDbUserCount.mockResolvedValue(1);

      await getUsersAction({ role: "AGENT" });

      expect(mockDbUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: "AGENT" },
        })
      );
    });

    it("should search users by name and email", async () => {
      mockDbUserFindMany.mockResolvedValue([]);
      mockDbUserCount.mockResolvedValue(0);

      await getUsersAction({ search: "john" });

      expect(mockDbUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: "john", mode: "insensitive" } },
              { email: { contains: "john", mode: "insensitive" } },
            ],
          },
        })
      );
    });

    it("should handle pagination correctly", async () => {
      mockDbUserFindMany.mockResolvedValue([]);
      mockDbUserCount.mockResolvedValue(100);

      const result = await getUsersAction({ skip: 40, take: 20 });

      expect(result.total).toBe(100);
      expect(mockDbUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 20,
        })
      );
    });

    it("should require ADMIN role", async () => {
      mockRequireRole.mockRejectedValue(new Error("Unauthorized"));

      await expect(getUsersAction()).rejects.toThrow("Unauthorized");
      expect(mockRequireRole).toHaveBeenCalledWith(["ADMIN"]);
    });
  });

  describe("getUserByIdAction", () => {
    it("should return user by ID (admin only)", async () => {
      const mockUser = createMockUser();
      mockDbUserFindUnique.mockResolvedValue(mockUser);

      const result = await getUserByIdAction("user-123");

      expect(mockRequireRole).toHaveBeenCalledWith(["ADMIN"]);
      expect(result).toEqual(mockUser);
      expect(mockDbUserFindUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: expect.objectContaining({
          id: true,
          email: true,
          _count: expect.any(Object),
        }),
      });
    });

    it("should return null for non-existent user", async () => {
      mockDbUserFindUnique.mockResolvedValue(null);

      const result = await getUserByIdAction("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateUserRoleAction", () => {
    it("should update user role with valid CSRF token", async () => {
      mockValidateCSRFToken.mockResolvedValue(undefined);
      mockUserRepositoryUpdate.mockResolvedValue(undefined);

      const result = await updateUserRoleAction("user-123", "AGENT", "valid-csrf-token");

      expect(mockValidateCSRFToken).toHaveBeenCalledWith("valid-csrf-token");
      expect(mockUserRepositoryUpdate).toHaveBeenCalledWith(
        "user-123",
        { role: "AGENT" },
        "admin-123"
      );
      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/usuarios");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/usuarios/user-123");
    });

    it("should reject invalid CSRF token", async () => {
      const csrfError = new Error("Invalid CSRF token");
      csrfError.name = "CSRFError";
      mockValidateCSRFToken.mockRejectedValue(csrfError);

      const result = await updateUserRoleAction("user-123", "AGENT", "invalid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid CSRF token");
      expect(mockUserRepositoryUpdate).not.toHaveBeenCalled();
    });

    it("should prevent admin from changing their own role", async () => {
      mockValidateCSRFToken.mockResolvedValue(undefined); // Pass CSRF check

      const result = await updateUserRoleAction("admin-123", "CLIENT", "valid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No puedes cambiar tu propio rol");
      expect(mockUserRepositoryUpdate).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockValidateCSRFToken.mockResolvedValue(undefined);
      mockUserRepositoryUpdate.mockRejectedValue(new Error("DB Error"));

      const result = await updateUserRoleAction("user-123", "AGENT", "valid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("DB Error");
    });

    it("should work without CSRF token (with warning)", async () => {
      mockUserRepositoryUpdate.mockResolvedValue(undefined);

      const result = await updateUserRoleAction("user-123", "AGENT", null);

      expect(result.success).toBe(true);
      expect(mockUserRepositoryUpdate).toHaveBeenCalled();
      // Note: Logger warning would be called but we don't test it here
    });
  });

  describe("updateUserTierAction", () => {
    it("should update user subscription tier", async () => {
      mockUserRepositoryUpdate.mockResolvedValue(undefined);

      const result = await updateUserTierAction("user-123", "PLUS");

      expect(mockUserRepositoryUpdate).toHaveBeenCalledWith(
        "user-123",
        { subscriptionTier: "PLUS" },
        "admin-123"
      );
      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/usuarios");
    });

    it("should handle errors when updating tier", async () => {
      mockUserRepositoryUpdate.mockRejectedValue(new Error("Update failed"));

      const result = await updateUserTierAction("user-123", "PRO");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  describe("deleteUserAction", () => {
    it("should delete user with valid CSRF token", async () => {
      mockValidateCSRFToken.mockResolvedValue(undefined);
      mockUserRepositoryDelete.mockResolvedValue(undefined);

      const result = await deleteUserAction("user-123", "valid-csrf-token");

      expect(mockValidateCSRFToken).toHaveBeenCalledWith("valid-csrf-token");
      expect(mockUserRepositoryDelete).toHaveBeenCalledWith("user-123", "admin-123");
      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/usuarios");
    });

    it("should reject invalid CSRF token", async () => {
      const csrfError = new Error("Invalid CSRF token");
      csrfError.name = "CSRFError";
      mockValidateCSRFToken.mockRejectedValue(csrfError);

      const result = await deleteUserAction("user-123", "invalid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid CSRF token");
      expect(mockUserRepositoryDelete).not.toHaveBeenCalled();
    });

    it("should prevent admin from deleting themselves", async () => {
      mockValidateCSRFToken.mockResolvedValue(undefined); // Pass CSRF check

      const result = await deleteUserAction("admin-123", "valid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("No puedes eliminar tu propia cuenta");
      expect(mockUserRepositoryDelete).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      mockValidateCSRFToken.mockResolvedValue(undefined);
      mockUserRepositoryDelete.mockRejectedValue(new Error("Delete failed"));

      const result = await deleteUserAction("user-123", "valid-token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Delete failed");
    });
  });

  // ==================== PROPERTY MANAGEMENT ====================

  describe("getAllPropertiesAction", () => {
    it("should return paginated properties with agent info", async () => {
      const mockProperties = [createMockProperty()];

      mockDbPropertyFindMany.mockResolvedValue(mockProperties);
      mockDbPropertyCount.mockResolvedValue(1);

      const result = await getAllPropertiesAction({ skip: 0, take: 20 });

      expect(mockRequireRole).toHaveBeenCalledWith(["ADMIN"]);
      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].price).toBe(150000); // Converted to number
      expect(result.total).toBe(1);
    });

    it("should filter properties by status", async () => {
      mockDbPropertyFindMany.mockResolvedValue([]);
      mockDbPropertyCount.mockResolvedValue(0);

      await getAllPropertiesAction({ status: "SOLD" });

      expect(mockDbPropertyFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "SOLD" },
        })
      );
    });

    it("should search properties by title, address, and city", async () => {
      mockDbPropertyFindMany.mockResolvedValue([]);
      mockDbPropertyCount.mockResolvedValue(0);

      await getAllPropertiesAction({ search: "downtown" });

      expect(mockDbPropertyFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: "downtown", mode: "insensitive" } },
              { address: { contains: "downtown", mode: "insensitive" } },
              { city: { contains: "downtown", mode: "insensitive" } },
            ],
          },
        })
      );
    });

    it("should filter properties by agent", async () => {
      mockDbPropertyFindMany.mockResolvedValue([]);
      mockDbPropertyCount.mockResolvedValue(0);

      await getAllPropertiesAction({ agentId: "agent-123" });

      expect(mockDbPropertyFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agentId: "agent-123" },
        })
      );
    });
  });

  describe("updatePropertyStatusAction", () => {
    it("should update property status", async () => {
      mockPropertyRepositoryUpdate.mockResolvedValue(undefined);

      const result = await updatePropertyStatusAction("prop-123", "SOLD");

      expect(mockPropertyRepositoryUpdate).toHaveBeenCalledWith(
        "prop-123",
        { status: "SOLD" },
        "admin-123"
      );
      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/propiedades");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/propiedades/prop-123");
    });

    it("should handle errors when updating status", async () => {
      mockPropertyRepositoryUpdate.mockRejectedValue(new Error("Update failed"));

      const result = await updatePropertyStatusAction("prop-123", "SOLD");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  describe("deletePropertyAction", () => {
    it("should delete property", async () => {
      mockPropertyRepositoryDelete.mockResolvedValue(undefined);

      const result = await deletePropertyAction("prop-123");

      expect(mockPropertyRepositoryDelete).toHaveBeenCalledWith("prop-123", "admin-123");
      expect(result.success).toBe(true);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/propiedades");
    });

    it("should handle errors when deleting property", async () => {
      mockPropertyRepositoryDelete.mockRejectedValue(new Error("Delete failed"));

      const result = await deletePropertyAction("prop-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Delete failed");
    });
  });

  // ==================== ANALYTICS ====================

  describe("getAdminStatsAction", () => {
    it("should return comprehensive platform statistics", async () => {
      // Mock all the parallel queries
      const mockDbUserCountGlobal = db.user.count as ReturnType<typeof vi.fn>;
      const mockDbPropertyCountGlobal = db.property.count as ReturnType<typeof vi.fn>;
      const mockDbAppointmentCount = db.appointment.count as ReturnType<typeof vi.fn>;
      const mockDbFavoriteCount = db.favorite.count as ReturnType<typeof vi.fn>;
      const mockDbUserGroupBy = db.user.groupBy as ReturnType<typeof vi.fn>;
      const mockDbPropertyGroupBy = db.property.groupBy as ReturnType<typeof vi.fn>;
      const mockDbAppointmentGroupBy = db.appointment.groupBy as ReturnType<typeof vi.fn>;

      // Setup counts
      mockDbUserCountGlobal.mockResolvedValueOnce(100); // total users
      mockDbPropertyCountGlobal.mockResolvedValueOnce(50); // total properties
      mockDbAppointmentCount.mockResolvedValue(30); // total appointments
      mockDbFavoriteCount.mockResolvedValue(75); // total favorites

      // Setup groupBy results
      mockDbUserGroupBy.mockResolvedValue([
        { role: "CLIENT", _count: { role: 60 } },
        { role: "AGENT", _count: { role: 35 } },
        { role: "ADMIN", _count: { role: 5 } },
      ]);

      mockDbPropertyGroupBy.mockResolvedValue([
        { status: "AVAILABLE", _count: { status: 30 } },
        { status: "SOLD", _count: { status: 15 } },
        { status: "PENDING", _count: { status: 5 } },
      ]);

      mockDbAppointmentGroupBy.mockResolvedValue([
        { status: "PENDING", _count: { status: 10 } },
        { status: "CONFIRMED", _count: { status: 15 } },
        { status: "COMPLETED", _count: { status: 5 } },
      ]);

      // Recent counts (last 30 days)
      mockDbUserCountGlobal.mockResolvedValueOnce(20); // recent users
      mockDbPropertyCountGlobal.mockResolvedValueOnce(10); // recent properties

      const result = await getAdminStatsAction();

      expect(result.totalUsers).toBe(100);
      expect(result.totalProperties).toBe(50);
      expect(result.totalAppointments).toBe(30);
      expect(result.totalFavorites).toBe(75);
      expect(result.usersByRole).toHaveLength(3);
      expect(result.propertiesByStatus).toHaveLength(3);
      expect(result.appointmentsByStatus).toHaveLength(3);
      expect(result.recentUsers).toBe(20);
      expect(result.recentProperties).toBe(10);
    });

    it("should require ADMIN role", async () => {
      mockRequireRole.mockRejectedValue(new Error("Unauthorized"));

      await expect(getAdminStatsAction()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getAdminMetricsByPeriodAction", () => {
    it("should return metrics grouped by date", async () => {
      const mockUsers = [
        { createdAt: new Date("2024-06-01") },
        { createdAt: new Date("2024-06-01") },
        { createdAt: new Date("2024-06-02") },
      ];

      const mockProperties = [
        { createdAt: new Date("2024-06-01") },
      ];

      const mockAppointments = [
        { createdAt: new Date("2024-06-02") },
      ];

      mockDbUserFindMany.mockResolvedValue(mockUsers);
      mockDbPropertyFindMany.mockResolvedValue(mockProperties);
      const mockDbAppointmentFindMany = db.appointment.findMany as ReturnType<typeof vi.fn>;
      mockDbAppointmentFindMany.mockResolvedValue(mockAppointments);

      const result = await getAdminMetricsByPeriodAction(30);

      expect(result.users).toBeDefined();
      expect(result.properties).toBeDefined();
      expect(result.appointments).toBeDefined();
      expect(mockDbUserFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdAt: expect.objectContaining({ gte: expect.any(Date) }) },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        })
      );
    });

    it("should require ADMIN role", async () => {
      mockRequireRole.mockRejectedValue(new Error("Unauthorized"));

      await expect(getAdminMetricsByPeriodAction(7)).rejects.toThrow("Unauthorized");
    });
  });
});
