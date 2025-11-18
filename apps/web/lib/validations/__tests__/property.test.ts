import { describe, expect, it } from "vitest";
import { createPropertySchema, updatePropertySchema } from "../property";

describe("createPropertySchema", () => {
  describe("price validation", () => {
    it("should reject negative prices", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: -100,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain(
          "El precio debe ser mayor a 0",
        );
      }
    });

    it("should reject zero price", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 0,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain(
          "El precio debe ser mayor a 0",
        );
      }
    });

    it("should accept valid positive prices", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(250000);
      }
    });

    it("should reject extremely high prices", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 2000000000, // 2 billion
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain(
          "El precio es demasiado alto",
        );
      }
    });
  });

  describe("title validation", () => {
    it("should reject titles that are too short", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain(
          "El título debe tener al menos 5 caracteres",
        );
      }
    });

    it("should reject titles that are too long", () => {
      const longTitle = "a".repeat(101);
      const result = createPropertySchema.safeParse({
        title: longTitle,
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain(
          "El título no puede exceder 100 caracteres",
        );
      }
    });

    it("should accept valid titles", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta con jardín",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Casa en venta con jardín");
      }
    });
  });

  describe("description validation", () => {
    it("should reject descriptions that are too short", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Corta",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain(
          "La descripción debe tener al menos 20 caracteres",
        );
      }
    });

    it("should accept valid descriptions", () => {
      const description =
        "Una hermosa casa con amplio jardín y excelente ubicación en zona residencial";
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description,
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe(description);
      }
    });
  });

  describe("category and transaction type", () => {
    it("should accept valid categories", () => {
      const categories = ["HOUSE", "APARTMENT", "LAND", "COMMERCIAL"] as const;

      categories.forEach((category) => {
        const result = createPropertySchema.safeParse({
          title: "Propiedad en venta",
          description: "Una excelente propiedad con buena ubicación",
          price: 250000,
          transactionType: "SALE",
          category,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe(category);
        }
      });
    });

    it("should reject invalid categories", () => {
      const result = createPropertySchema.safeParse({
        title: "Propiedad en venta",
        description: "Una excelente propiedad con buena ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "INVALID_CATEGORY",
      });

      expect(result.success).toBe(false);
    });

    it("should accept SALE and RENT transaction types", () => {
      const saleResult = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      const rentResult = createPropertySchema.safeParse({
        title: "Casa en renta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 1500,
        transactionType: "RENT",
        category: "HOUSE",
      });

      expect(saleResult.success).toBe(true);
      expect(rentResult.success).toBe(true);
    });
  });

  describe("optional fields", () => {
    it("should accept properties without optional fields", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
      });

      expect(result.success).toBe(true);
    });

    it("should accept valid bedrooms and bathrooms", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
        bedrooms: 3,
        bathrooms: 2.5,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.bedrooms).toBe(3);
        expect(result.data.bathrooms).toBe(2.5);
      }
    });

    it("should reject negative bedrooms", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
        bedrooms: -1,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("location fields", () => {
    it("should require city and state if address is provided", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
        address: "Calle Principal 123",
        // Missing city and state
      });

      expect(result.success).toBe(false);
    });

    it("should accept complete location data", () => {
      const result = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
        address: "Calle Principal 123",
        city: "Madrid",
        state: "Comunidad de Madrid",
        zipCode: "28001",
      });

      expect(result.success).toBe(true);
    });

    it("should validate latitude and longitude ranges", () => {
      const invalidLat = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
        latitude: 91, // Invalid: > 90
        longitude: 0,
      });

      const invalidLong = createPropertySchema.safeParse({
        title: "Casa en venta",
        description: "Una casa muy bonita con excelente ubicación",
        price: 250000,
        transactionType: "SALE",
        category: "HOUSE",
        latitude: 0,
        longitude: 181, // Invalid: > 180
      });

      expect(invalidLat.success).toBe(false);
      expect(invalidLong.success).toBe(false);
    });
  });

  describe("complete valid property", () => {
    it("should accept a fully populated valid property", () => {
      const result = createPropertySchema.safeParse({
        title: "Hermosa casa con jardín en zona residencial",
        description:
          "Una casa de 3 habitaciones y 2 baños con amplio jardín, garaje para 2 autos y excelente ubicación cerca de escuelas y centros comerciales",
        price: 350000,
        transactionType: "SALE",
        category: "HOUSE",
        status: "AVAILABLE",
        bedrooms: 3,
        bathrooms: 2,
        area: 150.5,
        address: "Calle de la Paz 45",
        city: "Barcelona",
        state: "Cataluña",
        zipCode: "08001",
        latitude: 41.3851,
        longitude: 2.1734,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe(
          "Hermosa casa con jardín en zona residencial",
        );
        expect(result.data.price).toBe(350000);
        expect(result.data.bedrooms).toBe(3);
        expect(result.data.bathrooms).toBe(2);
        expect(result.data.latitude).toBe(41.3851);
        expect(result.data.longitude).toBe(2.1734);
      }
    });
  });
});

describe("updatePropertySchema", () => {
  it("should require a valid UUID", () => {
    const result = updatePropertySchema.safeParse({
      id: "invalid-uuid",
      title: "Updated title",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.issues?.[0]?.message).toContain(
        "ID de propiedad inválido",
      );
    }
  });

  it("should accept valid UUID", () => {
    const result = updatePropertySchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Casa actualizada",
    });

    expect(result.success).toBe(true);
  });

  it("should allow partial updates", () => {
    const result = updatePropertySchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      price: 300000,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("123e4567-e89b-12d3-a456-426614174000");
      expect(result.data.price).toBe(300000);
      expect(result.data.title).toBeUndefined();
    }
  });

  it("should allow nullable fields", () => {
    const result = updatePropertySchema.safeParse({
      id: "123e4567-e89b-12d3-a456-426614174000",
      bedrooms: null,
      bathrooms: null,
    });

    expect(result.success).toBe(true);
  });
});
