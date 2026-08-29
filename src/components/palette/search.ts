import { CHIPS, suggest } from "../hero/terminal/commands";

/**
 * The ⌘K palette's filter. Deliberately React-free — no hooks, no next-intl, no
 * DOM — so it can be unit-tested in a node environment and so the ranking rules
 * live in one readable place instead of being smeared across a component.
 *
 * It knows nothing about labels or locales either: every string it can show is
 * handed to it in `PaletteSources`, and every item it returns carries a
 * serialisable `intent` that the component turns into a click handler. That
 * split is what keeps the interesting half of the palette testable.
 */

export type PaletteGroup =
  | "sections"
  | "projects"
  | "jobs"
  | "commands"
  | "actions"
  | "locale";

/** What activating an item should do. Data, not a closure — see the note above. */
export type PaletteIntent =
  | { type: "section"; id: string }
  | { type: "project"; key: string }
  | { type: "job"; key: string }
  | { type: "terminal"; cmd: string }
  | { type: "action"; id: string }
  | { type: "locale"; code: string };

export interface PaletteItem {
  id: string;
  group: PaletteGroup;
  label: string;
  /** Right-hand column: an anchor, a tech list, a locale code. Never a sentence. */
  hint?: string;
  keywords: string[];
  intent: PaletteIntent;
  /**
   * The `Run "<query>" in the terminal` escape hatch. Its `label` is the raw
   * query, so the component supplies the translated wrapper.
   */
  fallback?: boolean;
}

export interface PaletteSources {
  sections: { id: string; label: string }[];
  projects: { key: string; title: string; tech: string[] }[];
  jobs: { key: string; label: string }[];
  /** The terminal's announced command set — `COMMANDS` from `commands.ts`. */
  commands: readonly string[];
  actions: { id: string; label: string; keywords: string[] }[];
  locales: { code: string; label: string }[];
}

/** Reading order when nothing outranks anything else. */
const GROUP_ORDER: PaletteGroup[] = [
  "sections",
  "projects",
  "jobs",
  "commands",
  "actions",
  "locale",
];

const EXACT = 0;
const SYNONYM = 1;
const TITLE = 2;
const KEYWORD = 3;
const NO_MATCH = 99;

/** A query earns 12 rows at most, so a long list never buries the footer. */
const LIMIT = 12;

const norm = (value: string) => value.trim().toLowerCase();

/**
 * `suggest()` is built for a shell that must never answer "command not found":
 * when it recognises nothing it still returns a fixed starter set. Probing it
 * with nonsense tells us what that set is, so the palette can tell "the parser
 * understood this" from "the parser gave up" — and only offer the terminal
 * fallback row in the second case.
 */
const GAVE_UP = suggest("qzxjvw").join(" ");

const recognised = (query: string): readonly string[] => {
  // One character is not a typo, it is a prefix: the fuzzy branch would match
  // `cv` for "a" and push a nonsense row to the top of the list.
  if (query.length < 2) return [];
  const hits = suggest(query);
  return hits.join(" ") === GAVE_UP ? [] : hits;
};

const candidates = (sources: PaletteSources): PaletteItem[] => [
  ...sources.sections.map<PaletteItem>((section) => ({
    id: `section:${section.id}`,
    group: "sections",
    label: section.label,
    hint: `#${section.id}`,
    keywords: [section.id],
    intent: { type: "section", id: section.id },
  })),
  ...sources.projects.map<PaletteItem>((project) => ({
    id: `project:${project.key}`,
    group: "projects",
    label: project.title,
    hint: project.tech.slice(0, 2).join(" · "),
    keywords: [project.key, ...project.tech],
    intent: { type: "project", key: project.key },
  })),
  ...sources.jobs.map<PaletteItem>((job) => ({
    id: `job:${job.key}`,
    group: "jobs",
    label: job.label,
    keywords: [job.key],
    intent: { type: "job", key: job.key },
  })),
  ...sources.commands.map<PaletteItem>((cmd) => ({
    id: `cmd:${cmd}`,
    group: "commands",
    label: cmd,
    keywords: [],
    intent: { type: "terminal", cmd },
  })),
  ...sources.actions.map<PaletteItem>((action) => ({
    id: `action:${action.id}`,
    group: "actions",
    label: action.label,
    keywords: action.keywords,
    intent: { type: "action", id: action.id },
  })),
  ...sources.locales.map<PaletteItem>((locale) => ({
    id: `locale:${locale.code}`,
    group: "locale",
    label: locale.label,
    hint: locale.code.toUpperCase(),
    keywords: [locale.code],
    intent: { type: "locale", code: locale.code },
  })),
];

const rankOf = (item: PaletteItem, query: string, hits: readonly string[]) => {
  if (item.intent.type === "terminal") {
    if (item.intent.cmd === query) return EXACT;
    if (hits.includes(item.intent.cmd)) return SYNONYM;
  }
  if (norm(item.label).includes(query)) return TITLE;
  if (item.keywords.some((keyword) => norm(keyword).includes(query))) return KEYWORD;
  return NO_MATCH;
};

const terminalFallback = (query: string): PaletteItem => ({
  id: "terminal:run",
  group: "commands",
  label: query,
  keywords: [],
  intent: { type: "terminal", cmd: query },
  fallback: true,
});

/**
 * Rows are grouped for display, so the groups are ordered by their best hit
 * rather than the items being interleaved — otherwise an exact command match
 * would split the "Terminal" heading in two.
 */
export const searchPalette = (
  query: string,
  sources: PaletteSources
): PaletteItem[] => {
  const items = candidates(sources);
  const q = norm(query);

  if (!q) {
    const byId = new Map(items.map((item) => [item.id, item]));
    return [
      ...items.filter((item) => item.group === "sections"),
      // The chips, not every command: the empty palette is a menu, not a manual.
      ...CHIPS.map((cmd) => byId.get(`cmd:${cmd}`)).filter(
        (item): item is PaletteItem => item !== undefined
      ),
      ...items.filter((item) => item.group === "actions"),
    ];
  }

  const hits = recognised(q);
  const scored = items
    .map((item) => ({ item, rank: rankOf(item, q, hits) }))
    .filter((entry) => entry.rank !== NO_MATCH);

  const buckets = new Map<PaletteGroup, { item: PaletteItem; rank: number }[]>();
  for (const entry of scored) {
    const bucket = buckets.get(entry.item.group);
    if (bucket) bucket.push(entry);
    else buckets.set(entry.item.group, [entry]);
  }

  // Both sorts rely on Array#sort being stable (guaranteed since ES2019), which
  // is what "within a group keep source order" means here.
  const ordered = GROUP_ORDER.filter((group) => buckets.has(group))
    .map((group) => {
      const entries = buckets.get(group)!.slice().sort((a, b) => a.rank - b.rank);
      return { entries, best: entries[0].rank };
    })
    .sort((a, b) => a.best - b.best)
    .flatMap(({ entries }) => entries.map(({ item }) => item));

  // An exact command already offers "run this"; anything else keeps the escape
  // hatch, always last and always inside the cap.
  const exact = scored.some((entry) => entry.rank === EXACT);
  return exact
    ? ordered.slice(0, LIMIT)
    : [...ordered.slice(0, LIMIT - 1), terminalFallback(query.trim())];
};
