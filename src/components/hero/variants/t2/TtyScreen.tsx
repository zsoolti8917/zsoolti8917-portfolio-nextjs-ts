import { recursiveMono } from "../../fonts";
import {
  TerminalChips,
  TerminalInput,
  TerminalLog,
  TerminalShell,
} from "../../terminal/parts";
import { useTerminal } from "../../terminal/useTerminal";
import type { HeroTerminalCopy } from "../../types";
import { TtyStatusLine } from "./TtyStatusLine";

/**
 * The screen itself: full-bleed, square-cornered, no card.
 *
 * Structurally the inverse of `terminal/Terminal.tsx`. There is no window, so
 * there is no border, no radius and no title bar; the only chrome is a status
 * line at the top and a prompt bar welded to the bottom edge of the hero. The
 * scrollback is whatever is left between them, which in a `tall` section is a
 * lot — this variant deliberately has the deepest log of the five.
 *
 * The chips sit in the bottom bar WITH the prompt rather than under the log:
 * they must stay out of the scrollback (in the output they would scroll away,
 * and `clear` would leave a visitor with no visible way forward), and putting
 * them in the same bar keeps every control the visitor can touch on one edge.
 * The prompt is last, so the caret really is on the bottom line of the screen.
 *
 * Everything rendered here is server-rendered: `useTerminal` seeds the boot
 * banner and the result of `about` synchronously, so the name, the role and the
 * summary are in the HTML before any JavaScript runs.
 */
const GUTTER = "px-4 md:px-8 lg:px-12";

export const TtyScreen = ({ copy }: { copy: HeroTerminalCopy }) => {
  const term = useTerminal(copy);

  return (
    <TerminalShell className={`${recursiveMono.variable} flex-1`}>
      <TtyStatusLine copy={copy} className={GUTTER} />

      {/*
        The scrollback. The fade is an overlay rather than a `mask-image` so it
        cannot interfere with the scroll container's own compositing, and it is
        `pointer-events-none` so clicking near the top still focuses the input.
        `from-zinc-900` with no `to-*` lets Tailwind fade to the SAME colour at
        zero alpha — `to-transparent` would interpolate through black and leave
        a grey bruise across the top of the log.
      */}
      <div className="relative flex min-h-[12rem] flex-1 flex-col sm:min-h-[15rem] md:min-h-[22rem]">
        <TerminalLog term={term} copy={copy} className={`flex-1 pb-8 pt-7 ${GUTTER}`} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-900"
        />
      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950/60 text-[13px]">
        <TerminalChips term={term} copy={copy} className={`pt-3 ${GUTTER}`} />
        <TerminalInput term={term} copy={copy} className={`pb-4 pt-3 md:pb-5 ${GUTTER}`} />
      </div>
    </TerminalShell>
  );
};
