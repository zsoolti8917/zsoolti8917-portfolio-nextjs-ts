import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The three catalogues have no fallback: a key present in en.json but missing
 * from sk.json is a runtime error on /sk, not a quietly-English string
 * (README, "Locales"). These tests move that failure to `npm test`.
 */
const DIR = join(fileURLToPath(import.meta.url), "..");
const ROOT = join(DIR, "..", "..");

const load = (locale: string) =>
  JSON.parse(readFileSync(join(DIR, `${locale}.json`), "utf8"));

/**
 * Every path at which a value sits, with objects contributing their key sets
 * and arrays their length — so a missing key, an extra key, or a list of a
 * different shape all show up as a named path in the diff.
 */
const shapePaths = (value: unknown, prefix = ""): string[] => {
  if (Array.isArray(value)) {
    return [
      `${prefix}[length=${value.length}]`,
      ...value.flatMap((item, i) => shapePaths(item, `${prefix}[${i}]`)),
    ];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      shapePaths(child, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [prefix];
};

describe("message catalogues", () => {
  const en = load("en");

  it.each(["sk", "hu"])("%s.json has exactly en.json's shape", (locale) => {
    expect(shapePaths(load(locale)).sort()).toEqual(shapePaths(en).sort());
  });

  it("has copy for every key in the curated PROJECTS list", () => {
    // Textual on purpose: scripts/build-llm-assets.mjs evaluates the same
    // literal, and importing the .tsx here would drag in React.
    const source = readFileSync(
      join(ROOT, "src", "components", "projects", "Projects.tsx"),
      "utf8"
    );
    const keys = Array.from(source.matchAll(/\bkey: "([^"]+)"/g), (m) => m[1]);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(en.projects, `projects.${key} missing from en.json`).toHaveProperty(
        key
      );
    }
  });
});
