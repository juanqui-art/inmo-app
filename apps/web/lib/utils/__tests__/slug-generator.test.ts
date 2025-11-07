import { describe, it, expect } from "vitest";
import { generateSlug, isSlugValid, parseIdSlugParam } from "../slug-generator";

describe("slug-generator", () => {
  describe("generateSlug", () => {
    it("should convert basic strings to lowercase with hyphens", () => {
      expect(generateSlug("Apartamento Moderno")).toBe("apartamento-moderno");
      expect(generateSlug("Casa en Quito")).toBe("casa-en-quito");
    });

    it("should handle Spanish accents and diacritical marks", () => {
      expect(generateSlug("Apartamento Moderno en Quito")).toBe(
        "apartamento-moderno-en-quito",
      );
      expect(generateSlug("Héllo Wørld")).toBe("hello-world");
      expect(generateSlug("Á é í ó ú")).toBe("a-e-i-o-u");
    });

    it("should remove special characters", () => {
      expect(generateSlug("Suite 2♥ - $50,000")).toBe("suite-2-50000");
      expect(generateSlug("Casa/Villa/Duplex")).toBe("casavilladuplex");
      expect(generateSlug("Prop. 123")).toBe("prop-123");
    });

    it("should handle multiple spaces and hyphens", () => {
      expect(generateSlug("Multiple   Spaces   Here")).toBe(
        "multiple-spaces-here",
      );
      expect(generateSlug("Already-Has-Hyphens")).toBe("already-has-hyphens");
      expect(generateSlug("Mix --- of --- hyphens")).toBe("mix-of-hyphens");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(generateSlug("-Start with hyphen")).toBe("start-with-hyphen");
      expect(generateSlug("End with hyphen-")).toBe("end-with-hyphen");
      expect(generateSlug("---Surrounded by hyphens---")).toBe(
        "surrounded-by-hyphens",
      );
    });

    it("should respect maxLength parameter", () => {
      const slug = generateSlug(
        "This is a very long property title that should be truncated",
        20,
      );
      expect(slug.length).toBeLessThanOrEqual(20);
      expect(slug).toBe("this-is-a-very-long");
    });

    it("should handle empty strings", () => {
      expect(generateSlug("")).toBe("");
      expect(generateSlug("   ")).toBe("");
    });

    it("should handle only special characters", () => {
      expect(generateSlug("!@#$%^&*()")).toBe("");
      expect(generateSlug("---***---")).toBe("");
    });

    it("should handle real property examples", () => {
      expect(generateSlug("Departamento de Lujo en La Mariscal")).toBe(
        "departamento-de-lujo-en-la-mariscal",
      );
      expect(generateSlug("Villa con Piscina - Sector Privado")).toBe(
        "villa-con-piscina-sector-privado",
      );
      expect(generateSlug("Penthouse 5 ⭐ - Premium")).toBe(
        "penthouse-5-premium",
      );
    });
  });

  describe("isSlugValid", () => {
    it("should validate matching slugs", () => {
      const title = "Apartamento Moderno";
      const slug = generateSlug(title);
      expect(isSlugValid(title, slug)).toBe(true);
    });

    it("should reject non-matching slugs", () => {
      const title = "Apartamento Moderno";
      expect(isSlugValid(title, "apartamento-viejo")).toBe(false);
      expect(isSlugValid(title, "something-else")).toBe(false);
    });

    it("should be case-insensitive", () => {
      const title = "Apartamento Moderno";
      // Should match even if title case differs
      expect(isSlugValid("apartamento moderno", generateSlug(title))).toBe(
        true,
      );
    });
  });

  describe("parseIdSlugParam", () => {
    it("should parse UUID with slug correctly", () => {
      const param = "a1b2c3d4-e5f6-7890-abcd-ef1234567890-apartamento-moderno";
      const { id, slug } = parseIdSlugParam(param);
      expect(id).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
      expect(slug).toBe("apartamento-moderno");
    });

    it("should parse simple ID with slug", () => {
      const param = "123-apartamento-moderno";
      const { id, slug } = parseIdSlugParam(param);
      expect(id).toBe("123");
      expect(slug).toBe("apartamento-moderno");
    });

    it("should handle slugs with multiple hyphens", () => {
      const param =
        "a1b2c3d4-e5f6-7890-abcd-ef1234567890-villa-con-piscina-sector-privado";
      const { id, slug } = parseIdSlugParam(param);
      expect(id).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
      expect(slug).toBe("villa-con-piscina-sector-privado");
    });

    it("should handle ID without slug", () => {
      const param = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      const { id, slug } = parseIdSlugParam(param);
      expect(id).toBe("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
      expect(slug).toBe("");
    });
  });
});
