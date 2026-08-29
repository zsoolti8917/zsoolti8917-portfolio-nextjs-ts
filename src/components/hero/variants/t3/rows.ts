import { CHIPS, COMMANDS, suggest } from "../../terminal/commands";
import type { HeroTerminalCopy } from "../../types";

/**
 * `hero.terminal.help.help` — "the full list of commands" — ships in all three
 * locales, but `hero/types.ts` is shared with the other variants and is not
 * this one's file to edit. Widened locally so the palette prints the real line
 * whatever that key union happens to say.
 */
type Help = HeroTerminalCopy["help"];

export interface PaletteRow {
  /** DOM id, so `aria-activedescendant` can point at this row. */
  id: string;
  /** What gets run (or prefilled) when the row is chosen. */
  command: string;
  /** What the row shows. Same as `command` except for the synthetic find row. */
  label: string;
  /** The plain-English line from `hero.terminal.help`. The whole point. */
  description: string;
  /** Indices of `label` that matched what was typed. Empty when nothing was. */
  match: number[];
  /**
   * Bare `find` only prints its usage line, which is an error in everything
   * but tone. Choosing it prefills `find ` instead and waits for a word.
   */
  prefill: boolean;
}

/**
 * The six a recruiter came for, in the order the chips use, then the rest.
 * The list is capped in height, so this is also the answer to "which six are
 * visible before anyone scrolls".
 */
const ORDER: string[] = [
  ...CHIPS,
  ...COMMANDS.filter((c) => !(CHIPS as readonly string[]).includes(c)),
];

/**
 * The plain-English subtitle for a row — the single most important thing the
 * palette shows, because it is what turns a command into a question a
 * non-technical visitor can recognise. Written as a switch rather than an
 * index so a missing line stays a visible gap and never a silent `undefined`.
 */
const describe = (help: Help, command: string): string => {
  switch (command) {
    case "about":          return help.about;
    case "projects":       return help.projects;
    case "experience":     return help.experience;
    case "skills":         return help.skills;
    case "certifications": return help.certifications;
    case "languages":      return help.languages;
    case "contact":        return help.contact;
    case "cv":             return help.cv;
    case "find":           return help.find;
    case "clear":          return help.clear;
    case "help":           return help.help ?? help.intro;
    default:               return "";
  }
};

/**
 * Substring first — it is what people expect and what highlights cleanly —
 * then subsequence, so `crt` still finds `certifications`. Returns the matched
 * character positions, or null for no match. An empty query matches everything
 * with nothing highlighted, which is what makes the list a menu at rest.
 */
export const matchIndices = (name: string, query: string): number[] | null => {
  if (!query) return [];
  const haystack = name.toLowerCase();
  const needle = query.toLowerCase();

  const at = haystack.indexOf(needle);
  if (at >= 0) {
    const run: number[] = [];
    for (let i = 0; i < needle.length; i += 1) run.push(at + i);
    return run;
  }

  const out: number[] = [];
  let from = 0;
  for (let i = 0; i < needle.length; i += 1) {
    const found = haystack.indexOf(needle[i], from);
    if (found < 0) return null;
    out.push(found);
    from = found + 1;
  }
  return out;
};

/** True once the typed text carries an argument, e.g. `find docker`. */
export const hasArgument = (value: string): boolean => /\s/.test(value.trim());

/**
 * The rows for what is currently typed.
 *
 * Never returns an empty list. If nothing matches by name we fall back to the
 * engine's own `suggest()` — the synonym table, then the typo distance — and
 * then offer to search for the literal text. A visitor can therefore type
 * anything at all and still be looking at something clickable, which is the
 * difference between a palette and a shell that answers "command not found".
 */
export const buildRows = (help: Help, value: string, baseId: string): PaletteRow[] => {
  const query = value.trim();
  // Filter on the first word only, so `find docker` keeps showing `find`.
  const head = query.split(/\s+/)[0] ?? "";

  const make = (command: string, match: number[], label = command): PaletteRow => ({
    id: "",
    command,
    label,
    description: describe(help, command.split(" ")[0]),
    match,
    prefill: command === "find",
  });

  const direct: PaletteRow[] = [];
  for (const command of ORDER) {
    const match = matchIndices(command, head);
    if (match) direct.push(make(command, match));
  }
  // Earliest match wins, so typing `l` surfaces `languages` and not `skills`.
  // Sort is stable and an empty query ranks everything 0, which is what keeps
  // the resting list in ORDER.
  direct.sort((a, b) => (a.match[0] ?? 0) - (b.match[0] ?? 0));

  const rows = direct.length
    ? direct
    : [
        ...suggest(query).map((command) => make(command, [])),
        ...(query ? [make(`find ${query}`, [], `find ${query}`)] : []),
      ];

  return rows.map((row, i) => ({ ...row, id: `${baseId}p${i}` }));
};

export interface LabelChunk {
  text: string;
  hit: boolean;
}

/** Splits a label into matched / unmatched runs, for the highlight. */
export const chunkLabel = (label: string, match: number[]): LabelChunk[] => {
  if (!match.length) return [{ text: label, hit: false }];
  const hits = new Set(match);
  const out: LabelChunk[] = [];
  for (let i = 0; i < label.length; i += 1) {
    const hit = hits.has(i);
    const last = out[out.length - 1];
    if (last && last.hit === hit) last.text += label[i];
    else out.push({ text: label[i], hit });
  }
  return out;
};
