import { defineConfig } from "vitest/config";
import path from "path";

// Tests don't need the SWC React plugin: esbuild's automatic JSX runtime is enough.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
