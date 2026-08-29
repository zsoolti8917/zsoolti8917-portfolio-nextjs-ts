import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Unit tests only — the terminal parser, the palette filter and the CV/LLM
 * helpers. `environment: "node"` keeps them fast; anything needing a DOM
 * belongs in a browser test, not here.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
