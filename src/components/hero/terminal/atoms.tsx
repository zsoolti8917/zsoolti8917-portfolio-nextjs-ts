import type { CSSProperties } from "react";
import type { Segment } from "./model";

/**
 * The two clickable shapes the shell uses, in one place so the scrollback, the
 * card and the chips row cannot drift apart.
 */

/** Chips, and the card's `[contact]` / `[cv ↓]` actions. The pill IS the bracket. */
export const PILL =
  "shrink-0 rounded-full border border-hairline bg-surface-2 px-3 py-1 font-mono mono-1 text-xs text-fg-2 transition-colors hover:border-accent/60 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/** A runnable noun inside printed output. */
export const LINK =
  "rounded-sm text-accent-hover underline decoration-accent/30 underline-offset-4 transition-colors hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

/** Per-line stagger index for the `.term-line` keyframes. */
export const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * A segment is a button when it can run a command, an anchor when it points
 * somewhere, and plain text otherwise. This is the whole reason a visitor can
 * traverse the entire CV with a mouse and never type a character.
 */
export const Seg = ({
  segment,
  onRun,
  plainClassName,
}: {
  segment: Segment;
  onRun: (cmd: string) => void;
  /** Applied to non-clickable text — the connective tissue between links. */
  plainClassName?: string;
}) => {
  if (segment.run) {
    return (
      <button type="button" onClick={() => onRun(segment.run as string)} className={LINK}>
        {segment.text}
      </button>
    );
  }
  if (segment.href) {
    return (
      <a href={segment.href} target="_blank" rel="noreferrer nofollow" className={LINK}>
        {segment.text}
      </a>
    );
  }
  return <span className={plainClassName}>{segment.text}</span>;
};
