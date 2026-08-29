import { CHIPS } from "../../terminal/commands";
import type { Block } from "../../terminal/model";
import type { HeroTerminalCopy } from "../../types";

/**
 * The CV, expressed as a source tree.
 *
 * Every entry is a real route into the shell: the tree and the tab strip are
 * both built from this list, so the mouse-driven path and the typed one can
 * never drift apart. Display names are FILENAMES, not prose — they are derived
 * from `hero.terminal.headers`, which means they arrive translated ("O mne"
 * becomes `o-mne.md`) without a single new message key.
 */
export type FileKind = "md" | "json" | "pdf" | "folder";

export interface HeroFile {
  /** The command a click runs. */
  cmd: string;
  /** What the row shows — a path fragment, derived from the section title. */
  name: string;
  kind: FileKind;
  /** The plain-English line from `hero.terminal.help`, used as the tooltip. */
  hint: string;
}

/** "O mne" → "o-mne". Diacritics are folded so the result still reads as a path. */
export const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const buildFiles = (copy: HeroTerminalCopy): HeroFile[] => {
  const { headers, help } = copy;
  return [
    { cmd: "about", name: `${slug(headers.about)}.md`, kind: "md", hint: help.about },
    { cmd: "projects", name: `${slug(headers.projects)}/`, kind: "folder", hint: help.projects },
    { cmd: "experience", name: `${slug(headers.experience)}.md`, kind: "md", hint: help.experience },
    { cmd: "skills", name: `${slug(headers.skills)}.json`, kind: "json", hint: help.skills },
    { cmd: "certifications", name: `${slug(headers.certifications)}.md`, kind: "md", hint: help.certifications },
    { cmd: "languages", name: `${slug(headers.languages)}.json`, kind: "json", hint: help.languages },
    { cmd: "contact", name: `${slug(headers.contact)}.md`, kind: "md", hint: help.contact },
    { cmd: "cv", name: "cv.pdf", kind: "pdf", hint: help.cv },
  ];
};

/**
 * The tab strip carries CHIPS — the engine's own answer to "which routes must
 * always be visible". That matters on mobile, where the tree is hidden and the
 * tabs are the only labelled navigation left.
 */
export const tabFiles = (files: HeroFile[]): HeroFile[] =>
  CHIPS.map((cmd) => files.find((f) => f.cmd === cmd)).filter(
    (f): f is HeroFile => f !== undefined
  );

/**
 * Which file the buffer is showing, read back off the newest echoed command —
 * so the highlighted tab follows typing, tree clicks and links inside the
 * output alike, with no second source of truth to keep in sync.
 */
export const activeCommand = (blocks: Block[]): string | null => {
  for (let i = blocks.length - 1; i >= 0; i -= 1) {
    const command = blocks[i].command;
    if (!command) continue;
    const head = command.trim().split(/\s+/)[0].toLowerCase();
    return head === "open" ? "projects" : head;
  }
  return null;
};

/** One gutter number per printed line, plus a little slack below the fold. */
export const gutterLineCount = (blocks: Block[]): number => {
  const printed = blocks.reduce(
    (total, block) => total + block.lines.length + (block.command === null ? 0 : 1) + 1,
    0
  );
  return Math.max(24, printed + 4);
};
