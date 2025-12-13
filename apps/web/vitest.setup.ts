import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
// NOTE: NODE_ENV is automatically set to "test" by vitest

// Mock @repo/env to skip validation in tests
vi.mock("@repo/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    DIRECT_URL: "postgresql://test:test@localhost:5432/test",
  },
}));

// Mock database repositories BEFORE they're imported
vi.mock("@repo/database", () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      property: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      propertyImage: {
        createMany: vi.fn(),
        deleteMany: vi.fn(),
      },
    },
    propertyRepository: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      list: vi.fn(),
    },
    propertyImageRepository: {
      countByProperty: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      updateManyOrders: vi.fn(),
    },
    userRepository: {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    FavoriteRepository: vi.fn(() => ({
      toggleFavorite: vi.fn(),
      getUserFavorites: vi.fn(),
      isFavorite: vi.fn(),
    })),
  };
});

// Mock auth functions
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  checkPermission: vi.fn(),
  requireOwnership: vi.fn(),
}));

// Mock Next.js cache functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock Next.js navigation functions
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT: ${path}`);
  }),
}));

// Mock Supabase client creation
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
  })),
}));

// Mock storage functions
vi.mock("@/lib/storage/client", () => ({
  uploadPropertyImage: vi.fn(),
  deletePropertyImage: vi.fn(),
}));

// Mock property limit helpers
vi.mock("@/lib/permissions/property-limits", () => ({
  canCreateProperty: vi.fn(),
  canUploadImage: vi.fn(),
  getPropertyLimit: vi.fn(),
  getImageLimit: vi.fn(),
  getFeaturedLimit: vi.fn(),
  getTierDisplayName: vi.fn(),
  getTierFeatures: vi.fn(),
  getTierPricing: vi.fn(),
}));
