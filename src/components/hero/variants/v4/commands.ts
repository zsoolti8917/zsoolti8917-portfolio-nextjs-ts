import type { HeroV4Copy } from "../../types";

/** How a line is coloured. Purely presentational — the view owns the classes. */
export type Tone = "boot" | "echo" | "out" | "head" | "muted" | "error";

export interface TerminalLine {
  id: number;
  text: string;
  tone: Tone;
}

/** A line before the buffer stamps an id on it. */
export type DraftLine = Omit<TerminalLine, "id">;

/** Side effects live outside this module so every command stays pure. */
export type CommandEffect = "cv" | "contact" | "gui" | "clear";

export interface CommandResult {
  lines: DraftLine[];
  effect?: CommandEffect;
}

/**
 * Everything a command is allowed to read. `projects` and `stack` are handed
 * in by the view from the SAME sources the rest of the page renders
 * (`PROJECTS` + the `projects` namespace, `useHeroStats().stack`), which is
 * the whole point of the variant: the shell cannot drift from the site.
 */
export interface CommandContext {
  copy: HeroV4Copy;
  /** Project titles in `PROJECTS` order — curated and ordered, not Object.keys. */
  projects: string[];
  /** `useHeroStats().stack`, i.e. the exact groups the About section prints. */
  stack: { label: string; items: string[] }[];
  /** ICU-formatted `v4.notFound`. Never string replacement. */
  notFound: (cmd: string) => string;
}

/** Commands `help` documents — exactly the keys `HeroV4Copy.help` carries. */
type HelpKey = Exclude<keyof HeroV4Copy["help"], "intro">;

const DOCUMENTED: HelpKey[] = ["whoami", "ls", "stack", "cv", "contact", "gui"];

/** What the visitor actually types, which is not always the dispatch name. */
const LABELS: Record<HelpKey, string> = {
  whoami: "whoami",
  ls: "ls projects",
  stack: "stack",
  cv: "cv",
  contact: "contact",
  gui: "gui",
};

/** The Tab-completion set. `clear` is deliberately absent — see runCommand. */
export const COMMANDS: string[] = ["help", ...DOCUMENTED];

/** Chips for touch users. Not `help` (they can't read a keyboard hint) or `gui`. */
export const TOUCH_COMMANDS: string[] = ["whoami", "ls", "stack", "cv", "contact"];

const out = (text: string): DraftLine => ({ text, tone: "out" });

const helpLines = (copy: HeroV4Copy): DraftLine[] => {
  const width = Math.max(...DOCUMENTED.map((k) => LABELS[k].length)) + 2;
  return [
    { text: copy.help.intro, tone: "head" },
    ...DOCUMENTED.map((k) => out(`  ${LABELS[k].padEnd(width)}${copy.help[k]}`)),
  ];
};

const lsLines = (ctx: CommandContext): DraftLine[] => [
  { text: ctx.copy.lsHeader, tone: "head" },
  ...ctx.projects.map((title) => out(`  ${title}`)),
];

const stackLines = (ctx: CommandContext): DraftLine[] => [
  { text: ctx.copy.stackHeader, tone: "head" },
  ...ctx.stack.flatMap((group): DraftLine[] => [
    { text: `  ${group.label}`, tone: "muted" },
    out(`    ${group.items.join(" · ")}`),
  ]),
];

/**
 * The state machine's only decision point: `(string, ctx) => lines + effect`.
 * No React, no DOM, no timers — so it can be exercised directly.
 */
export const runCommand = (raw: string, ctx: CommandContext): CommandResult => {
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [] };

  const cmd = trimmed.split(/\s+/)[0].toLowerCase();

  switch (cmd) {
    case "help":
      return { lines: helpLines(ctx.copy) };
    case "whoami":
      return { lines: ctx.copy.whoami.map(out) };
    // Bare `ls` is accepted, and so is any argument: a portfolio shell that
    // scolds you for `ls -la` is a worse shell than one that just lists.
    case "ls":
      return { lines: lsLines(ctx) };
    case "stack":
      return { lines: stackLines(ctx) };
    case "cv":
      return { lines: [out(ctx.copy.cvLine)], effect: "cv" };
    case "contact":
      return { lines: ctx.copy.contactLines.map(out), effect: "contact" };
    case "gui":
      return { lines: [{ text: ctx.copy.guiLeaving, tone: "muted" }], effect: "gui" };
    // Undocumented alias for Ctrl+L. Muscle memory for anyone who would type
    // in here at all, and it needs no string of its own.
    case "clear":
      return { lines: [], effect: "clear" };
    default:
      return { lines: [{ text: ctx.notFound(cmd), tone: "error" }] };
  }
};

const commonPrefix = (values: string[]) =>
  values.reduce((acc, value) => {
    let i = 0;
    while (i < acc.length && i < value.length && acc[i] === value[i]) i += 1;
    return acc.slice(0, i);
  });

/**
 * Tab completion over the command names only. Once there is a space the
 * visitor is typing an argument and the shell stays out of the way.
 */
export const complete = (
  value: string
): { value: string; suggestions: string[] } => {
  if (/\s/.test(value.trim()) || value !== value.trimStart()) {
    return { value, suggestions: [] };
  }

  const prefix = value.toLowerCase();
  const matches = COMMANDS.filter((c) => c.startsWith(prefix));

  if (matches.length === 0) return { value, suggestions: [] };
  if (matches.length === 1) return { value: matches[0], suggestions: [] };
  return { value: commonPrefix(matches), suggestions: matches };
};
