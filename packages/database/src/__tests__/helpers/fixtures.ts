/**
 * TEST FIXTURES
 *
 * Sample data for testing PropertyRepository
 */

// Use type definitions instead of importing from Prisma
// This avoids dependency on generated Prisma types in test environment
type UserRole = "CLIENT" | "AGENT" | "ADMIN";
type TransactionType = "SALE" | "RENT";
type PropertyCategory = "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL";
type PropertyStatus = "AVAILABLE" | "PENDING" | "SOLD" | "RENTED";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Property {
  id: string;
  title: string;
  description: string | null;
  price: any; // Decimal type
  transactionType: TransactionType;
  category: PropertyCategory;
  status: PropertyStatus;
  bedrooms: number | null;
  bathrooms: any; // Decimal type
  area: any; // Decimal type
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: any; // Decimal type
  longitude: any; // Decimal type
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  propertyId: string;
  createdAt: Date;
}

// Mock Decimal class for tests
class Decimal {
  constructor(public value: string | number) {}
  toString() {
    return String(this.value);
  }
  toNumber() {
    return Number(this.value);
  }
}

/**
 * Mock users for testing authorization
 */
export const mockUsers = {
  agent: {
    id: "agent-123",
    email: "agent@test.com",
    name: "Test Agent",
    role: "AGENT" as UserRole,
    phone: "+1234567890",
    avatar: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  } as User,

  anotherAgent: {
    id: "agent-456",
    email: "another@test.com",
    name: "Another Agent",
    role: "AGENT" as UserRole,
    phone: "+0987654321",
    avatar: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  } as User,

  admin: {
    id: "admin-789",
    email: "admin@test.com",
    name: "Test Admin",
    role: "ADMIN" as UserRole,
    phone: "+1111111111",
    avatar: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  } as User,

  client: {
    id: "client-999",
    email: "client@test.com",
    name: "Test Client",
    role: "CLIENT" as UserRole,
    phone: "+2222222222",
    avatar: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  } as User,
};

/**
 * Mock property for testing
 */
export const mockProperty: Property = {
  id: "property-123",
  title: "Beautiful House in Madrid",
  description: "A beautiful house with 3 bedrooms and 2 bathrooms",
  price: new Decimal("250000.00"),
  transactionType: "SALE",
  category: "HOUSE",
  status: "AVAILABLE",
  bedrooms: 3,
  bathrooms: new Decimal("2.0"),
  area: new Decimal("150.50"),
  address: "Calle Principal 123",
  city: "Madrid",
  state: "Comunidad de Madrid",
  zipCode: "28001",
  latitude: new Decimal("40.4168"),
  longitude: new Decimal("-3.7038"),
  agentId: mockUsers.agent.id,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

/**
 * Mock property images
 */
export const mockPropertyImages: PropertyImage[] = [
  {
    id: "image-1",
    url: "https://example.com/image1.jpg",
    alt: "Front view",
    order: 0,
    propertyId: mockProperty.id,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "image-2",
    url: "https://example.com/image2.jpg",
    alt: "Living room",
    order: 1,
    propertyId: mockProperty.id,
    createdAt: new Date("2025-01-01"),
  },
];

/**
 * Mock property with relations (as returned by repository)
 */
export const mockPropertyWithRelations = {
  ...mockProperty,
  images: mockPropertyImages,
  agent: mockUsers.agent,
};

/**
 * Valid property creation data
 */
export const validPropertyData = {
  title: "New Property for Testing",
  description: "This is a test property with all required fields",
  price: new Decimal("300000.00"),
  transactionType: "SALE" as const,
  category: "APARTMENT" as const,
  status: "AVAILABLE" as const,
  bedrooms: 2,
  bathrooms: new Decimal("1.5"),
  area: new Decimal("100.00"),
  address: "Test Street 456",
  city: "Barcelona",
  state: "Cataluña",
  zipCode: "08001",
  latitude: new Decimal("41.3851"),
  longitude: new Decimal("2.1734"),
};

/**
 * Valid property update data
 */
export const validUpdateData = {
  title: "Updated Property Title",
  price: new Decimal("280000.00"),
  status: "PENDING" as const,
};
