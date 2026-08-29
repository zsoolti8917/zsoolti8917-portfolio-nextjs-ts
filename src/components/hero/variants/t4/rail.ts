import { COMMANDS } from "../../terminal/commands";
import type { Block } from "../../terminal/model";
import type { HeroTerminalCopy } from "../../types";

export type RailCommand = (typeof COMMANDS)[number];

type HelpKey = keyof HeroTerminalCopy["help"];

/**
 * Every verb in `COMMANDS`, paired with the plain-English line `help` already
 * prints for it.
 *
 * Exhaustive by type on purpose: `Record<RailCommand, …>` means a verb added to
 * `COMMANDS` without a description here fails the build instead of shipping a
 * rail row with a blank right-hand column. That matters more in this variant
 * than anywhere else — the rail IS the affordance, so a row that explains
 * nothing is a route the visitor will not take.
 *
 * `help` is the single verb with no line of its own in `hero.terminal.help`.
 * It borrows `intro`, which is literally the sentence it prints as its own
 * header, so the rail stays honest without inventing copy.
 */
export const RAIL_HELP_KEY: Record<RailCommand, HelpKey> = {
  about: "about",
  projects: "projects",
  experience: "experience",
  skills: "skills",
  certifications: "certifications",
  languages: "languages",
  contact: "contact",
  cv: "cv",
  find: "find",
  help: "help",
  clear: "clear",
};

/**
 * `find` is the one verb a button cannot express: it needs a word. The rail
 * shows the shell's own usage token — the same one `help` prints — and the
 * click hands the visitor a primed prompt rather than a dead end.
 */
export const RAIL_LABEL: Partial<Record<RailCommand, string>> = {
  find: "find <word>",
};

export interface ActiveCommand {
  /** Exactly what ran, e.g. `open coffece`. The pane header shows this. */
  raw: string | null;
  /** Which rail row lights up. `null` after `clear`. */
  rail: RailCommand | null;
}

const RAIL_COMMANDS = new Set<string>(COMMANDS);

/**
 * Derived from the log, never stored. One source of truth means the highlight
 * cannot drift from what is actually on screen — including on the server,
 * where the last block is the demo `about` and the rail renders lit already.
 */
export const activeCommand = (blocks: Block[]): ActiveCommand => {
  const raw = blocks[blocks.length - 1]?.command ?? null;
  if (!raw) return { raw: null, rail: null };

  // `open <project>` is what a click inside the projects listing runs; it is
  // still the projects route as far as the rail is concerned.
  const head = raw.trim().split(/\s+/)[0].toLowerCase();
  const rail = head === "open" ? "projects" : head;

  return { raw, rail: RAIL_COMMANDS.has(rail) ? (rail as RailCommand) : null };
};
