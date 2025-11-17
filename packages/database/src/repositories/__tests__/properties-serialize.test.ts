/**
 * Tests for serializeProperty and serializeProperties functions
 *
 * These functions convert Prisma results (with Decimal types) to
 * JSON-serializable format (with number types) for passing to Client Components
 */

import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import { serializeProperty, serializeProperties } from "../properties";
import type { PropertyWithRelations } from "../properties";

describe("serializeProperty", () => {
  const createMockProperty = (overrides?: Partial<PropertyWithRelations>): PropertyWithRelations => ({
    id: "test-123",
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

  it("should convert Decimal price to number", () => {
    const property = createMockProperty();
    const result = serializeProperty(property);

    expect(result.price).toBe(250000.5);
    expect(typeof result.price).toBe("number");
  });

  it("should convert price field correctly", () => {
    const property = createMockProperty({ price: new Decimal("500000.99") });
    const result = serializeProperty(property);

    expect(result.price).toBe(500000.99);
    expect(typeof result.price).toBe("number");
  });

  it("should convert optional Decimal fields to number or undefined", () => {
    const property = createMockProperty({
      bathrooms: new Decimal(2.5),
      area: new Decimal(150.0),
    });
    const result = serializeProperty(property);

    expect(result.bathrooms).toBe(2.5);
    expect(typeof result.bathrooms).toBe("number");
    expect(result.area).toBe(150.0);
    expect(typeof result.area).toBe("number");
  });

  it("should convert null optional Decimal fields to undefined", () => {
    const property = createMockProperty({
      bathrooms: null,
      area: null,
    });
    const result = serializeProperty(property);

    // Optional Decimal fields convert null → undefined
    expect(result.bathrooms).toBeUndefined();
    expect(result.area).toBeUndefined();
  });

  it("should convert geographic coordinates: null → null", () => {
    const property = createMockProperty({
      latitude: null,
      longitude: null,
    });
    const result = serializeProperty(property);

    // Non-optional numeric fields convert null → null (not undefined)
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
  });

  it("should convert optional string fields: null → undefined", () => {
    const property = createMockProperty({
      city: null,
      state: null,
    });
    const result = serializeProperty(property);

    expect(result.city).toBeUndefined();
    expect(result.state).toBeUndefined();
  });

  it("should preserve non-Decimal fields unchanged", () => {
    const createdAt = new Date("2024-01-01");
    const updatedAt = new Date("2024-01-15");

    const property = createMockProperty({
      createdAt,
      updatedAt,
    });
    const result = serializeProperty(property);

    expect(result.id).toBe("test-123");
    expect(result.title).toBe("Test Property");
    expect(result.description).toBe("A test property");
    expect(result.transactionType).toBe("SALE");
    expect(result.category).toBe("HOUSE");
    expect(result.status).toBe("AVAILABLE");
    expect(result.address).toBe("123 Test St");
    expect(result.city).toBe("Test City");
    expect(result.state).toBe("Test State");
    expect(result.zipCode).toBe("12345");
    expect(result.agentId).toBe("agent-123");
    expect(result.createdAt).toBe(createdAt);
    expect(result.updatedAt).toBe(updatedAt);
  });

  it("should preserve agent data and relationships", () => {
    const property = createMockProperty();
    const result = serializeProperty(property);

    expect(result.agent.id).toBe("agent-123");
    expect(result.agent.email).toBe("agent@test.com");
    expect(result.agent.name).toBe("Test Agent");
    expect(result.agent.phone).toBeNull();
    expect(result.agent.avatar).toBeNull();
  });

  it("should handle properties with images", () => {
    const property = createMockProperty({
      images: [
        {
          id: "img-1",
          url: "https://example.com/image1.jpg",
          alt: "Image 1",
          order: 0,
        },
        {
          id: "img-2",
          url: "https://example.com/image2.jpg",
          alt: "Image 2",
          order: 1,
        },
      ],
    });
    const result = serializeProperty(property);

    expect(result.images).toHaveLength(2);
    expect(result.images[0]?.url).toBe("https://example.com/image1.jpg");
    expect(result.images[1]?.url).toBe("https://example.com/image2.jpg");
  });

  it("should preserve zero values for optional numeric fields", () => {
    const property = createMockProperty({
      bathrooms: new Decimal(0),
      area: new Decimal(0),
      bedrooms: 0,
    });
    const result = serializeProperty(property);

    // Zero values should be preserved, not treated as falsy
    expect(result.bathrooms).toBe(0);
    expect(result.area).toBe(0);
    expect(result.bedrooms).toBe(0);
  });
});

describe("serializeProperties", () => {
  const createMockProperty = (id: string, overrides?: Partial<PropertyWithRelations>): PropertyWithRelations => ({
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

  it("should serialize an empty array", () => {
    const result = serializeProperties([]);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should serialize multiple properties", () => {
    const properties = [
      createMockProperty("1"),
      createMockProperty("2", {
        price: new Decimal(200000),
        transactionType: "RENT",
        category: "APARTMENT",
      }),
    ];

    const result = serializeProperties(properties);

    expect(result).toHaveLength(2);
    expect(result[0]?.price).toBe(100000);
    expect(typeof result[0]?.price).toBe("number");
    expect(result[0]?.bathrooms).toBe(2);
    expect(result[1]?.price).toBe(200000);
    expect(result[1]?.category).toBe("APARTMENT");
  });

  it("should maintain array order", () => {
    const properties = [
      createMockProperty("1"),
      createMockProperty("2"),
      createMockProperty("3"),
    ];

    const result = serializeProperties(properties);

    expect(result[0]?.id).toBe("1");
    expect(result[1]?.id).toBe("2");
    expect(result[2]?.id).toBe("3");
    expect(result[0]?.title).toBe("Property 1");
    expect(result[1]?.title).toBe("Property 2");
    expect(result[2]?.title).toBe("Property 3");
  });

  it("should handle mixed null and non-null optional fields", () => {
    const properties = [
      createMockProperty("1", { bathrooms: new Decimal(2), area: null }),
      createMockProperty("2", { bathrooms: null, area: new Decimal(200) }),
      createMockProperty("3", { bathrooms: null, area: null }),
    ];

    const result = serializeProperties(properties);

    expect(result[0]?.bathrooms).toBe(2);
    expect(result[0]?.area).toBeUndefined();
    expect(result[1]?.bathrooms).toBeUndefined();
    expect(result[1]?.area).toBe(200);
    expect(result[2]?.bathrooms).toBeUndefined();
    expect(result[2]?.area).toBeUndefined();
  });
});
