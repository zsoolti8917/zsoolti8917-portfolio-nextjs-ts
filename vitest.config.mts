import { defineConfig } from "vitest/config";

/**
 * Unit tests only — the terminal parser, the palette filter and the CV/LLM
 * helpers. `environment: "node"` keeps them fast; anything needing a DOM
 * belongs in a browser test, not here.
 *
 * `resolve.tsconfigPaths` is Vite's own tsconfig-paths resolution (available
 * since Vite 8, which this project's vitest pulls in) — no need for the
 * separate `vite-tsconfig-paths` plugin to resolve `@/*`.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
