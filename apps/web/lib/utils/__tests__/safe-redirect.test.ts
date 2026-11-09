import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "../safe-redirect";

describe("getSafeRedirectPath", () => {
  it("accepts same-origin paths", () => {
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("/propiedades?city=cuenca#map")).toBe(
      "/propiedades?city=cuenca#map",
    );
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "dashboard",
    "",
  ])("rejects %j", (input) => {
    expect(getSafeRedirectPath(input)).toBeNull();
  });

  it("rejects null/undefined", () => {
    expect(getSafeRedirectPath(null)).toBeNull();
    expect(getSafeRedirectPath(undefined)).toBeNull();
  });
});
