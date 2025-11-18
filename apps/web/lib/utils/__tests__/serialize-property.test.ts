import { Decimal } from "@prisma/client/runtime/library";
import type { PropertyWithRelations } from "@repo/database";
import { describe, expect, it } from "vitest";
import { serializeProperties, serializeProperty } from "../serialize-property";

describe("serializeProperty", () => {
  it("should convert Decimal price to number", () => {
    const property: PropertyWithRelations = {
      id: "123",
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
        name: null,
        phone: null,
        avatar: null,
      },
      images: [],
    };

    const result = serializeProperty(property);

    expect(result.price).toBe(250000.5);
    expect(typeof result.price).toBe("number");
  });

  it("should convert optional Decimal fields to number or null", () => {
    const property: PropertyWithRelations = {
      id: "123",
      title: "Test Property",
      description: "A test property",
      price: new Decimal(250000),
      transactionType: "SALE",
      category: "HOUSE",
      status: "AVAILABLE",
      bedrooms: 3,
      bathrooms: new Decimal(2.5),
      area: new Decimal(150.0),
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
        name: null,
        phone: null,
        avatar: null,
      },
      images: [],
    };

    const result = serializeProperty(property);

    expect(result.bathrooms).toBe(2.5);
    expect(typeof result.bathrooms).toBe("number");
    expect(result.area).toBe(150.0);
    expect(typeof result.area).toBe("number");
    expect(result.latitude).toBe(40.7128);
    expect(typeof result.latitude).toBe("number");
    expect(result.longitude).toBe(-74.006);
    expect(typeof result.longitude).toBe("number");
  });

  it("should handle null optional Decimal fields", () => {
    const property: PropertyWithRelations = {
      id: "123",
      title: "Test Property",
      description: "A test property",
      price: new Decimal(250000),
      transactionType: "SALE",
      category: "LAND",
      status: "AVAILABLE",
      bedrooms: null,
      bathrooms: null,
      area: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      latitude: null,
      longitude: null,
      agentId: "agent-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      agent: {
        id: "agent-123",
        email: "agent@test.com",
        name: null,
        phone: null,
        avatar: null,
      },
      images: [],
    };

    const result = serializeProperty(property);

    expect(result.bathrooms).toBeNull();
    expect(result.area).toBeNull();
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
  });

  it("should preserve non-Decimal fields", () => {
    const createdAt = new Date("2024-01-01");
    const updatedAt = new Date("2024-01-15");

    const property: PropertyWithRelations = {
      id: "123",
      title: "Test Property",
      description: "A test property description",
      price: new Decimal(250000),
      transactionType: "SALE",
      category: "HOUSE",
      status: "AVAILABLE",
      bedrooms: 3,
      bathrooms: new Decimal(2.0),
      area: new Decimal(150.0),
      address: "123 Test St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      latitude: new Decimal(40.7128),
      longitude: new Decimal(-74.006),
      agentId: "agent-123",
      createdAt,
      updatedAt,
      agent: {
        id: "agent-123",
        email: "agent@test.com",
        name: "Test Agent",
        phone: null,
        avatar: null,
      },
      images: [],
    };

    const result = serializeProperty(property);

    expect(result.id).toBe("123");
    expect(result.title).toBe("Test Property");
    expect(result.description).toBe("A test property description");
    expect(result.transactionType).toBe("SALE");
    expect(result.category).toBe("HOUSE");
    expect(result.status).toBe("AVAILABLE");
    expect(result.bedrooms).toBe(3);
    expect(result.createdAt).toBe(createdAt);
    expect(result.updatedAt).toBe(updatedAt);
    expect(result.agent.name).toBe("Test Agent");
  });

  it("should handle properties with images", () => {
    const property: PropertyWithRelations = {
      id: "123",
      title: "Test Property",
      description: "A test property",
      price: new Decimal(250000),
      transactionType: "SALE",
      category: "HOUSE",
      status: "AVAILABLE",
      bedrooms: 3,
      bathrooms: new Decimal(2.0),
      area: new Decimal(150.0),
      address: null,
      city: null,
      state: null,
      zipCode: null,
      latitude: null,
      longitude: null,
      agentId: "agent-123",
      createdAt: new Date(),
      updatedAt: new Date(),
      agent: {
        id: "agent-123",
        email: "agent@test.com",
        name: null,
        phone: null,
        avatar: null,
      },
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
    };

    const result = serializeProperty(property);

    expect(result.images).toHaveLength(2);
    expect(result.images?.[0]?.url).toBe("https://example.com/image1.jpg");
    expect(result.images?.[1]?.url).toBe("https://example.com/image2.jpg");
  });
});

describe("serializeProperties", () => {
  it("should serialize an empty array", () => {
    const result = serializeProperties([]);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should serialize multiple properties", () => {
    const properties: PropertyWithRelations[] = [
      {
        id: "1",
        title: "Property 1",
        description: "First test property",
        price: new Decimal(100000),
        transactionType: "SALE",
        category: "HOUSE",
        status: "AVAILABLE",
        bedrooms: 2,
        bathrooms: new Decimal(1.5),
        area: new Decimal(100.0),
        address: null,
        city: null,
        state: null,
        zipCode: null,
        latitude: null,
        longitude: null,
        agentId: "agent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        agent: {
          id: "agent-1",
          email: "agent1@test.com",
          name: null,
          phone: null,
          avatar: null,
        },
        images: [],
      },
      {
        id: "2",
        title: "Property 2",
        description: "Second test property",
        price: new Decimal(200000),
        transactionType: "RENT",
        category: "APARTMENT",
        status: "AVAILABLE",
        bedrooms: 3,
        bathrooms: new Decimal(2.0),
        area: new Decimal(150.0),
        address: null,
        city: null,
        state: null,
        zipCode: null,
        latitude: null,
        longitude: null,
        agentId: "agent-2",
        createdAt: new Date(),
        updatedAt: new Date(),
        agent: {
          id: "agent-2",
          email: "agent2@test.com",
          name: null,
          phone: null,
          avatar: null,
        },
        images: [],
      },
    ];

    const result = serializeProperties(properties);

    expect(result).toHaveLength(2);
    expect(result?.[0]?.price).toBe(100000);
    expect(typeof result?.[0]?.price).toBe("number");
    expect(result?.[0]?.bathrooms).toBe(1.5);
    expect(result?.[1]?.price).toBe(200000);
    expect(typeof result?.[1]?.price).toBe("number");
    expect(result?.[1]?.bathrooms).toBe(2.0);
  });

  it("should maintain array order", () => {
    const properties: PropertyWithRelations[] = [
      {
        id: "1",
        title: "First",
        description: "First property",
        price: new Decimal(100000),
        transactionType: "SALE",
        category: "HOUSE",
        status: "AVAILABLE",
        bedrooms: null,
        bathrooms: null,
        area: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        latitude: null,
        longitude: null,
        agentId: "agent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        agent: {
          id: "agent-1",
          email: "agent@test.com",
          name: null,
          phone: null,
          avatar: null,
        },
        images: [],
      },
      {
        id: "2",
        title: "Second",
        description: "Second property",
        price: new Decimal(200000),
        transactionType: "SALE",
        category: "HOUSE",
        status: "AVAILABLE",
        bedrooms: null,
        bathrooms: null,
        area: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        latitude: null,
        longitude: null,
        agentId: "agent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        agent: {
          id: "agent-1",
          email: "agent@test.com",
          name: null,
          phone: null,
          avatar: null,
        },
        images: [],
      },
      {
        id: "3",
        title: "Third",
        description: "Third property",
        price: new Decimal(300000),
        transactionType: "SALE",
        category: "HOUSE",
        status: "AVAILABLE",
        bedrooms: null,
        bathrooms: null,
        area: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        latitude: null,
        longitude: null,
        agentId: "agent-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        agent: {
          id: "agent-1",
          email: "agent@test.com",
          name: null,
          phone: null,
          avatar: null,
        },
        images: [],
      },
    ];

    const result = serializeProperties(properties);

    expect(result?.[0]?.title).toBe("First");
    expect(result?.[1]?.title).toBe("Second");
    expect(result?.[2]?.title).toBe("Third");
    expect(result?.[0]?.id).toBe("1");
    expect(result?.[1]?.id).toBe("2");
    expect(result?.[2]?.id).toBe("3");
  });
});
