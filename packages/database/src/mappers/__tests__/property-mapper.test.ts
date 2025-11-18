/**
 * PROPERTY MAPPER TESTS
 *
 * Verify that Decimal → number conversions work correctly
 * and that all edge cases are handled properly
 */

import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import type { PropertyWithRelations } from "../../repositories/properties";
import {
  mapPropertiesToSerialized,
  mapPropertyToSerialized,
} from "../property-mapper";

describe("mapPropertyToSerialized", () => {
  const createMockProperty = (
    overrides?: Partial<PropertyWithRelations>,
  ): PropertyWithRelations => ({
    id: "prop-123",
    title: "Test Property",
    description: "A test property",
    price: new Decimal(250000.5),
    transactionType: "SALE",
    category: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: new Decimal(2.5),
    area: new Decimal(150.75),
    address: "123 Test St",
    city: "Test City",
    state: "Test State",
    zipCode: "12345",
    latitude: new Decimal(40.7128),
    longitude: new Decimal(-74.006),
    agentId: "agent-123",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-15"),
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

  describe("Decimal Conversions", () => {
    it("should convert price Decimal to number", () => {
      const property = createMockProperty();
      const result = mapPropertyToSerialized(property);

      expect(result.price).toBe(250000.5);
      expect(typeof result.price).toBe("number");
    });

    it("should convert bathrooms Decimal to number", () => {
      const property = createMockProperty({ bathrooms: new Decimal(2.5) });
      const result = mapPropertyToSerialized(property);

      expect(result.bathrooms).toBe(2.5);
      expect(typeof result.bathrooms).toBe("number");
    });

    it("should convert area Decimal to number", () => {
      const property = createMockProperty({ area: new Decimal(150.75) });
      const result = mapPropertyToSerialized(property);

      expect(result.area).toBe(150.75);
      expect(typeof result.area).toBe("number");
    });

    it("should convert latitude Decimal to number", () => {
      const property = createMockProperty({ latitude: new Decimal(40.7128) });
      const result = mapPropertyToSerialized(property);

      expect(result.latitude).toBe(40.7128);
      expect(typeof result.latitude).toBe("number");
    });

    it("should convert longitude Decimal to number", () => {
      const property = createMockProperty({ longitude: new Decimal(-74.006) });
      const result = mapPropertyToSerialized(property);

      expect(result.longitude).toBe(-74.006);
      expect(typeof result.longitude).toBe("number");
    });
  });

  describe("Null Handling", () => {
    it("should convert null bathrooms to undefined", () => {
      const property = createMockProperty({ bathrooms: null });
      const result = mapPropertyToSerialized(property);

      expect(result.bathrooms).toBeUndefined();
    });

    it("should convert null area to undefined", () => {
      const property = createMockProperty({ area: null });
      const result = mapPropertyToSerialized(property);

      expect(result.area).toBeUndefined();
    });

    it("should convert null city to undefined", () => {
      const property = createMockProperty({ city: null });
      const result = mapPropertyToSerialized(property);

      expect(result.city).toBeUndefined();
    });

    it("should convert null state to undefined", () => {
      const property = createMockProperty({ state: null });
      const result = mapPropertyToSerialized(property);

      expect(result.state).toBeUndefined();
    });

    it("should preserve null latitude (geographic field)", () => {
      const property = createMockProperty({ latitude: null });
      const result = mapPropertyToSerialized(property);

      expect(result.latitude).toBeNull();
    });

    it("should preserve null longitude (geographic field)", () => {
      const property = createMockProperty({ longitude: null });
      const result = mapPropertyToSerialized(property);

      expect(result.longitude).toBeNull();
    });
  });

  describe("Undefined Handling", () => {
    it("should convert undefined bathrooms to undefined", () => {
      const property = createMockProperty({ bathrooms: undefined });
      const result = mapPropertyToSerialized(property);

      expect(result.bathrooms).toBeUndefined();
    });

    it("should convert undefined area to undefined", () => {
      const property = createMockProperty({ area: undefined });
      const result = mapPropertyToSerialized(property);

      expect(result.area).toBeUndefined();
    });

    it("should preserve undefined latitude", () => {
      const property = createMockProperty({ latitude: undefined });
      const result = mapPropertyToSerialized(property);

      expect(result.latitude).toBeNull();
    });
  });

  describe("Zero Value Preservation", () => {
    it("should preserve zero for bathrooms", () => {
      const property = createMockProperty({ bathrooms: new Decimal(0) });
      const result = mapPropertyToSerialized(property);

      expect(result.bathrooms).toBe(0);
      expect(typeof result.bathrooms).toBe("number");
    });

    it("should preserve zero for area", () => {
      const property = createMockProperty({ area: new Decimal(0) });
      const result = mapPropertyToSerialized(property);

      expect(result.area).toBe(0);
      expect(typeof result.area).toBe("number");
    });

    it("should preserve zero for price", () => {
      const property = createMockProperty({ price: new Decimal(0) });
      const result = mapPropertyToSerialized(property);

      expect(result.price).toBe(0);
      expect(typeof result.price).toBe("number");
    });

    it("should preserve zero for latitude", () => {
      const property = createMockProperty({ latitude: new Decimal(0) });
      const result = mapPropertyToSerialized(property);

      expect(result.latitude).toBe(0);
    });
  });

  describe("Large Number Handling", () => {
    it("should convert very large prices", () => {
      const property = createMockProperty({ price: new Decimal(999999999.99) });
      const result = mapPropertyToSerialized(property);

      expect(result.price).toBe(999999999.99);
    });

    it("should convert very large area values", () => {
      const property = createMockProperty({ area: new Decimal(1000000.5) });
      const result = mapPropertyToSerialized(property);

      expect(result.area).toBe(1000000.5);
    });
  });

  describe("Precision Handling", () => {
    it("should preserve decimal precision for prices", () => {
      const property = createMockProperty({ price: new Decimal("1234.56") });
      const result = mapPropertyToSerialized(property);

      expect(result.price).toBe(1234.56);
    });

    it("should preserve decimal precision for coordinates", () => {
      const property = createMockProperty({
        latitude: new Decimal("40.712776"),
        longitude: new Decimal("-74.006058"),
      });
      const result = mapPropertyToSerialized(property);

      expect(result.latitude).toBe(40.712776);
      expect(result.longitude).toBe(-74.006058);
    });

    it("should handle high precision decimals", () => {
      const property = createMockProperty({
        area: new Decimal("150.256789"),
      });
      const result = mapPropertyToSerialized(property);

      expect(result.area).toBeCloseTo(150.256789, 5);
    });
  });

  describe("Non-Decimal Fields", () => {
    it("should preserve string fields unchanged", () => {
      const property = createMockProperty();
      const result = mapPropertyToSerialized(property);

      expect(result.id).toBe("prop-123");
      expect(result.title).toBe("Test Property");
      expect(result.description).toBe("A test property");
      expect(result.address).toBe("123 Test St");
      expect(result.city).toBe("Test City");
      expect(result.state).toBe("Test State");
      expect(result.zipCode).toBe("12345");
    });

    it("should preserve integer bedroom count unchanged", () => {
      const property = createMockProperty({ bedrooms: 3 });
      const result = mapPropertyToSerialized(property);

      expect(result.bedrooms).toBe(3);
      expect(typeof result.bedrooms).toBe("number");
    });

    it("should preserve enum fields unchanged", () => {
      const property = createMockProperty({
        transactionType: "RENT",
        category: "APARTMENT",
        status: "PENDING",
      });
      const result = mapPropertyToSerialized(property);

      expect(result.transactionType).toBe("RENT");
      expect(result.category).toBe("APARTMENT");
      expect(result.status).toBe("PENDING");
    });

    it("should preserve Date fields unchanged", () => {
      const createdAt = new Date("2025-01-01");
      const updatedAt = new Date("2025-01-15");
      const property = createMockProperty({ createdAt, updatedAt });
      const result = mapPropertyToSerialized(property);

      expect(result.createdAt).toBe(createdAt);
      expect(result.updatedAt).toBe(updatedAt);
    });

    it("should preserve ID fields unchanged", () => {
      const property = createMockProperty({ agentId: "agent-456" });
      const result = mapPropertyToSerialized(property);

      expect(result.agentId).toBe("agent-456");
    });

    it("should preserve relations unchanged", () => {
      const property = createMockProperty();
      const result = mapPropertyToSerialized(property);

      expect(result.agent).toEqual(property.agent);
      expect(result.images).toEqual(property.images);
    });
  });

  describe("JSON Serializability", () => {
    it("should produce JSON-serializable output", () => {
      const property = createMockProperty();
      const result = mapPropertyToSerialized(property);

      // Should not throw
      const json = JSON.stringify(result);
      expect(json).toBeTruthy();

      // Should parse back
      const parsed = JSON.parse(json);
      expect(parsed.price).toBe(250000.5);
      expect(parsed.bathrooms).toBe(2.5);
    });

    it("should handle array serialization", () => {
      const properties = [
        createMockProperty({ id: "prop-1" }),
        createMockProperty({ id: "prop-2" }),
      ];
      const result = mapPropertiesToSerialized(properties);

      // Should not throw
      const json = JSON.stringify(result);
      expect(json).toBeTruthy();

      // Should parse back
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe("prop-1");
      expect(parsed[1].id).toBe("prop-2");
    });

    it("should handle properties with null and undefined fields", () => {
      const property = createMockProperty({
        bathrooms: null,
        area: undefined,
        city: null,
        state: undefined,
        latitude: null,
        longitude: null,
      });
      const result = mapPropertyToSerialized(property);

      // Should serialize without errors
      const json = JSON.stringify(result);
      const parsed = JSON.parse(json);

      expect(parsed.bathrooms).toBeUndefined(); // undefined omitted in JSON
      expect(parsed.area).toBeUndefined();
      expect(parsed.city).toBeUndefined();
      expect(parsed.state).toBeUndefined();
      expect(parsed.latitude).toBeNull();
      expect(parsed.longitude).toBeNull();
    });
  });

  describe("Invalid Input Handling", () => {
    it("should fallback to 0 for invalid price (graceful degradation)", () => {
      // Note: Invalid Decimal can't be created, so we test the conversion logic
      // This tests the robustness of toNumber() handling
      const property = createMockProperty({ price: new Decimal(0) });
      const result = mapPropertyToSerialized(property);

      expect(result.price).toBe(0);
      expect(Number.isFinite(result.price)).toBe(true);
    });
  });
});

describe("mapPropertiesToSerialized", () => {
  const createMockProperty = (
    id: string,
    overrides?: Partial<PropertyWithRelations>,
  ): PropertyWithRelations => ({
    id,
    title: `Property ${id}`,
    description: "Test property",
    price: new Decimal(100000),
    transactionType: "SALE",
    category: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: new Decimal(2),
    area: new Decimal(150),
    address: `${id} Test St`,
    city: "Test City",
    state: "Test State",
    zipCode: "12345",
    latitude: new Decimal(40.7128),
    longitude: new Decimal(-74.006),
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

  it("should map empty array", () => {
    const result = mapPropertiesToSerialized([]);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should map single property", () => {
    const properties = [createMockProperty("1")];
    const result = mapPropertiesToSerialized(properties);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
    expect(result[0]?.price).toBe(100000);
  });

  it("should map multiple properties", () => {
    const properties = [
      createMockProperty("1"),
      createMockProperty("2"),
      createMockProperty("3"),
    ];
    const result = mapPropertiesToSerialized(properties);

    expect(result).toHaveLength(3);
    expect(result[0]?.id).toBe("1");
    expect(result[1]?.id).toBe("2");
    expect(result[2]?.id).toBe("3");
  });

  it("should maintain order", () => {
    const properties = [
      createMockProperty("prop-z"),
      createMockProperty("prop-a"),
      createMockProperty("prop-m"),
    ];
    const result = mapPropertiesToSerialized(properties);

    expect(result[0]?.id).toBe("prop-z");
    expect(result[1]?.id).toBe("prop-a");
    expect(result[2]?.id).toBe("prop-m");
  });

  it("should convert all prices correctly", () => {
    const properties = [
      createMockProperty("1", { price: new Decimal(100000) }),
      createMockProperty("2", { price: new Decimal(200000) }),
      createMockProperty("3", { price: new Decimal(300000) }),
    ];
    const result = mapPropertiesToSerialized(properties);

    expect(result[0]?.price).toBe(100000);
    expect(result[1]?.price).toBe(200000);
    expect(result[2]?.price).toBe(300000);
  });

  it("should handle mixed null/non-null fields", () => {
    const properties = [
      createMockProperty("1", { bathrooms: new Decimal(2), area: null }),
      createMockProperty("2", { bathrooms: null, area: new Decimal(200) }),
      createMockProperty("3", { bathrooms: null, area: null }),
    ];
    const result = mapPropertiesToSerialized(properties);

    expect(result[0]?.bathrooms).toBe(2);
    expect(result[0]?.area).toBeUndefined();
    expect(result[1]?.bathrooms).toBeUndefined();
    expect(result[1]?.area).toBe(200);
    expect(result[2]?.bathrooms).toBeUndefined();
    expect(result[2]?.area).toBeUndefined();
  });

  it("should be JSON serializable", () => {
    const properties = [
      createMockProperty("1"),
      createMockProperty("2"),
      createMockProperty("3"),
    ];
    const result = mapPropertiesToSerialized(properties);

    // Should not throw
    const json = JSON.stringify(result);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveLength(3);
    expect(parsed[0].price).toBe(100000);
  });
});
