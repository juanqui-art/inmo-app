/**
 * TEST HELPERS
 *
 * Utility functions for testing Server Actions and components
 */

/**
 * SafeUser type - matches @repo/database SafeUser
 * Excludes sensitive fields like password
 */
type SafeUser = {
  id: string;
  email: string;
  name: string | null;
  role: "CLIENT" | "AGENT" | "ADMIN";
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<SafeUser>): SafeUser {
  return {
    id: "test-user-id",
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
 * Create a mock FormData object for testing
 */
export function createMockFormData(data: Record<string, string | number | null | undefined>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Create a valid property data object
 */
export function createValidPropertyData(overrides?: Record<string, unknown>) {
  return {
    title: "Casa en venta con jardín",
    description: "Una hermosa casa con amplio jardín y excelente ubicación en zona residencial",
    price: 250000,
    transactionType: "SALE",
    category: "HOUSE",
    status: "AVAILABLE",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    address: "Calle Principal 123",
    city: "Madrid",
    state: "Comunidad de Madrid",
    zipCode: "28001",
    latitude: 40.4168,
    longitude: -3.7038,
    ...overrides,
  };
}
