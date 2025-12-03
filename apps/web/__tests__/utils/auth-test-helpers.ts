/**
 * AUTH TEST HELPERS
 *
 * Utility functions for testing authentication flows
 */

/**
 * SafeUser type - matches @repo/database SafeUser
 */
type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: "AGENT" | "ADMIN";
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * SupabaseUser type - matches Supabase auth.getUser() response
 */
type SupabaseUser = {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    role?: string;
    avatar_url?: string;
  };
};

/**
 * Create a mock Supabase Auth user
 */
export function createMockSupabaseUser(
  overrides?: Partial<SupabaseUser>,
): SupabaseUser {
  return {
    id: "supabase-user-id",
    email: "test@example.com",
    user_metadata: {
      name: "Test User",
      role: "AGENT",
    },
    ...overrides,
  };
}

/**
 * Create a mock DB user
 */
export function createMockDbUser(overrides?: Partial<SafeUser>): SafeUser {
  return {
    id: "db-user-id",
    email: "test@example.com",
    name: "Test User",
    role: "AGENT",
    phone: null,
    avatar: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

/**
 * Create mock signup FormData
 * Note: role is no longer required as all users are AGENT by default
 */
export function createSignupFormData(overrides?: {
  name?: string;
  email?: string;
  password?: string;
}): FormData {
  const formData = new FormData();
  formData.append("name", overrides?.name ?? "Test User");
  formData.append("email", overrides?.email ?? "test@example.com");
  formData.append("password", overrides?.password ?? "Password123");
  return formData;
}

/**
 * Create mock login FormData
 */
export function createLoginFormData(overrides?: {
  email?: string;
  password?: string;
}): FormData {
  const formData = new FormData();
  formData.append("email", overrides?.email ?? "test@example.com");
  formData.append("password", overrides?.password ?? "Password123");
  return formData;
}

/**
 * Mock Supabase client factory
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  };
}

// Export vi for convenience
import { vi } from "vitest";
export { vi };
