import { describe, expect, it } from "vitest";
import { CHIPS, COMMANDS } from "../hero/terminal/commands";
import { searchPalette, type PaletteItem, type PaletteSources } from "./search";

/**
 * `commands` is fed the real `COMMANDS` tuple on purpose: the palette must pick
 * up a command the terminal adds later (WP1's `whoami`) without a change here.
 */
const sources: PaletteSources = {
  sections: [
    { id: "about", label: "About" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" },
  ],
  projects: [
    { key: "ragSystem", title: "RAG system", tech: ["Python", "LangChain"] },
    { key: "coffece", title: "Coffece", tech: ["Next.js", "Strapi"] },
  ],
  jobs: [
    { key: "serco", label: "Software Developer — Serco Czech Republic s.r.o." },
    { key: "galileo", label: "Web Developer — Galileo Corporation s.r.o" },
  ],
  commands: COMMANDS,
  actions: [
    { id: "cv", label: "Download CV", keywords: ["cv", "resume", "pdf", "download"] },
    { id: "copyEmail", label: "Copy email", keywords: ["email", "copy", "dev@zsoltvarju.com"] },
  ],
  locales: [
    { code: "en", label: "English" },
    { code: "sk", label: "Slovak" },
    { code: "hu", label: "Hungarian" },
  ],
};

const ids = (items: PaletteItem[]) => items.map((i) => i.id);
const groups = (items: PaletteItem[]) => Array.from(new Set(items.map((i) => i.group)));

describe("searchPalette — empty query", () => {
  it("shows sections, then the chip commands, then actions", () => {
    const items = searchPalette("", sources);

    expect(groups(items)).toEqual(["sections", "commands", "actions"]);
    expect(ids(items)).toEqual([
      ...sources.sections.map((s) => `section:${s.id}`),
      ...CHIPS.map((c) => `cmd:${c}`),
      ...sources.actions.map((a) => `action:${a.id}`),
    ]);
  });

  it("offers no terminal fallback item", () => {
    expect(searchPalette("   ", sources).some((i) => i.fallback)).toBe(false);
  });
});

describe("searchPalette — ranking", () => {
  it("puts an exact command name first", () => {
    const items = searchPalette("projects", sources);
    expect(items[0].intent).toEqual({ type: "terminal", cmd: "projects" });
  });

  it("resolves a synonym through suggest(): resume → cv", () => {
    const items = searchPalette("resume", sources);
    expect(items[0].intent).toEqual({ type: "terminal", cmd: "cv" });
  });

  it("matches a project by a substring of its title", () => {
    const items = searchPalette("coffec", sources);
    expect(items[0].intent).toEqual({ type: "project", key: "coffece" });
  });

  it("matches an action by a keyword that is not in its label", () => {
    const items = searchPalette("pdf", sources);
    expect(items.map((i) => i.intent)).toContainEqual({ type: "action", id: "cv" });
  });

  it("matches a project by its tech and a job by its label", () => {
    expect(searchPalette("strapi", sources)[0].intent).toEqual({
      type: "project",
      key: "coffece",
    });
    expect(searchPalette("serco", sources)[0].intent).toEqual({ type: "job", key: "serco" });
  });
});

describe("searchPalette — terminal fallback", () => {
  it("offers exactly one item for text that matches nothing", () => {
    const items = searchPalette("zzqqxy", sources);
    expect(items).toHaveLength(1);
    expect(items[0].fallback).toBe(true);
    expect(items[0].intent).toEqual({ type: "terminal", cmd: "zzqqxy" });
    expect(items[0].label).toBe("zzqqxy");
  });

  it("appends the fallback last when other things matched", () => {
    const items = searchPalette("coffec", sources);
    expect(items.at(-1)?.fallback).toBe(true);
  });

  it("drops the fallback once a command matched exactly", () => {
    expect(searchPalette("contact", sources).some((i) => i.fallback)).toBe(false);
  });
});

describe("searchPalette — cap", () => {
  it("returns at most 12 items, fallback included", () => {
    const many: PaletteSources = {
      ...sources,
      projects: Array.from({ length: 20 }, (_, i) => ({
        key: `alpha${i}`,
        title: `Alpha ${i}`,
        tech: ["TypeScript"],
      })),
    };

    const items = searchPalette("alpha", many);
    expect(items).toHaveLength(12);
    expect(items.at(-1)?.fallback).toBe(true);
  });

  it("keeps the cap when an exact command crowds the list", () => {
    const many: PaletteSources = {
      ...sources,
      projects: Array.from({ length: 20 }, (_, i) => ({
        key: `contact${i}`,
        title: `Contact tool ${i}`,
        tech: ["TypeScript"],
      })),
    };

    const items = searchPalette("contact", many);
    expect(items).toHaveLength(12);
    expect(items.some((item) => item.fallback)).toBe(false);
    expect(items[0].intent).toEqual({ type: "terminal", cmd: "contact" });
  });
});
