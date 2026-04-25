import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**", ".next/**"],
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
