import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
// NOTE: NODE_ENV is automatically set to "test" by vitest
// NOTE: @repo/env automatically skips validation when NODE_ENV === "test"

// Mock database repositories BEFORE they're imported
const dbMock = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  property: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
  },
  propertyImage: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  appointment: {
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  favorite: {
    count: vi.fn(),
  },
};

vi.mock("@repo/database", () => {
  return {
    db: dbMock,
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
      delete: vi.fn(),
    },
    FavoriteRepository: vi.fn(() => ({
      toggleFavorite: vi.fn(),
      getUserFavorites: vi.fn(),
      isFavorite: vi.fn(),
    })),
  };
});

// Also mock the /src/client path (used by some Server Actions)
vi.mock("@repo/database/src/client", () => ({
  db: dbMock,
}));

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

// Mock CSRF protection functions
vi.mock("@/lib/csrf", () => ({
  validateCSRFToken: vi.fn(),
  isCSRFError: vi.fn((error: any) => error?.name === "CSRFError"),
}));

// Mock rate limiting functions
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
  isRateLimitError: vi.fn((error: any) => error?.name === "RateLimitError"),
}));
