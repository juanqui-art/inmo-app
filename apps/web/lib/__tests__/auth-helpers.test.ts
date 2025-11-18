/**
 * TESTS - Auth Helpers
 *
 * Integration tests for authentication helper functions:
 * - getCurrentUser: Get authenticated user with role from DB
 * - requireAuth: Require authentication (redirect if not authenticated)
 * - requireRole: Require specific role (redirect if unauthorized)
 * - checkPermission: Check if user has permission over a resource
 * - requireOwnership: Require ownership of a resource
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Unmock auth functions for this test file since we're testing them
vi.unmock("@/lib/auth");

import {
  getCurrentUser,
  requireAuth,
  requireRole,
  checkPermission,
  requireOwnership,
} from "../auth";
import {
  createMockDbUser,
  createMockSupabaseUser,
} from "@/__tests__/utils/auth-test-helpers";

// Import mocked modules
import { userRepository } from "@repo/database";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Get mocked functions
const mockUserRepositoryFindById = vi.mocked(userRepository.findById);
const mockCreateClient = vi.mocked(createClient);
const mockRedirect = vi.mocked(redirect);

describe("Auth Helpers", () => {
  let mockSupabase: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
      },
    };

    mockCreateClient.mockResolvedValue(mockSupabase as any);
  });

  describe("getCurrentUser", () => {
    it("should return user with role when authenticated", async () => {
      const mockAuthUser = createMockSupabaseUser({
        id: "user-123",
        email: "test@example.com",
      });

      const mockDbUser = createMockDbUser({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "CLIENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await getCurrentUser();

      expect(result).toEqual(mockDbUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockUserRepositoryFindById).toHaveBeenCalledWith("user-123");
    });

    it("should return null when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(mockUserRepositoryFindById).not.toHaveBeenCalled();
    });

    it("should handle user in auth but not in database", async () => {
      const mockAuthUser = createMockSupabaseUser({
        id: "orphan-user",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      // User not found in database
      mockUserRepositoryFindById.mockResolvedValue(null);

      const result = await getCurrentUser();

      expect(result).toBeNull();
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it("should return AGENT user with correct role", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "agent-123" });
      const mockDbUser = createMockDbUser({
        id: "agent-123",
        role: "AGENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await getCurrentUser();

      expect(result?.role).toBe("AGENT");
    });

    it("should return ADMIN user with correct role", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "admin-123" });
      const mockDbUser = createMockDbUser({
        id: "admin-123",
        role: "ADMIN",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await getCurrentUser();

      expect(result?.role).toBe("ADMIN");
    });
  });

  describe("requireAuth", () => {
    it("should return user when authenticated", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "user-123" });
      const mockDbUser = createMockDbUser({ id: "user-123" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await requireAuth();

      expect(result).toEqual(mockDbUser);
    });

    it("should redirect to /login when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(async () => {
        await requireAuth();
      }).rejects.toThrow("NEXT_REDIRECT: /login");

      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });

    it("should redirect to /login when user not in database", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "orphan-user" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(null);

      await expect(async () => {
        await requireAuth();
      }).rejects.toThrow("NEXT_REDIRECT: /login");
    });
  });

  describe("requireRole", () => {
    it("should return user when user has required role", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "agent-123" });
      const mockDbUser = createMockDbUser({
        id: "agent-123",
        role: "AGENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await requireRole(["AGENT", "ADMIN"]);

      expect(result).toEqual(mockDbUser);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("should redirect CLIENT to /perfil when trying to access AGENT route", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "client-123" });
      const mockDbUser = createMockDbUser({
        id: "client-123",
        role: "CLIENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(async () => {
        await requireRole(["AGENT", "ADMIN"]);
      }).rejects.toThrow("NEXT_REDIRECT: /perfil");

      expect(mockRedirect).toHaveBeenCalledWith("/perfil");
    });

    it("should redirect AGENT to /dashboard when trying to access ADMIN route", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "agent-123" });
      const mockDbUser = createMockDbUser({
        id: "agent-123",
        role: "AGENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(async () => {
        await requireRole(["ADMIN"]);
      }).rejects.toThrow("NEXT_REDIRECT: /dashboard");

      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("should redirect ADMIN to /admin when trying to access CLIENT route", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "admin-123" });
      const mockDbUser = createMockDbUser({
        id: "admin-123",
        role: "ADMIN",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(async () => {
        await requireRole(["CLIENT"]);
      }).rejects.toThrow("NEXT_REDIRECT: /admin");

      expect(mockRedirect).toHaveBeenCalledWith("/admin");
    });

    it("should allow ADMIN to access AGENT routes", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "admin-123" });
      const mockDbUser = createMockDbUser({
        id: "admin-123",
        role: "ADMIN",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await requireRole(["AGENT", "ADMIN"]);

      expect(result).toEqual(mockDbUser);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("should allow AGENT to access CLIENT routes when both are allowed", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "agent-123" });
      const mockDbUser = createMockDbUser({
        id: "agent-123",
        role: "AGENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const result = await requireRole(["CLIENT", "AGENT", "ADMIN"]);

      expect(result).toEqual(mockDbUser);
    });
  });

  describe("checkPermission", () => {
    it("should return true when user is the resource owner", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "user-123" });
      const mockDbUser = createMockDbUser({ id: "user-123" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const hasPermission = await checkPermission("user-123");

      expect(hasPermission).toBe(true);
    });

    it("should return false when user is not the resource owner", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "user-123" });
      const mockDbUser = createMockDbUser({ id: "user-123" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const hasPermission = await checkPermission("different-user-id");

      expect(hasPermission).toBe(false);
    });

    it("should return true when user is ADMIN (admin override enabled)", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "admin-123" });
      const mockDbUser = createMockDbUser({
        id: "admin-123",
        role: "ADMIN",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const hasPermission = await checkPermission("other-user-id", true);

      expect(hasPermission).toBe(true);
    });

    it("should return false when user is ADMIN but admin override disabled", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "admin-123" });
      const mockDbUser = createMockDbUser({
        id: "admin-123",
        role: "ADMIN",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const hasPermission = await checkPermission("other-user-id", false);

      expect(hasPermission).toBe(false);
    });

    it("should return false when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const hasPermission = await checkPermission("any-user-id");

      expect(hasPermission).toBe(false);
    });

    it("should return false when AGENT tries to access other user's resource", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "agent-123" });
      const mockDbUser = createMockDbUser({
        id: "agent-123",
        role: "AGENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const hasPermission = await checkPermission("other-agent-id");

      expect(hasPermission).toBe(false);
    });
  });

  describe("requireOwnership", () => {
    it("should allow access when user is the resource owner", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "user-123" });
      const mockDbUser = createMockDbUser({ id: "user-123" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(requireOwnership("user-123")).resolves.not.toThrow();
    });

    it("should throw error when user is not the resource owner", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "user-123" });
      const mockDbUser = createMockDbUser({ id: "user-123" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(requireOwnership("different-user-id")).rejects.toThrow(
        "No tienes permiso para realizar esta acción"
      );
    });

    it("should allow access when user is ADMIN", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "admin-123" });
      const mockDbUser = createMockDbUser({
        id: "admin-123",
        role: "ADMIN",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(requireOwnership("other-user-id")).resolves.not.toThrow();
    });

    it("should throw custom error message", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "user-123" });
      const mockDbUser = createMockDbUser({ id: "user-123" });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      const customMessage = "No puedes editar esta propiedad";

      await expect(
        requireOwnership("different-user-id", customMessage)
      ).rejects.toThrow(customMessage);
    });

    it("should throw error when not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(requireOwnership("any-user-id")).rejects.toThrow(
        "No tienes permiso para realizar esta acción"
      );
    });

    it("should throw error when AGENT tries to access other agent's resource", async () => {
      const mockAuthUser = createMockSupabaseUser({ id: "agent-123" });
      const mockDbUser = createMockDbUser({
        id: "agent-123",
        role: "AGENT",
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockAuthUser },
        error: null,
      });

      mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

      await expect(requireOwnership("other-agent-id")).rejects.toThrow();
    });
  });
});
