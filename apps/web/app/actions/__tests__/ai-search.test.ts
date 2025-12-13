/**
 * TESTS - AI Search Server Action
 *
 * Comprehensive tests for AI-powered natural language search:
 * - Input validation (empty, too long, valid queries)
 * - Rate limiting (authenticated/anonymous users)
 * - OpenAI parsing (success, failure, confidence levels)
 * - Location validation (valid cities, invalid cities, suggestions)
 * - Database queries (results found, no results, errors)
 * - Filter summary generation
 * - Suggestion generation (no results, low confidence)
 * - Error handling (parse errors, DB errors, rate limit errors)
 */

import { db } from "@repo/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  parseSearchQuery,
  filtersToWhereClause,
  isConfidentParse,
} from "@/lib/ai/search-parser";
import { aiSearchAction } from "../ai-search";

// Get mocked functions
const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockEnforceRateLimit = vi.mocked(enforceRateLimit);
const mockParseSearchQuery = vi.mocked(parseSearchQuery);
const mockDbPropertyFindMany = db.property.findMany as ReturnType<typeof vi.fn>;

// Also mock the helper functions from search-parser
vi.mock("@/lib/ai/search-parser", async () => {
  const actual = await vi.importActual("@/lib/ai/search-parser");
  return {
    ...actual,
    parseSearchQuery: vi.fn(),
    filtersToWhereClause: vi.fn((filters: any) => filters), // Passthrough for testing
    isConfidentParse: vi.fn((result: any, threshold: number) => result.confidence >= threshold),
  };
});

// Test helpers
function createMockUser(overrides?: { id?: string; role?: string }) {
  return {
    id: overrides?.id || "user-123",
    email: "user@example.com",
    name: "Test User",
    role: (overrides?.role as any) || "CLIENT",
    subscriptionTier: "FREE" as const,
    phone: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
  };
}

function createMockParseResult(overrides?: {
  success?: boolean;
  confidence?: number;
  filters?: any;
  error?: string;
  locationValidation?: any;
}) {
  return {
    success: overrides?.success !== undefined ? overrides.success : true,
    filters: overrides?.filters || {
      city: "Cuenca",
      category: "casa",
      minPrice: 100000,
      maxPrice: 200000,
      bedrooms: 3,
    },
    rawQuery: "casa 3 habitaciones en Cuenca bajo 200k",
    confidence: overrides?.confidence !== undefined ? overrides.confidence : 85,
    error: overrides?.error,
    locationValidation: overrides?.locationValidation,
  };
}

function createMockProperty(overrides?: {
  id?: string;
  title?: string;
  price?: number;
  city?: string;
}) {
  return {
    id: overrides?.id || "prop-123",
    title: overrides?.title || "Casa moderna en Cuenca",
    description: "Hermosa casa con jardín",
    price: overrides?.price || 150000,
    city: overrides?.city || "Cuenca",
    address: "Av. Ordoñez Lasso",
    category: "HOUSE",
    bedrooms: 3,
    bathrooms: 2.5,
    latitude: -2.9001,
    longitude: -79.0059,
  };
}

describe("AI Search Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockGetCurrentUser.mockResolvedValue(createMockUser());
    mockEnforceRateLimit.mockResolvedValue(undefined);
  });

  // ==================== INPUT VALIDATION ====================

  describe("Input Validation", () => {
    it("should reject empty query", async () => {
      const result = await aiSearchAction("");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Search query cannot be empty");
      expect(mockParseSearchQuery).not.toHaveBeenCalled();
    });

    it("should reject whitespace-only query", async () => {
      const result = await aiSearchAction("   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Search query cannot be empty");
    });

    it("should reject query longer than 500 characters", async () => {
      const longQuery = "a".repeat(501);

      const result = await aiSearchAction(longQuery);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Search query is too long (max 500 characters)");
      expect(mockParseSearchQuery).not.toHaveBeenCalled();
    });

    it("should accept query exactly 500 characters", async () => {
      const exactQuery = "a".repeat(500);
      mockParseSearchQuery.mockResolvedValue(createMockParseResult());
      mockDbPropertyFindMany.mockResolvedValue([]);

      const result = await aiSearchAction(exactQuery);

      expect(mockParseSearchQuery).toHaveBeenCalled();
      // Should not fail on length validation
    });
  });

  // ==================== RATE LIMITING ====================

  describe("Rate Limiting", () => {
    it("should enforce rate limit for authenticated users", async () => {
      const mockUser = createMockUser({ id: "user-456" });
      mockGetCurrentUser.mockResolvedValue(mockUser);

      mockParseSearchQuery.mockResolvedValue(createMockParseResult());
      mockDbPropertyFindMany.mockResolvedValue([]);

      await aiSearchAction("casa en Cuenca");

      expect(mockEnforceRateLimit).toHaveBeenCalledWith({
        userId: "user-456",
        tier: "ai-search",
      });
    });

    it("should enforce rate limit for anonymous users", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      mockParseSearchQuery.mockResolvedValue(createMockParseResult());
      mockDbPropertyFindMany.mockResolvedValue([]);

      await aiSearchAction("apartamento");

      expect(mockEnforceRateLimit).toHaveBeenCalledWith({
        userId: undefined,
        tier: "ai-search",
      });
    });

    it("should return error when rate limit exceeded", async () => {
      const rateLimitError = new Error("Rate limit exceeded. Please try again later.");
      rateLimitError.name = "RateLimitError";
      mockEnforceRateLimit.mockRejectedValue(rateLimitError);

      const result = await aiSearchAction("casa en Cuenca");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rate limit exceeded. Please try again later.");
      expect(mockParseSearchQuery).not.toHaveBeenCalled();
    });

    it("should handle non-rate-limit errors gracefully", async () => {
      const otherError = new Error("Database error");
      mockEnforceRateLimit.mockRejectedValue(otherError);

      const result = await aiSearchAction("casa");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  // ==================== OPENAI PARSING ====================

  describe("OpenAI Parsing", () => {
    it("should successfully parse valid query with high confidence", async () => {
      const mockParse = createMockParseResult({
        confidence: 90,
        filters: {
          city: "Cuenca",
          category: "apartamento",
          bedrooms: 2,
          maxPrice: 150000,
        },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([createMockProperty()]);

      const result = await aiSearchAction("apartamento 2 cuartos bajo 150k en Cuenca");

      expect(result.success).toBe(true);
      expect(result.confidence).toBe(90);
      expect(mockParseSearchQuery).toHaveBeenCalledWith(
        "apartamento 2 cuartos bajo 150k en Cuenca"
      );
    });

    it("should accept query with medium confidence (30-50%)", async () => {
      const mockParse = createMockParseResult({
        confidence: 40,
        filters: { city: "Cuenca" },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([]);

      const result = await aiSearchAction("propiedad en Cuenca");

      expect(result.success).toBe(true);
      expect(result.confidence).toBe(40);
    });

    it("should reject query with very low confidence (<30%)", async () => {
      const mockParse = createMockParseResult({
        confidence: 20,
        filters: {},
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);

      const result = await aiSearchAction("algo");

      expect(result.success).toBe(false);
      expect(result.confidence).toBe(20);
      expect(result.error).toContain("muy ambigua");
      expect(result.error).toContain("confianza: 20%");
      expect(mockDbPropertyFindMany).not.toHaveBeenCalled();
    });

    it("should handle parse failure gracefully", async () => {
      mockParseSearchQuery.mockResolvedValue({
        success: false,
        filters: {},
        rawQuery: "invalid",
        confidence: 0,
        error: "Failed to parse query with OpenAI",
      });

      const result = await aiSearchAction("invalid query");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to parse query with OpenAI");
      expect(mockDbPropertyFindMany).not.toHaveBeenCalled();
    });
  });

  // ==================== LOCATION VALIDATION ====================

  describe("Location Validation", () => {
    it("should reject invalid location with suggestions", async () => {
      const mockParse = createMockParseResult({
        confidence: 25,
        filters: { city: "Quito" }, // Invalid city
        locationValidation: {
          isValid: false,
          requestedLocation: "Quito",
          suggestedCities: ["Cuenca", "Gualaceo"],
          confidence: 0,
          message: "Ciudad no disponible",
        },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);

      const result = await aiSearchAction("casa en Quito");

      expect(result.success).toBe(false);
      expect(result.locationValidation).toBeDefined();
      expect(result.locationValidation?.isValid).toBe(false);
      expect(result.suggestions).toContain(
        "Especifica una ciudad válida: Cuenca, Gualaceo, Azogues o Paute"
      );
      expect(result.suggestions).toContain(
        "¿Quisiste decir: Cuenca, Gualaceo?"
      );
    });

    it("should accept valid location", async () => {
      const mockParse = createMockParseResult({
        confidence: 80,
        filters: { city: "Cuenca" },
        locationValidation: {
          isValid: true,
          requestedLocation: "Cuenca",
          matchedCity: "Cuenca",
          confidence: 100,
        },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([createMockProperty()]);

      const result = await aiSearchAction("casa en Cuenca");

      expect(result.success).toBe(true);
      expect(result.locationValidation?.isValid).toBe(true);
    });

    it("should provide generic suggestions when location missing", async () => {
      const mockParse = createMockParseResult({
        confidence: 25,
        filters: {}, // No location
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);

      const result = await aiSearchAction("casa barata");

      expect(result.success).toBe(false);
      expect(result.suggestions).toContain(
        "Especifica una ciudad (ej: Cuenca, Gualaceo)"
      );
    });
  });

  // ==================== DATABASE QUERIES ====================

  describe("Database Queries", () => {
    it("should query database with parsed filters", async () => {
      const mockParse = createMockParseResult({
        filters: {
          city: "Cuenca",
          category: "casa",
          minPrice: 100000,
          maxPrice: 200000,
          bedrooms: 3,
        },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([
        createMockProperty({ id: "prop-1", price: 150000 }),
        createMockProperty({ id: "prop-2", price: 180000 }),
      ]);

      const result = await aiSearchAction("casa 3 habitaciones en Cuenca bajo 200k");

      expect(mockDbPropertyFindMany).toHaveBeenCalledWith({
        where: mockParse.filters, // filtersToWhereClause passthrough
        select: expect.objectContaining({
          id: true,
          title: true,
          price: true,
          city: true,
        }),
        take: 50,
      });

      expect(result.success).toBe(true);
      expect(result.properties).toHaveLength(2);
      expect(result.totalResults).toBe(2);
    });

    it("should handle no results found", async () => {
      const mockParse = createMockParseResult({
        confidence: 70,
        filters: { city: "Gualaceo", maxPrice: 50000 },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([]);

      const result = await aiSearchAction("casa bajo 50k en Gualaceo");

      expect(result.success).toBe(true);
      expect(result.properties).toHaveLength(0);
      expect(result.totalResults).toBe(0);
      expect(result.suggestions).toContain(
        "Intenta ampliar tu búsqueda (ej: aumenta el presupuesto)"
      );
    });

    it("should handle database errors gracefully", async () => {
      const mockParse = createMockParseResult();
      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockRejectedValue(new Error("Database connection failed"));

      const result = await aiSearchAction("casa en Cuenca");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database connection failed");
    });

    it("should convert Decimal types to numbers", async () => {
      const mockParse = createMockParseResult();
      mockParseSearchQuery.mockResolvedValue(mockParse);

      // Mock property with Decimal types (as they come from Prisma)
      mockDbPropertyFindMany.mockResolvedValue([
        {
          id: "prop-1",
          title: "Casa moderna",
          description: "Hermosa casa",
          price: { toString: () => "150000.50" } as any, // Decimal
          city: "Cuenca",
          address: "Av. Principal",
          category: "HOUSE",
          bedrooms: 3,
          bathrooms: { toString: () => "2.5" } as any, // Decimal
          latitude: { toString: () => "-2.9001" } as any, // Decimal
          longitude: { toString: () => "-79.0059" } as any, // Decimal
        },
      ]);

      const result = await aiSearchAction("casa en Cuenca");

      expect(result.success).toBe(true);
      expect(result.properties![0].price).toBe(150000.5);
      expect(result.properties![0].bathrooms).toBe(2.5);
      expect(result.properties![0].latitude).toBe(-2.9001);
      expect(result.properties![0].longitude).toBe(-79.0059);
    });
  });

  // ==================== FILTER SUMMARY ====================

  describe("Filter Summary", () => {
    it("should generate accurate filter summary", async () => {
      const mockParse = createMockParseResult({
        filters: {
          city: "Cuenca",
          address: "El Vergel",
          category: "apartamento",
          minPrice: 100000,
          maxPrice: 200000,
          bedrooms: 2,
          features: ["piscina", "garaje"],
        },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([createMockProperty()]);

      const result = await aiSearchAction("apartamento 2 cuartos en El Vergel, Cuenca");

      expect(result.filterSummary).toEqual({
        city: "Cuenca",
        address: "El Vergel",
        category: "apartamento",
        priceRange: "$100k - $200k",
        bedrooms: 2,
        features: ["piscina", "garaje"],
      });
    });

    it("should format price range correctly (min only)", async () => {
      const mockParse = createMockParseResult({
        filters: { city: "Cuenca", minPrice: 150000 },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([]);

      const result = await aiSearchAction("casa sobre 150k");

      expect(result.filterSummary?.priceRange).toBe("$150k");
    });

    it("should format price range correctly (max only)", async () => {
      const mockParse = createMockParseResult({
        filters: { city: "Cuenca", maxPrice: 100000 },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([]);

      const result = await aiSearchAction("casa bajo 100k");

      expect(result.filterSummary?.priceRange).toBe("$100k");
    });
  });

  // ==================== SUGGESTIONS ====================

  describe("Suggestions", () => {
    it("should suggest improvements when no results found", async () => {
      const mockParse = createMockParseResult({
        confidence: 80,
        filters: { city: "Cuenca", bedrooms: 5 },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([]);

      const result = await aiSearchAction("casa 5 habitaciones");

      expect(result.suggestions).toContain(
        "Intenta ampliar tu búsqueda (ej: aumenta el presupuesto)"
      );
      expect(result.suggestions).toContain(
        "Explora otras ciudades: Cuenca, Gualaceo, Azogues, Paute"
      );
      expect(result.suggestions).toContain(
        "Considera propiedades con diferente número de habitaciones"
      );
    });

    it("should suggest more details for low confidence queries", async () => {
      const mockParse = createMockParseResult({
        confidence: 45, // Low but acceptable
        filters: { city: "Cuenca" },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([createMockProperty()]);

      const result = await aiSearchAction("propiedad en Cuenca");

      expect(result.suggestions).toContain(
        "Tu búsqueda tiene baja confianza, intenta ser más específico"
      );
      expect(result.suggestions).toContain(
        "Agrega más detalles (precio, ubicación, tipo de propiedad)"
      );
    });

    it("should not include suggestions for high-confidence successful searches", async () => {
      const mockParse = createMockParseResult({
        confidence: 90,
        filters: { city: "Cuenca", category: "casa", bedrooms: 3 },
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);
      mockDbPropertyFindMany.mockResolvedValue([
        createMockProperty(),
        createMockProperty({ id: "prop-2" }),
      ]);

      const result = await aiSearchAction("casa 3 habitaciones en Cuenca");

      expect(result.suggestions).toBeUndefined();
    });

    it("should suggest property type when missing and low confidence", async () => {
      const mockParse = createMockParseResult({
        confidence: 25,
        filters: { city: "Cuenca" }, // No category
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);

      const result = await aiSearchAction("algo en Cuenca");

      expect(result.suggestions).toContain(
        "Indica el tipo de propiedad (casa, apartamento, terreno)"
      );
    });

    it("should suggest price range when missing and low confidence", async () => {
      const mockParse = createMockParseResult({
        confidence: 28,
        filters: { city: "Cuenca", category: "casa" }, // No price
      });

      mockParseSearchQuery.mockResolvedValue(mockParse);

      const result = await aiSearchAction("casa en Cuenca");

      expect(result.suggestions).toContain(
        "Define un rango de precio (ej: bajo $150k)"
      );
    });
  });

  // ==================== ERROR HANDLING ====================

  describe("Error Handling", () => {
    it("should handle unexpected errors gracefully", async () => {
      mockParseSearchQuery.mockRejectedValue(new Error("OpenAI API timeout"));

      const result = await aiSearchAction("casa en Cuenca");

      expect(result.success).toBe(false);
      expect(result.error).toBe("OpenAI API timeout");
    });

    it("should handle non-Error exceptions", async () => {
      mockParseSearchQuery.mockRejectedValue("Something went wrong");

      const result = await aiSearchAction("casa");

      expect(result.success).toBe(false);
      expect(result.error).toBe("An unexpected error occurred during search");
    });

    it("should include query in response even on error", async () => {
      mockParseSearchQuery.mockResolvedValue({
        success: false,
        filters: {},
        rawQuery: "bad query",
        confidence: 0,
        error: "Parse failed",
      });

      const result = await aiSearchAction("bad query");

      expect(result.query).toBe("bad query");
      expect(result.success).toBe(false);
    });
  });
});
