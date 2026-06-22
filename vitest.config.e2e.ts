import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "e2e",
    globals: true,
    environment: "jsdom",
    include: ["tests/e2e/**/*.test.{ts,tsx,js,jsx}"],
    setupFiles: ["tests/e2e/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
    },
  },
});
