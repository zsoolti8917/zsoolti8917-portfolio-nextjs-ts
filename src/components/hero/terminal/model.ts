/**
 * The output model.
 *
 * Two decisions here carry the whole design:
 *
 * 1. A line is a list of SEGMENTS, not a string, so any noun in any output can
 *    be a button that runs the next command. That is what lets a visitor
 *    traverse the entire CV with a mouse and never type — the "parser-choice
 *    hybrid" that stops a prompt from being, in Emily Short's phrase, a lie.
 *
 * 2. Output is grouped into BLOCKS (one per command, Warp's model) rather than
 *    an undifferentiated scrollback. Each block is an <article> with the
 *    command as its header, which makes long output scannable and gives the
 *    same markup semantic structure for anything reading the DOM.
 */
export type Tone = "boot" | "out" | "head" | "muted" | "error";

export interface Segment {
  text: string;
  /** Clicking runs this command. */
  run?: string;
  /** Clicking opens this URL in a new tab. */
  href?: string;
}

export interface Line {
  tone: Tone;
  segments: Segment[];
}

export interface Block {
  id: number;
  /** The command echoed as the block header. `null` for the boot banner. */
  command: string | null;
  lines: Line[];
}

/** Plain text line. */
export const t = (text: string, tone: Tone = "out"): Line => ({
  tone,
  segments: [{ text }],
});

/** Line assembled from segments, some of which may be clickable. */
export const seg = (segments: Segment[], tone: Tone = "out"): Line => ({
  tone,
  segments,
});

export const blank = (): Line => ({ tone: "out", segments: [{ text: "" }] });

/** Flattens a block to plain text — used for the copy-to-clipboard action. */
export const blockToText = (block: Block): string =>
  [
    block.command ? `$ ${block.command}` : null,
    ...block.lines.map((l) => l.segments.map((s) => s.text).join("")),
  ]
    .filter((v): v is string => v !== null)
    .join("\n");
