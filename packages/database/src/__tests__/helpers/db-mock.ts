/**
 * DATABASE MOCK HELPERS
 *
 * Provides utilities for mocking Prisma client in tests
 * Supports transaction mocking and common database operations
 */

import type { PrismaClient } from "@prisma/client";
import { vi } from "vitest";

/**
 * Creates a mock Prisma transaction context
 * Used to test repository methods that use db.$transaction()
 */
export function createMockTransaction() {
  return {
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
    propertyImage: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

/**
 * Creates a mock database client with transaction support
 */
export function createMockDb() {
  const mockTransaction = createMockTransaction();

  return {
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
    propertyImage: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      // Execute callback with mock transaction context
      return callback(mockTransaction);
    }),
  } as unknown as PrismaClient;
}

/**
 * Resets all mocks in a database client
 */
export function resetDbMocks(db: any) {
  Object.values(db).forEach((model: any) => {
    if (typeof model === "object" && model !== null) {
      Object.values(model).forEach((method: any) => {
        if (typeof method?.mockReset === "function") {
          method.mockReset();
        }
      });
    }
  });

  if (typeof db.$transaction?.mockReset === "function") {
    db.$transaction.mockReset();
  }
}
