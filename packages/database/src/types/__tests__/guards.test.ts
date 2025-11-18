/**
 * TESTS FOR TYPE GUARDS
 *
 * Verify that runtime validation works correctly for system boundaries
 */

import { describe, expect, it } from "vitest";
import {
  assertIsSerializedProperty,
  isPropertyCategory,
  isPropertyStatus,
  isSerializedProperty,
  isTransactionType,
  parsePropertyFilters,
  type SerializedProperty,
} from "../guards";

describe("Type Guards", () => {
  describe("isPropertyCategory", () => {
    it("should accept valid categories", () => {
      expect(isPropertyCategory("HOUSE")).toBe(true);
      expect(isPropertyCategory("APARTMENT")).toBe(true);
      expect(isPropertyCategory("LAND")).toBe(true);
      expect(isPropertyCategory("COMMERCIAL")).toBe(true);
    });

    it("should reject invalid categories", () => {
      expect(isPropertyCategory("INVALID")).toBe(false);
      expect(isPropertyCategory("")).toBe(false);
      expect(isPropertyCategory(null)).toBe(false);
      expect(isPropertyCategory(undefined)).toBe(false);
      expect(isPropertyCategory(123)).toBe(false);
    });
  });

  describe("isPropertyStatus", () => {
    it("should accept valid statuses", () => {
      expect(isPropertyStatus("AVAILABLE")).toBe(true);
      expect(isPropertyStatus("PENDING")).toBe(true);
      expect(isPropertyStatus("SOLD")).toBe(true);
      expect(isPropertyStatus("RENTED")).toBe(true);
    });

    it("should reject invalid statuses", () => {
      expect(isPropertyStatus("INVALID")).toBe(false);
      expect(isPropertyStatus("")).toBe(false);
      expect(isPropertyStatus(null)).toBe(false);
      expect(isPropertyStatus(undefined)).toBe(false);
    });
  });

  describe("isTransactionType", () => {
    it("should accept valid transaction types", () => {
      expect(isTransactionType("SALE")).toBe(true);
      expect(isTransactionType("RENT")).toBe(true);
    });

    it("should reject invalid transaction types", () => {
      expect(isTransactionType("INVALID")).toBe(false);
      expect(isTransactionType("")).toBe(false);
      expect(isTransactionType(null)).toBe(false);
      expect(isTransactionType(undefined)).toBe(false);
    });
  });

  describe("isSerializedProperty", () => {
    const createValidProperty = (
      overrides?: Partial<SerializedProperty>,
    ): SerializedProperty => ({
      id: "prop-123",
      title: "Test Property",
      description: "A test property",
      price: 250000,
      transactionType: "SALE",
      category: "HOUSE",
      status: "AVAILABLE",
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      address: "123 Main St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      latitude: 40.7128,
      longitude: -74.006,
      agentId: "agent-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      agent: {
        id: "agent-123",
        email: "agent@test.com",
        name: "Test Agent",
        phone: null,
        avatar: null,
      },
      images: [],
      ...overrides,
    });

    it("should accept valid SerializedProperty", () => {
      const property = createValidProperty();
      expect(isSerializedProperty(property)).toBe(true);
    });

    it("should accept property with optional undefined fields", () => {
      const property = createValidProperty({
        bathrooms: undefined,
        area: undefined,
        bedrooms: undefined,
      });
      expect(isSerializedProperty(property)).toBe(true);
    });

    it("should accept property with null optional fields", () => {
      const property = createValidProperty({
        bathrooms: null,
        area: null,
        latitude: null,
        longitude: null,
      });
      expect(isSerializedProperty(property)).toBe(true);
    });

    it("should reject missing required fields", () => {
      const { id: _id, ...noId } = createValidProperty();
      expect(isSerializedProperty(noId)).toBe(false);

      const { price: _price, ...noPrice } = createValidProperty();
      expect(isSerializedProperty(noPrice)).toBe(false);

      const { title: _title, ...noTitle } = createValidProperty();
      expect(isSerializedProperty(noTitle)).toBe(false);
    });

    it("should reject invalid required field types", () => {
      expect(
        isSerializedProperty(createValidProperty({ id: 123 as any })),
      ).toBe(false);
      expect(
        isSerializedProperty(createValidProperty({ price: "abc" as any })),
      ).toBe(false);
      expect(
        isSerializedProperty(createValidProperty({ title: null as any })),
      ).toBe(false);
    });

    it("should reject invalid numeric fields", () => {
      expect(isSerializedProperty(createValidProperty({ price: -100 }))).toBe(
        false,
      );
      expect(isSerializedProperty(createValidProperty({ price: NaN }))).toBe(
        false,
      );
      expect(
        isSerializedProperty(createValidProperty({ price: Infinity })),
      ).toBe(false);
      expect(isSerializedProperty(createValidProperty({ bathrooms: -1 }))).toBe(
        false,
      );
      expect(isSerializedProperty(createValidProperty({ area: NaN }))).toBe(
        false,
      );
    });

    it("should reject invalid enum values", () => {
      expect(
        isSerializedProperty(
          createValidProperty({ category: "INVALID_CATEGORY" as any }),
        ),
      ).toBe(false);
      expect(
        isSerializedProperty(
          createValidProperty({ status: "INVALID_STATUS" as any }),
        ),
      ).toBe(false);
      expect(
        isSerializedProperty(
          createValidProperty({ transactionType: "INVALID_TYPE" as any }),
        ),
      ).toBe(false);
    });

    it("should reject invalid Date fields", () => {
      expect(
        isSerializedProperty(
          createValidProperty({ createdAt: "not-a-date" as any }),
        ),
      ).toBe(false);
      expect(
        isSerializedProperty(createValidProperty({ updatedAt: 12345 as any })),
      ).toBe(false);
    });

    it("should reject non-object values", () => {
      expect(isSerializedProperty(null)).toBe(false);
      expect(isSerializedProperty(undefined)).toBe(false);
      expect(isSerializedProperty("string")).toBe(false);
      expect(isSerializedProperty(123)).toBe(false);
      expect(isSerializedProperty([])).toBe(false);
    });
  });

  describe("assertIsSerializedProperty", () => {
    const createValidProperty = (overrides?: Partial<SerializedProperty>) => ({
      id: "prop-123",
      title: "Test Property",
      description: "A test property",
      price: 250000,
      transactionType: "SALE" as const,
      category: "HOUSE" as const,
      status: "AVAILABLE" as const,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      address: "123 Main St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      latitude: 40.7128,
      longitude: -74.006,
      agentId: "agent-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      agent: {
        id: "agent-123",
        email: "agent@test.com",
        name: "Test Agent",
        phone: null,
        avatar: null,
      },
      images: [],
      ...overrides,
    });

    it("should not throw for valid property", () => {
      const property = createValidProperty();
      expect(() => assertIsSerializedProperty(property)).not.toThrow();
    });

    it("should throw for invalid property", () => {
      const invalidProperty = createValidProperty({ price: -100 });
      expect(() => assertIsSerializedProperty(invalidProperty)).toThrow(
        TypeError,
      );
    });

    it("should throw with descriptive message", () => {
      expect(() => assertIsSerializedProperty(null)).toThrow(
        /Value is not a valid SerializedProperty/,
      );
    });
  });

  describe("parsePropertyFilters", () => {
    it("should parse valid filters", () => {
      const result = parsePropertyFilters({
        minPrice: 100000,
        maxPrice: 500000,
        category: "HOUSE",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minPrice).toBe(100000);
        expect(result.data.maxPrice).toBe(500000);
        expect(result.data.category).toBe("HOUSE");
      }
    });

    it("should parse filters with arrays", () => {
      const result = parsePropertyFilters({
        category: ["HOUSE", "APARTMENT"],
        transactionType: ["SALE", "RENT"],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toEqual(["HOUSE", "APARTMENT"]);
        expect(result.data.transactionType).toEqual(["SALE", "RENT"]);
      }
    });

    it("should parse empty filters", () => {
      const result = parsePropertyFilters({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid category", () => {
      const result = parsePropertyFilters({ category: "INVALID" });
      expect(result.success).toBe(false);
    });

    it("should reject negative prices", () => {
      const result = parsePropertyFilters({ minPrice: -100 });
      expect(result.success).toBe(false);
    });

    it("should reject invalid field types", () => {
      const result = parsePropertyFilters({
        minPrice: "not-a-number",
      });
      expect(result.success).toBe(false);
    });

    it("should reject unknown fields", () => {
      const result = parsePropertyFilters({
        minPrice: 100000,
        unknownField: "value",
      });
      expect(result.success).toBe(false);
    });
  });
});
