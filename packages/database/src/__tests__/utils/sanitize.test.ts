/**
 * INPUT SANITIZATION TESTS
 *
 * Tests for DOMPurify-based sanitization utilities
 * Ensures XSS protection across all user input fields
 */

import { describe, expect, it } from "vitest";
import {
  sanitizeHTML,
  sanitizePlainText,
  sanitizeOptional,
  sanitizeArray,
  sanitizeObject,
} from "../../utils/sanitize";

describe("sanitizeHTML", () => {
  it("should remove script tags", () => {
    const dirty = 'Casa hermosa <script>alert("XSS")</script> con jardín';
    const clean = sanitizeHTML(dirty);

    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
    expect(clean).toContain("Casa hermosa");
    expect(clean).toContain("con jardín");
  });

  it("should remove event handlers", () => {
    const dirty = '<div onclick="alert(1)">Click me</div>';
    const clean = sanitizeHTML(dirty);

    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("alert(1)");
  });

  it("should remove onerror attributes", () => {
    const dirty = '<img src=x onerror="alert(1)">';
    const clean = sanitizeHTML(dirty);

    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("alert");
  });

  it("should allow safe formatting tags", () => {
    const dirty = "Casa <b>hermosa</b> con <i>jardín</i> y <em>piscina</em>";
    const clean = sanitizeHTML(dirty);

    expect(clean).toContain("<b>hermosa</b>");
    expect(clean).toContain("<i>jardín</i>");
    expect(clean).toContain("<em>piscina</em>");
  });

  it("should allow safe links with href", () => {
    const dirty = 'Ver más en <a href="https://example.com">nuestro sitio</a>';
    const clean = sanitizeHTML(dirty);

    expect(clean).toContain("<a");
    expect(clean).toContain('href="https://example.com"');
    expect(clean).toContain("nuestro sitio</a>");
  });

  it("should remove javascript: protocol from links", () => {
    const dirty = '<a href="javascript:alert(1)">Click</a>';
    const clean = sanitizeHTML(dirty);

    expect(clean).not.toContain("javascript:");
    expect(clean).not.toContain("alert");
  });

  it("should allow paragraph and line break tags", () => {
    const dirty = "<p>Casa hermosa</p><br><p>Con jardín</p>";
    const clean = sanitizeHTML(dirty);

    expect(clean).toContain("<p>Casa hermosa</p>");
    expect(clean).toContain("<br>");
    expect(clean).toContain("<p>Con jardín</p>");
  });

  it("should allow list tags", () => {
    const dirty = "<ul><li>Cocina</li><li>Baño</li></ul>";
    const clean = sanitizeHTML(dirty);

    expect(clean).toContain("<ul>");
    expect(clean).toContain("<li>Cocina</li>");
    expect(clean).toContain("</ul>");
  });

  it("should remove iframe tags", () => {
    const dirty = 'Casa <iframe src="https://evil.com"></iframe> hermosa';
    const clean = sanitizeHTML(dirty);

    expect(clean).not.toContain("<iframe>");
    expect(clean).not.toContain("evil.com");
  });

  it("should handle empty string", () => {
    const clean = sanitizeHTML("");
    expect(clean).toBe("");
  });

  it("should handle only text (no HTML)", () => {
    const dirty = "Casa hermosa en Cuenca";
    const clean = sanitizeHTML(dirty);

    expect(clean).toBe("Casa hermosa en Cuenca");
  });
});

describe("sanitizePlainText", () => {
  it("should remove all HTML tags", () => {
    const dirty = "Cuenca <b>Ecuador</b> <script>alert(1)</script>";
    const clean = sanitizePlainText(dirty);

    expect(clean).not.toContain("<b>");
    expect(clean).not.toContain("</b>");
    expect(clean).not.toContain("<script>");
    expect(clean).toBe("Cuenca Ecuador ");
  });

  it("should remove inline styles", () => {
    const dirty = '<span style="color: red;">Text</span>';
    const clean = sanitizePlainText(dirty);

    expect(clean).not.toContain("<span>");
    expect(clean).not.toContain("style");
    expect(clean).toBe("Text");
  });

  it("should remove event handlers", () => {
    const dirty = '<div onclick="alert(1)">Click</div>';
    const clean = sanitizePlainText(dirty);

    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("<div>");
    expect(clean).toBe("Click");
  });

  it("should preserve plain text", () => {
    const dirty = "Av. Ordoñez Lasso, Cuenca, Ecuador";
    const clean = sanitizePlainText(dirty);

    expect(clean).toBe("Av. Ordoñez Lasso, Cuenca, Ecuador");
  });

  it("should handle empty string", () => {
    const clean = sanitizePlainText("");
    expect(clean).toBe("");
  });

  it("should handle special characters", () => {
    const dirty = "Casa & Jardín - €150,000";
    const clean = sanitizePlainText(dirty);

    expect(clean).toContain("&");
    expect(clean).toContain("€");
  });
});

describe("sanitizeOptional", () => {
  it("should return null for null input", () => {
    const result = sanitizeOptional(null, sanitizePlainText);
    expect(result).toBeNull();
  });

  it("should return null for undefined input", () => {
    const result = sanitizeOptional(undefined, sanitizePlainText);
    expect(result).toBeNull();
  });

  it("should sanitize valid string with provided sanitizer", () => {
    const result = sanitizeOptional("Cuenca <b>Ecuador</b>", sanitizePlainText);
    expect(result).toBe("Cuenca Ecuador");
  });

  it("should use HTML sanitizer when specified", () => {
    const result = sanitizeOptional("Casa <b>hermosa</b> <script>alert(1)</script>", sanitizeHTML);
    expect(result).toContain("<b>hermosa</b>");
    expect(result).not.toContain("<script>");
  });

  it("should use plain text sanitizer by default", () => {
    const result = sanitizeOptional("Cuenca <b>Ecuador</b>");
    expect(result).not.toContain("<b>");
  });
});

describe("sanitizeArray", () => {
  it("should sanitize all elements in array", () => {
    const dirty = ["casa", "<script>alert(1)</script>", "venta"];
    const clean = sanitizeArray(dirty, sanitizePlainText);

    expect(clean).toEqual(["casa", "", "venta"]);
  });

  it("should handle empty array", () => {
    const clean = sanitizeArray([], sanitizePlainText);
    expect(clean).toEqual([]);
  });

  it("should use custom sanitizer", () => {
    const dirty = ["Casa <b>hermosa</b>", "Jardín <script>alert(1)</script>"];
    const clean = sanitizeArray(dirty, sanitizeHTML);

    expect(clean[0]).toContain("<b>hermosa</b>");
    expect(clean[1]).not.toContain("<script>");
  });
});

describe("sanitizeObject", () => {
  it("should sanitize specified fields", () => {
    const dirty = {
      title: "Casa <b>hermosa</b>",
      description: "Con jardín <script>alert(1)</script>",
      price: 150000,
    };

    const clean = sanitizeObject(dirty, {
      title: sanitizePlainText,
      description: sanitizeHTML,
    });

    expect(clean.title).toBe("Casa hermosa");
    expect(clean.description).toContain("Con jardín");
    expect(clean.description).not.toContain("<script>");
    expect(clean.price).toBe(150000); // Unchanged
  });

  it("should not modify fields not specified", () => {
    const dirty = {
      title: "Casa <b>hermosa</b>",
      price: 150000,
      location: "Cuenca <script>alert(1)</script>",
    };

    const clean = sanitizeObject(dirty, {
      title: sanitizePlainText,
    });

    expect(clean.title).toBe("Casa hermosa");
    expect(clean.price).toBe(150000);
    expect(clean.location).toBe("Cuenca <script>alert(1)</script>"); // Not sanitized
  });

  it("should handle empty object", () => {
    const clean = sanitizeObject({}, {});
    expect(clean).toEqual({});
  });

  it("should handle non-string fields gracefully", () => {
    const dirty = {
      title: "Casa hermosa",
      price: 150000,
      active: true,
    };

    const clean = sanitizeObject(dirty, {
      title: sanitizePlainText,
      price: sanitizePlainText as any, // Try to sanitize number (should skip)
    });

    expect(clean.title).toBe("Casa hermosa");
    expect(clean.price).toBe(150000); // Unchanged (not a string)
    expect(clean.active).toBe(true);
  });
});

describe("XSS Attack Vectors", () => {
  it("should block common XSS patterns", () => {
    const attacks = [
      '<img src=x onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '<iframe src="javascript:alert(1)">',
      '<body onload="alert(1)">',
      '<input onfocus="alert(1)" autofocus>',
      '<select onfocus="alert(1)" autofocus>',
      '<textarea onfocus="alert(1)" autofocus>',
      '<marquee onstart="alert(1)">',
      '<details open ontoggle="alert(1)">',
    ];

    for (const attack of attacks) {
      const clean = sanitizeHTML(attack);
      expect(clean).not.toContain("alert(1)");
      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("onload");
      expect(clean).not.toContain("onfocus");
      expect(clean).not.toContain("onstart");
      expect(clean).not.toContain("ontoggle");
    }
  });

  it("should block CSS injection", () => {
    const attacks = [
      '<div style="background-image: url(javascript:alert(1))">',
      '<style>body{background:url("javascript:alert(1)")}</style>',
    ];

    for (const attack of attacks) {
      const clean = sanitizeHTML(attack);
      expect(clean).not.toContain("javascript:");
      expect(clean).not.toContain("alert(1)");
    }
  });

  it("should block data URI XSS", () => {
    const attack = '<a href="data:text/html,<script>alert(1)</script>">Click</a>';
    const clean = sanitizeHTML(attack);

    expect(clean).not.toContain("data:text/html");
    expect(clean).not.toContain("<script>");
  });
});
