import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SITE_URL, localeUrl } from "./site";

/**
 * The site's canonical origin is zsoltvarju.com — the domain that is actually
 * registered and printed on the CVs. Its predecessor, the never-registered
 * "projects" domain, was baked into the JSON-LD graph, the generated LLM
 * assets and an analytics <script> for two years; an unregistered domain in a
 * script tag is a takeover vector, so nothing shipped may ever reference it
 * again. The literal is assembled from halves so this file passes its own
 * sweep.
 */
const DEAD_DOMAIN = "zsoltvarjuprojects" + ".com";
const ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..", "..");
const LOCALES = ["en", "sk", "hu"]; // mirrors next.config.mjs i18n.locales

const TEXT_EXTENSIONS =
  /\.(ts|tsx|mjs|js|json|txt|md|xml|css|html|webmanifest)$/;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    if (!TEXT_EXTENSIONS.test(name)) return [];
    if (name.endsWith(".test.ts")) return []; // this file names the domain
    return [full];
  });

describe("canonical origin", () => {
  it("is the registered domain", () => {
    expect(SITE_URL).toBe("https://zsoltvarju.com");
  });

  it("appears nowhere as the dead projects domain in shipping files", () => {
    const offenders = ["src", "public", "scripts"]
      .flatMap((d) => walk(join(ROOT, d)))
      .filter((file) => readFileSync(file, "utf8").includes(DEAD_DOMAIN));
    expect(offenders).toEqual([]);
  });
});

describe("sitemap", () => {
  it("lists every locale URL and is announced by robots.txt", () => {
    const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    for (const locale of LOCALES) {
      expect(sitemap).toContain(`<loc>${localeUrl(locale)}</loc>`);
    }
    expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
    const robots = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
