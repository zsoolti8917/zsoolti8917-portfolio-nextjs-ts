import { useEffect, useRef } from "react";
import { TerminalLog } from "../../terminal/parts";
import type { TerminalState } from "../../terminal/parts";
import type { HeroTerminalCopy } from "../../types";
import { gutterLineCount } from "./files";

/**
 * The scrollback, dressed as a file buffer: roomier leading than a console
 * would use, and a gutter of line numbers down the left.
 *
 * The numbers are decoration. They are `aria-hidden` so the log is not read
 * out as arithmetic, `select-none` so dragging across the pane copies the CV
 * and not a column of integers, and `pointer-events-none` so a click still
 * lands on the log and focuses the prompt.
 *
 * They ride the log's own scroll via a transform rather than a second scroll
 * container — one scrollbar, no rAF, and the listener is removed on unmount so
 * StrictMode's double-invoke leaves nothing behind.
 */
export const EditorBuffer = ({
  term,
  copy,
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
}) => {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = gutterLineCount(term.blocks);

  useEffect(() => {
    const log = term.logRef.current;
    const gutter = gutterRef.current;
    if (!log || !gutter) return;

    const sync = () => {
      gutter.style.transform = `translateY(${-log.scrollTop}px)`;
    };
    sync();
    log.addEventListener("scroll", sync, { passive: true });
    return () => log.removeEventListener("scroll", sync);
  }, [term.logRef]);

  return (
    <div className="relative min-h-[19rem] flex-1 bg-zinc-900 md:min-h-[24rem]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-8 select-none overflow-hidden border-r border-zinc-800/60 bg-zinc-950/30 sm:w-11"
      >
        <div ref={gutterRef} className="pt-3">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className="h-7 pr-2 text-right text-[11px] leading-7 text-zinc-700 tabular-nums"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/*
        `[&_p]:leading-7` and `[&_article]:mb-7` outrank the log's own leading
        and block gap on specificity, which is what keeps the printed lines on
        the same 28px rhythm as the gutter beside them.
      */}
      <TerminalLog
        term={term}
        copy={copy}
        className="absolute inset-0 py-3 pl-11 pr-3 [&_article]:mb-7 [&_p]:leading-7 sm:pl-14 sm:pr-4"
      />
    </div>
  );
};
