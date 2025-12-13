/**
 * TESTS - Auth Server Actions
 *
 * Integration tests for authentication Server Actions:
 * - signupAction: User registration
 * - loginAction: User login
 * - logoutAction: User logout
 */

// Import mocked modules
import { userRepository } from "@repo/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLoginFormData,
  createMockDbUser,
  createMockSupabaseUser,
  createSignupFormData,
} from "@/__tests__/utils/auth-test-helpers";
import { createClient } from "@/lib/supabase/server";
import { loginAction, logoutAction, signupAction } from "../auth";

// Get mocked functions
const mockUserRepositoryFindById = vi.mocked(userRepository.findById);
const mockCreateClient = vi.mocked(createClient);
const mockRevalidatePath = vi.mocked(revalidatePath);
const _mockRedirect = vi.mocked(redirect);

describe("Auth Server Actions", () => {
  // Mock Supabase client
  let mockSupabase: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    };

    // Mock createClient to return our mock Supabase
    mockCreateClient.mockResolvedValue(mockSupabase as any);
  });

  describe("signupAction", () => {
    describe("Successful Signup", () => {
      it("should register user as CLIENT and redirect to /perfil (no plan)", async () => {
        const formData = createSignupFormData({
          name: "Juan Pérez",
          email: "juan@example.com",
          password: "Password123",
        });

        const mockUser = createMockSupabaseUser({
          id: "new-user-id",
          email: "juan@example.com",
        });

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Sin plan → CLIENT → /perfil
        await expect(async () => {
          await signupAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /perfil");

        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "juan@example.com",
          password: "Password123",
          options: {
            data: {
              name: "Juan Pérez",
              role: "CLIENT", // No plan = CLIENT (buyers/renters)
              plan: null,
            },
          },
        });

        expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
      });

      it("should register user as AGENT and redirect to /dashboard (with FREE plan)", async () => {
        const formData = createSignupFormData({
          name: "María García",
          email: "maria@example.com",
          password: "Password123",
          plan: "free",
        });

        const mockUser = createMockSupabaseUser({
          id: "new-user-id",
          email: "maria@example.com",
        });

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Con plan FREE → AGENT → /dashboard/propiedades/nueva
        await expect(async () => {
          await signupAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /dashboard/propiedades/nueva");

        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "maria@example.com",
          password: "Password123",
          options: {
            data: {
              name: "María García",
              role: "AGENT", // With plan = AGENT (can publish properties)
              plan: "free",
            },
          },
        });
      });

      it("should register user as AGENT with upgrade param (with PLUS plan)", async () => {
        const formData = createSignupFormData({
          name: "Carlos López",
          email: "carlos@example.com",
          password: "Password123",
          plan: "plus",
        });

        const mockUser = createMockSupabaseUser({
          id: "new-user-id",
          email: "carlos@example.com",
        });

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Con plan PLUS → AGENT → /dashboard?upgrade=plus
        await expect(async () => {
          await signupAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /dashboard?upgrade=plus");

        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "carlos@example.com",
          password: "Password123",
          options: {
            data: {
              name: "Carlos López",
              role: "AGENT",
              plan: "plus",
            },
          },
        });
      });
    });

    describe("Validation Errors", () => {
      it("should reject signup with missing name", async () => {
        const formData = createSignupFormData({ name: "" });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("name");
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
      });

      it("should reject signup with invalid email", async () => {
        const formData = createSignupFormData({ email: "invalid-email" });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("email");
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
      });

      it("should reject signup with weak password (too short)", async () => {
        const formData = createSignupFormData({ password: "Pass1" });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("password");
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
      });

      it("should reject signup with password without letters", async () => {
        const formData = createSignupFormData({ password: "12345678" });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("password");
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
      });

      it("should reject signup with password without numbers", async () => {
        const formData = createSignupFormData({ password: "Password" });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("password");
        expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
      });

      // Note: Role is determined by plan parameter:
      // - No plan → CLIENT (buyers/renters)
      // - With plan (free/basic/pro) → AGENT (property publishers)
    });

    describe("Supabase Errors", () => {
      it("should handle duplicate email error", async () => {
        const formData = createSignupFormData({
          email: "existing@example.com",
        });

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: { message: "User already registered" },
        });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("general");
        expect(result.error.general).toBe("User already registered");
      });

      it("should handle Supabase service unavailable", async () => {
        const formData = createSignupFormData();

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: { message: "Service temporarily unavailable" },
        });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("general");
      });

      it("should handle case where user is null despite no error", async () => {
        const formData = createSignupFormData();

        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        const result = await signupAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("general");
        expect(result.error.general).toBe("No se pudo crear el usuario");
      });
    });
  });

  describe("loginAction", () => {
    describe("Successful Login", () => {
      it("should login AGENT user and redirect to /dashboard", async () => {
        const formData = createLoginFormData({
          email: "user@example.com",
          password: "Password123",
        });

        const mockAuthUser = createMockSupabaseUser({
          id: "user-id",
          email: "user@example.com",
        });

        const mockDbUser = createMockDbUser({
          id: "user-id",
          email: "user@example.com",
          role: "AGENT",
        });

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser },
          error: null,
        });

        mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

        await expect(async () => {
          await loginAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /dashboard");

        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "Password123",
        });

        expect(mockUserRepositoryFindById).toHaveBeenCalledWith("user-id");
        expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
      });

      it("should login AGENT user with metadata and redirect to /dashboard", async () => {
        const formData = createLoginFormData({
          email: "agent@example.com",
          password: "Password123",
        });

        const mockAuthUser = createMockSupabaseUser({
          id: "agent-id",
          email: "agent@example.com",
          user_metadata: {
            name: "Agent User",
            role: "AGENT",
          },
        });

        const mockDbUser = createMockDbUser({
          id: "agent-id",
          role: "AGENT",
        });

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser },
          error: null,
        });

        mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

        await expect(async () => {
          await loginAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /dashboard");
      });

      it("should login ADMIN user and redirect to /admin", async () => {
        const formData = createLoginFormData({
          email: "admin@example.com",
          password: "Password123",
        });

        const mockAuthUser = createMockSupabaseUser({
          id: "admin-id",
          email: "admin@example.com",
          user_metadata: {
            name: "Admin User",
            role: "ADMIN",
          },
        });

        const mockDbUser = createMockDbUser({
          id: "admin-id",
          role: "ADMIN",
        });

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser },
          error: null,
        });

        mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

        await expect(async () => {
          await loginAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /admin");
      });

      it("should login CLIENT user and redirect to /perfil", async () => {
        const formData = createLoginFormData({
          email: "client@example.com",
          password: "Password123",
        });

        const mockAuthUser = createMockSupabaseUser({
          id: "client-id",
          email: "client@example.com",
          user_metadata: {
            name: "Client User",
            role: "CLIENT",
          },
        });

        const mockDbUser = createMockDbUser({
          id: "client-id",
          role: "CLIENT",
        });

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser },
          error: null,
        });

        mockUserRepositoryFindById.mockResolvedValue(mockDbUser);

        await expect(async () => {
          await loginAction(null, formData);
        }).rejects.toThrow("NEXT_REDIRECT: /perfil");
      });
    });

    describe("Validation Errors", () => {
      it("should reject login with invalid email", async () => {
        const formData = createLoginFormData({ email: "invalid-email" });

        const result = await loginAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("email");
        expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
      });

      it("should reject login with missing password", async () => {
        const formData = new FormData();
        formData.append("email", "test@example.com");

        const result = await loginAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
      });
    });

    describe("Authentication Errors", () => {
      it("should handle invalid credentials", async () => {
        const formData = createLoginFormData({
          email: "test@example.com",
          password: "WrongPassword123",
        });

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: { message: "Invalid login credentials" },
        });

        const result = await loginAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("general");
        expect(result.error.general).toBe("Invalid login credentials");
      });

      it("should handle user in auth but not in database", async () => {
        const formData = createLoginFormData({
          email: "orphan@example.com",
          password: "Password123",
        });

        const mockAuthUser = createMockSupabaseUser({
          id: "orphan-id",
          email: "orphan@example.com",
        });

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser },
          error: null,
        });

        // User not found in database
        mockUserRepositoryFindById.mockResolvedValue(null);

        const result = await loginAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("general");
        expect(result.error.general).toBe(
          "Usuario no encontrado en la base de datos",
        );

        // Should sign out the orphaned user
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });

      it("should handle case where user is null despite no error", async () => {
        const formData = createLoginFormData();

        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        const result = await loginAction(null, formData);

        expect(result).toHaveProperty("error");
        expect(result.error).toHaveProperty("general");
        expect(result.error.general).toBe("No se pudo iniciar sesión");
      });
    });
  });

  describe("logoutAction", () => {
    it("should sign out and redirect to home", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await expect(async () => {
        await logoutAction();
      }).rejects.toThrow("NEXT_REDIRECT: /");

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("should handle logout even if signOut fails", async () => {
      // In practice, we don't check for errors in logoutAction
      // It should redirect regardless
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: "Session expired" },
      });

      await expect(async () => {
        await logoutAction();
      }).rejects.toThrow("NEXT_REDIRECT: /");

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
