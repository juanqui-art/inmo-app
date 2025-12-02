import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        ".next/",
        "vitest.config.ts",
        "vitest.setup.ts",
        "**/*.d.ts",
        "**/__tests__/**",
        "**/*.config.{ts,js}",
        "**/types/**",
      ],
      thresholds: {
        lines: 25,
        functions: 20,
        branches: 20,
        statements: 25,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
