import { describe, expect, it } from "vitest";
import type { HeroCommonCopy, HeroTerminalCopy } from "../types";
import type { TerminalData } from "./useTerminalData";
import {
  COMMANDS,
  SYNONYMS,
  ghostFor,
  runCommand,
  suggest,
  type CommandContext,
} from "./commands";

/**
 * The parser is the one part of the shell with no DOM in it, so it is the one
 * part worth unit-testing. Everything here guards a rule the design depends on:
 * a reduced verb set, a synonym/typo map so unknown input never dead-ends, and
 * output whose nouns are runnable commands.
 */

const common: HeroCommonCopy = {
  name: "Zsolt Varjú",
  role: "Software Developer",
  tagline: "Full-stack developer and platform operator.",
  location: "Prague, CET · EN · SK · HU",
};

const copy: HeroTerminalCopy = {
  prompt: "❯",
  windowTitle: "zsolt@varju — ~/cv — zsh",
  readAsPage: "Read as a page ↓",
  skipLink: "Skip the terminal",
  inputLabel: "Type a command",
  searchPlaceholder: "Search my CV",
  logLabel: "Terminal output",
  hintClick: "or click",
  ghostHint: "press → to accept",
  didYouMean: "didYouMean",
  orClick: "Or click any button.",
  openHint: "Click any project name.",
  moreHint: "Click a role.",
  cvLine: "Opening the CV…",
  findHeader: "findHeader",
  findEmpty: "findEmpty",
  findUsage: "Usage: find <word>",
  status: "open to new roles",
  statusBar: { cwd: "~/cv", hints: "↑↓ history", zone: "Prague" },
  whoami: {
    headline: "I delete work for a living.",
    role: "role",
    now: "now",
    based: "based",
    since: "since",
    stack: "stack",
    statusLabel: "status",
    roleValue: "Software Developer · full-stack + platform operator",
    nowValue: "sole developer on a project for the European Space Agency",
  },
  help: {
    intro: "Commands:",
    help: "the full list",
    whoami: "the card",
    about: "who I am",
    projects: "everything I have built",
    experience: "where I have worked",
    skills: "what I build with",
    certifications: "certifications",
    languages: "languages I speak",
    contact: "how to reach me",
    cv: "download the PDF",
    find: "search everything",
    clear: "clear the screen",
  },
  headers: {
    about: "About",
    projects: "Projects",
    experience: "Experience",
    skills: "Stack",
    certifications: "Certifications",
    languages: "Languages",
    contact: "Contact",
  },
  labels: {
    tech: "Tech",
    link: "Open ↗",
    based: "Based in",
    from: "From",
    since: "In software since",
    back: "← all projects",
  },
};

const data: TerminalData = {
  projects: [
    {
      key: "coffece",
      title: "Coffece",
      tech: ["Next.js", "Docker"],
      description: "A shop.",
      detail: [],
      features: [],
    },
  ],
  jobs: [
    {
      key: "serco",
      company: "Serco",
      title: "Software Developer",
      dates: "2023 — now",
      location: "Prague",
      responsibilities: [],
    },
  ],
  stack: [
    { label: "Languages & frameworks", items: ["TypeScript", "JavaScript", "Python", "Bash"] },
    { label: "Infra & ops", items: ["Docker", "Kubernetes", "Linux", "nginx"] },
  ],
  aiLlm: { title: "AI & LLM", chips: ["RAG"] },
  triedOut: { title: "Tried out", chips: ["Rust"] },
  certifications: [{ name: "CKA", issuer: "CNCF", date: "" }],
  languages: [{ name: "English", level: "C1" }],
  about: {
    intro: "Intro prose.",
    currentWork: "Current work.",
    based: "Prague, CZ",
    from: "Čierna Voda, SK",
    since: "2022",
  },
};

const ctx: CommandContext = {
  copy,
  common,
  data,
  fmt: (key, values) => key + JSON.stringify(values),
};

describe("the announced verb set", () => {
  it("lists whoami as a real command", () => {
    expect(COMMANDS).toContain("whoami");
  });

  it("no longer treats whoami as a synonym for something else", () => {
    expect(SYNONYMS).not.toHaveProperty("whoami");
  });

  it("keeps every synonym pointing at a real command", () => {
    for (const target of Object.values(SYNONYMS)) {
      expect(COMMANDS).toContain(target);
    }
  });
});

describe("suggest", () => {
  it("resolves a synonym a non-technical visitor would type", () => {
    expect(suggest("resume")).toEqual(["cv"]);
  });

  it("resolves a command mentioned inside a sentence", () => {
    expect(suggest("what projects has he built")).toContain("projects");
  });

  it("recovers from a typo with a fuzzy match", () => {
    expect(suggest("porjects")).toContain("projects");
  });

  it("never dead-ends: unknown input still offers a way forward", () => {
    expect(suggest("zzzzzzzzzz")).toEqual(["about", "projects", "contact"]);
  });

  it("maps who to the card", () => {
    expect(suggest("who")).toEqual(["whoami"]);
  });
});

describe("ghostFor", () => {
  it("completes w to whoami", () => {
    expect(ghostFor("w")).toBe("hoami");
  });

  it("offers nothing once the word is complete", () => {
    expect(ghostFor("whoami")).toBe("");
  });

  it("offers nothing for an argument", () => {
    expect(ghostFor("find doc")).toBe("");
  });
});

describe("runCommand('whoami')", () => {
  const lines = runCommand("whoami", ctx).lines;

  it("opens with the name as the page h1", () => {
    expect(lines[0].kind).toBe("h1");
    expect(lines[0].segments[0].text).toBe("Zsolt Varjú");
  });

  it("follows with the headline", () => {
    expect(lines[1].kind).toBe("headline");
    expect(lines[1].segments[0].text).toBe("I delete work for a living.");
  });

  it("prints the labelled key/value rows in order", () => {
    expect(lines.slice(2).map((l) => l.label)).toEqual([
      "role",
      "now",
      "based",
      "since",
      "stack",
      "status",
    ]);
    expect(lines.slice(2, 7).map((l) => l.kind)).toEqual(["kv", "kv", "kv", "kv", "kv"]);
  });

  it("uses the approved ESA phrasing verbatim for the now row", () => {
    const now = lines.find((l) => l.label === "now");
    expect(now?.segments.map((s) => s.text).join("")).toBe(
      "sole developer on a project for the European Space Agency"
    );
  });

  it("takes the based row from the shared location copy", () => {
    const based = lines.find((l) => l.label === "based");
    expect(based?.segments.map((s) => s.text).join("")).toBe("Prague, CET · EN · SK · HU");
  });

  it("takes the since row from the same data the About section renders", () => {
    const since = lines.find((l) => l.label === "since");
    expect(since?.segments.map((s) => s.text).join("")).toBe("2022");
  });

  it("makes every stack item a `find` command, like the skills output", () => {
    const stack = lines.find((l) => l.label === "stack");
    const runnable = stack?.segments.filter((s) => s.run) ?? [];
    expect(runnable.length).toBe(7);
    expect(runnable[0]).toEqual({ text: "TypeScript", run: "find TypeScript" });
    for (const segment of runnable) {
      expect(segment.run).toBe(`find ${segment.text}`);
    }
  });

  it("ends with an actions row whose pills run contact and cv", () => {
    const actions = lines[lines.length - 1];
    expect(actions.kind).toBe("actions");
    expect(actions.segments[0].text).toBe("open to new roles");
    expect(actions.segments.filter((s) => s.run)).toEqual([
      { text: "[contact]", run: "contact" },
      { text: "[cv ↓]", run: "cv" },
    ]);
  });
});

describe("unknown input", () => {
  const result = runCommand("flibbertigibbet", ctx);

  it("answers with did-you-mean rather than a bare error", () => {
    expect(result.lines[0].tone).toBe("error");
    expect(result.lines[0].segments[0].text).toContain("didYouMean");
  });

  it("offers picks that are themselves clickable commands", () => {
    const picks = result.lines
      .slice(1)
      .flatMap((l) => l.segments)
      .filter((s) => s.run);
    expect(picks.length).toBeGreaterThan(0);
    for (const pick of picks) {
      expect(COMMANDS).toContain(pick.run);
    }
  });
});

describe("effects the UI is wired to", () => {
  it("cv opens the PDF", () => {
    expect(runCommand("cv", ctx).effect).toBe("cv");
  });

  it("contact scrolls to the section", () => {
    expect(runCommand("contact", ctx).effect).toBe("contact");
  });

  it("clear empties the scrollback", () => {
    const { lines, effect } = runCommand("clear", ctx);
    expect(effect).toBe("clear");
    expect(lines).toEqual([]);
  });
});

describe("help", () => {
  it("announces whoami first, and every row is runnable", () => {
    const lines = runCommand("help", ctx).lines;
    const rows = lines.slice(1);
    expect(rows[0].segments[1].run).toBe("whoami");
    for (const row of rows) {
      expect(COMMANDS).toContain(row.segments[1].run);
    }
  });
});
